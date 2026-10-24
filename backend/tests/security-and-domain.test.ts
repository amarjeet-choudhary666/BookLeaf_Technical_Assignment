import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { requireAdmin } from "../src/middleware/authorization.ts";
import { aiClassificationOutputSchema, classifyTicket } from "../src/service/aiService.ts";
import { canTransitionTicket } from "../src/service/ticketWorkflow.ts";
import { toAuthorAssignmentEvent, toPublicReplyEvent } from "../src/service/realtime.ts";
import { ApiError } from "../src/utils/apiError.ts";
import { toAdminTicket, toAuthorTicket } from "../src/utils/ticketDto.ts";
import {
  adminTicketQuerySchema,
  assignTicketSchema,
  createTicketSchema,
  internalNoteSchema,
  patchTicketSchema,
  replySchema,
} from "../src/validation/ticketValidation.ts";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("authorization and data privacy", () => {
  it("denies author users from admin-only routes", () => {
    const req = {
      authUser: {
        id: "author-user",
        email: "author@example.test",
        role: "author",
        authorId: "author-1",
      },
    } as unknown as Request;
    let received: unknown;
    requireAdmin(req, {} as Response, (error?: unknown) => {
      received = error;
    });
    expect(received).toBeInstanceOf(ApiError);
    expect((received as ApiError).statusCode).toBe(403);
  });

  it("author ticket projection never includes internal notes or AI-only admin fields", () => {
    const ticket = toAuthorTicket({
      id: "ticket-1",
      ticketNumber: "BL-2026-1234",
      authorId: "author-1",
      subject: "Question",
      description: "A question about my book.",
      status: "open",
      category: "general_inquiry",
      priority: "medium",
      aiCategory: "royalty_payments",
      aiPriority: "high",
      aiReason: "Private triage details",
      aiDraftResponse: "An unapproved response",
      assignedTo: "admin-user-id",
      internalNotes: [{ note: "Private internal note" }],
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
    });
    expect(ticket).not.toHaveProperty("internalNotes");
    expect(ticket).not.toHaveProperty("aiDraftResponse");
    expect(ticket).not.toHaveProperty("aiReason");
    expect(ticket).not.toHaveProperty("assignedTo");
  });

  it("admin ticket projection also excludes private notes and unrelated joined fields", () => {
    const ticket = toAdminTicket({
      id: "ticket-1",
      ticketNumber: "BL-2026-1234",
      subject: "Question",
      internalNotes: [{ note: "Private internal note" }],
      passwordHash: "should never be projected",
    });
    expect(ticket).not.toHaveProperty("internalNotes");
    expect(ticket).not.toHaveProperty("passwordHash");
    expect(ticket).toHaveProperty("ticketNumber", "BL-2026-1234");
  });

  it("author-facing Socket.IO payloads omit admin assignment IDs and internal notes", () => {
    const assignedInput = {
      id: "ticket-1",
      updatedAt: new Date(),
      assignedTo: "private-admin-id",
      internalNotes: [{ note: "private" }],
    };
    const replyInput = {
      id: "reply-1",
      message: "We received your request.",
      senderRole: "admin",
      createdAt: new Date(),
      senderId: "private-user-id",
      internalNote: "private",
    } as const;
    const assigned = toAuthorAssignmentEvent(assignedInput);
    const reply = toPublicReplyEvent(replyInput);
    expect(assigned).not.toHaveProperty("assignedTo");
    expect(assigned).not.toHaveProperty("internalNotes");
    expect(reply).not.toHaveProperty("internalNote");
    expect(reply.sender).not.toHaveProperty("id");
  });
});

describe("ticket validation and workflow", () => {
  it("accepts an account-level ticket without a book ID", () => {
    expect(
      createTicketSchema.safeParse({
        subject: "Royalty question",
        description: "Could you explain the quarterly calculation?",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid date range in admin filters", () => {
    const result = adminTicketQuerySchema.safeParse({
      page: "1",
      pageSize: "20",
      dateFrom: "2026-05-01T00:00:00.000Z",
      dateTo: "2026-04-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("accepts the request bodies used by every admin ticket action", () => {
    const adminId = "00000000-0000-4000-8000-000000000001";
    expect(patchTicketSchema.safeParse({ status: "in_progress" }).success).toBe(true);
    expect(patchTicketSchema.safeParse({ category: "isbn_metadata" }).success).toBe(true);
    expect(patchTicketSchema.safeParse({ priority: "high" }).success).toBe(true);
    expect(assignTicketSchema.safeParse({ adminId }).success).toBe(true);
    expect(assignTicketSchema.safeParse({ adminId: null }).success).toBe(true);
    expect(replySchema.safeParse({ message: "We are reviewing your request." }).success).toBe(true);
    expect(internalNoteSchema.safeParse({ note: "Check the publisher record." }).success).toBe(true);
  });

  it("allows only the declared ticket status transitions", () => {
    expect(canTransitionTicket("open", "in_progress")).toBe(true);
    expect(canTransitionTicket("resolved", "closed")).toBe(true);
    expect(canTransitionTicket("closed", "resolved")).toBe(false);
    expect(canTransitionTicket("open", "open")).toBe(true);
  });
});

describe("AI response validation and fallback", () => {
  it("validates structured AI output", () => {
    expect(
      aiClassificationOutputSchema.safeParse({
        category: "isbn_metadata",
        priority: "high",
        reason: "An ISBN mismatch was reported.",
        suggestedResponse: "Thank you for flagging this. We will review the ISBN details.",
      }).success,
    ).toBe(true);
    expect(
      aiClassificationOutputSchema.safeParse({
        category: "made_up_category",
        priority: "urgent",
        reason: "",
        suggestedResponse: "",
      }).success,
    ).toBe(false);
  });

  it("classifies tickets with local policy fallback when no provider key is configured", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await classifyTicket({
      subject: "ISBN is incorrect",
      description: "The ISBN shown for my book does not match the printed edition.",
      book: { title: "Example", isbn: null, status: "published" },
    });
    expect(result.category).toBe("isbn_metadata");
    expect(result.priority).toBe("high");
    expect(result.suggestedResponse).toContain("Thank you");
  });
});
