import { randomBytes } from "node:crypto";
import { and, asc, count, desc, eq } from "drizzle-orm";
import type { RequestHandler } from "express";
import { books, ticketReplies, tickets, users } from "../db/schema.ts";
import { getDb } from "../db/index.ts";
import { classifyTicket } from "../service/aiService.ts";
import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { getUuidParam } from "../utils/requestParams.ts";
import { emitTicketCreated } from "../service/realtime.ts";
import { toAuthorTicket } from "../utils/ticketDto.ts";
import type {
  AuthorTicketQuery,
  CreateTicketInput,
} from "../validation/ticketValidation.ts";

export const createTicket: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = req.authUser?.authorId;
  if (!authorId) throw new ApiError(403, "This account is not linked to an author profile.");
  const input = req.body as CreateTicketInput;

  let book: { bookId: string; title: string; isbn: string | null; status: string } | null = null;
  if (input.bookId) {
    const [ownedBook] = await getDb()
      .select({
        bookId: books.bookId,
        title: books.title,
        isbn: books.isbn,
        status: books.status,
      })
      .from(books)
      .where(and(eq(books.bookId, input.bookId), eq(books.authorId, authorId)))
      .limit(1);
    if (!ownedBook) throw new ApiError(404, "Book not found for this author.");
    book = ownedBook;
  }

  const ticketNumber = `BL-${new Date().getUTCFullYear()}-${randomBytes(8).toString("hex").toUpperCase()}`;
  const [ticket] = await getDb()
    .insert(tickets)
    .values({
      ticketNumber,
      authorId,
      bookId: book?.bookId ?? null,
      subject: input.subject,
      description: input.description,
    })
    .returning();
  if (!ticket) throw new Error("Ticket creation failed.");

  let updatedTicket = ticket;
  try {
    const ai = await classifyTicket({
      subject: ticket.subject,
      description: ticket.description,
      book,
    });
    const [savedTicket] = await getDb()
      .update(tickets)
      .set({
        category: ai.category,
        priority: ai.priority,
        aiCategory: ai.category,
        aiPriority: ai.priority,
        aiReason: ai.reason,
        aiDraftResponse: ai.suggestedResponse,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticket.id))
      .returning();
    if (savedTicket) updatedTicket = savedTicket;
  } catch {
    // AI is optional: the saved ticket remains available for manual triage.
  }

  emitTicketCreated({
    id: updatedTicket.id,
    ticketNumber: updatedTicket.ticketNumber,
    authorId,
    subject: updatedTicket.subject,
    status: updatedTicket.status,
    createdAt: updatedTicket.createdAt,
  });
  res
    .status(201)
    .json(new ApiResponse(201, { ticket: toAuthorTicket(updatedTicket) }, "Ticket created."));
});

export const listMyTickets: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = req.authUser?.authorId;
  if (!authorId) throw new ApiError(403, "This account is not linked to an author profile.");
  const query = req.validatedQuery as AuthorTicketQuery;
  const filters = [eq(tickets.authorId, authorId)];
  if (query.status) filters.push(eq(tickets.status, query.status));
  if (query.category) filters.push(eq(tickets.category, query.category));
  if (query.priority) filters.push(eq(tickets.priority, query.priority));
  const where = and(...filters);
  let sortColumn;
  if (query.sort === "updatedAt") sortColumn = query.order === "asc" ? asc(tickets.updatedAt) : desc(tickets.updatedAt);
  else if (query.sort === "priority") sortColumn = query.order === "asc" ? asc(tickets.priority) : desc(tickets.priority);
  else sortColumn = query.order === "asc" ? asc(tickets.createdAt) : desc(tickets.createdAt);
  const idSort = query.order === "asc" ? asc(tickets.id) : desc(tickets.id);
  const [[totalRow], rows] = await Promise.all([
    getDb().select({ total: count() }).from(tickets).where(where),
    getDb()
      .select()
      .from(tickets)
      .where(where)
      .orderBy(sortColumn, idSort)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
  ]);
  const total = totalRow?.total ?? 0;

  res.json(
    new ApiResponse(
      200,
      {
        items: rows.map((ticket) => toAuthorTicket(ticket)),
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      },
      "Tickets retrieved.",
    ),
  );
});

export const getMyTicket: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = req.authUser?.authorId;
  if (!authorId) throw new ApiError(403, "This account is not linked to an author profile.");
  const [ticket] = await getDb()
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, getUuidParam(req, "ticketId")), eq(tickets.authorId, authorId)))
    .limit(1);
  if (!ticket) throw new ApiError(404, "Ticket not found.");
  res.json(
    new ApiResponse(200, { ticket: toAuthorTicket(ticket) }, "Ticket retrieved."),
  );
});

export const getMyTicketReplies: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = req.authUser?.authorId;
  if (!authorId) throw new ApiError(403, "This account is not linked to an author profile.");

  // Ownership is checked before reading replies; internal notes live in a
  // different table and are never queried by author-facing handlers.
  const [ownedTicket] = await getDb()
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.id, getUuidParam(req, "ticketId")), eq(tickets.authorId, authorId)))
    .limit(1);
  if (!ownedTicket) throw new ApiError(404, "Ticket not found.");

  const replies = await getDb()
    .select({
      id: ticketReplies.id,
      message: ticketReplies.message,
      createdAt: ticketReplies.createdAt,
      senderRole: users.role,
    })
    .from(ticketReplies)
    .innerJoin(users, eq(ticketReplies.senderId, users.id))
    .where(eq(ticketReplies.ticketId, ownedTicket.id))
    .orderBy(desc(ticketReplies.createdAt), desc(ticketReplies.id));

  res.json(new ApiResponse(200, { items: replies }, "Ticket replies retrieved."));
});
