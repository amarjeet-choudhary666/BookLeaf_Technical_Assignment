import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
} from "drizzle-orm";
import type { RequestHandler } from "express";
import { authors, books, ticketInternalNotes, ticketReplies, tickets, users } from "../db/schema.ts";
import { getDb } from "../db/index.ts";
import { classifyTicket, draftTicketResponse } from "../service/aiService.ts";
import { canTransitionTicket } from "../service/ticketWorkflow.ts";
import {
  emitPublicReply,
  emitTicketAssigned,
  emitTicketUpdated,
} from "../service/realtime.ts";
import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { getRouteParam, getUuidParam } from "../utils/requestParams.ts";
import { toAdminTicket } from "../utils/ticketDto.ts";
import type {
  AdminTicketQuery,
  PatchTicketInput,
} from "../validation/ticketValidation.ts";

function adminQuery(req: Parameters<RequestHandler>[0]) {
  return (req.validatedQuery ?? { page: 1, pageSize: 20, sort: "createdAt", order: "desc" }) as {
    page: number;
    pageSize: number;
    sort: "createdAt" | "updatedAt" | "priority";
    order: "asc" | "desc";
    q?: string;
    authorId?: string;
  };
}

async function assertAdminAccount(adminId: string | null | undefined) {
  if (adminId == null) return;
  const [admin] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, adminId), eq(users.role, "admin"), eq(users.isActive, true)))
    .limit(1);
  if (!admin) throw new ApiError(400, "The selected assignee is not an active admin.");
}

async function getTicketContext(ticketId: string) {
  const [row] = await getDb()
    .select({
      ticket: tickets,
      bookTitle: books.title,
      bookIsbn: books.isbn,
      bookStatus: books.status,
    })
    .from(tickets)
    .leftJoin(books, eq(tickets.bookId, books.bookId))
    .where(eq(tickets.id, ticketId))
    .limit(1);
  if (!row) throw new ApiError(404, "Ticket not found.");
  return {
    row,
    context: {
      subject: row.ticket.subject,
      description: row.ticket.description,
      book: row.ticket.bookId
        ? {
            title: row.bookTitle ?? "",
            isbn: row.bookIsbn,
            status: row.bookStatus ?? "",
          }
        : null,
    },
  };
}

export const getAdminDashboard: RequestHandler = asyncHandler(async (_req, res) => {
  const db = getDb();
  const [
    [authorsCount],
    [booksCount],
    [ticketsCount],
    [openCount],
    [progressCount],
    [resolvedCount],
    [closedCount],
  ] = await Promise.all([
    db.select({ total: count() }).from(authors),
    db.select({ total: count() }).from(books),
    db.select({ total: count() }).from(tickets),
    db.select({ total: count() }).from(tickets).where(eq(tickets.status, "open")),
    db.select({ total: count() }).from(tickets).where(eq(tickets.status, "in_progress")),
    db.select({ total: count() }).from(tickets).where(eq(tickets.status, "resolved")),
    db.select({ total: count() }).from(tickets).where(eq(tickets.status, "closed")),
  ]);
  res.json(
    new ApiResponse(
      200,
      {
        authors: authorsCount?.total ?? 0,
        books: booksCount?.total ?? 0,
        tickets: ticketsCount?.total ?? 0,
        ticketsByStatus: {
          open: openCount?.total ?? 0,
          in_progress: progressCount?.total ?? 0,
          resolved: resolvedCount?.total ?? 0,
          closed: closedCount?.total ?? 0,
        },
      },
      "Admin dashboard retrieved.",
    ),
  );
});

export const listAuthors: RequestHandler = asyncHandler(async (req, res) => {
  const query = adminQuery(req);
  const where = query.q
    ? or(ilike(authors.name, `%${query.q}%`), ilike(authors.email, `%${query.q}%`))
    : undefined;
  const [[totalRow], rows] = await Promise.all([
    getDb().select({ total: count() }).from(authors).where(where),
    getDb()
      .select()
      .from(authors)
      .where(where)
      .orderBy(asc(authors.name), asc(authors.authorId))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
  ]);
  const total = totalRow?.total ?? 0;
  res.json(
    new ApiResponse(
      200,
      {
        items: rows,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      },
      "Authors retrieved.",
    ),
  );
});

export const getAuthorDetails: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = getRouteParam(req, "authorId", 20);
  const [author] = await getDb()
    .select()
    .from(authors)
    .where(eq(authors.authorId, authorId))
    .limit(1);
  if (!author) throw new ApiError(404, "Author not found.");
  const [authorBooks, authorTickets] = await Promise.all([
    getDb().select().from(books).where(eq(books.authorId, authorId)).orderBy(asc(books.title)),
    getDb()
      .select()
      .from(tickets)
      .where(eq(tickets.authorId, authorId))
      .orderBy(desc(tickets.updatedAt), desc(tickets.id))
      .limit(50),
  ]);
  res.json(
    new ApiResponse(
      200,
      {
        author,
        books: authorBooks,
        tickets: authorTickets.map((ticket) => toAdminTicket(ticket)),
      },
      "Author details retrieved.",
    ),
  );
});

export const listAdminBooks: RequestHandler = asyncHandler(async (req, res) => {
  const query = adminQuery(req);
  const filters = [];
  if (query.authorId) filters.push(eq(books.authorId, query.authorId));
  if (query.q) filters.push(or(ilike(books.title, `%${query.q}%`), ilike(books.isbn, `%${query.q}%`)));
  const where = filters.length ? and(...filters) : undefined;
  const [[totalRow], rows] = await Promise.all([
    getDb().select({ total: count() }).from(books).where(where),
    getDb()
      .select()
      .from(books)
      .where(where)
      .orderBy(desc(books.createdAt), desc(books.bookId))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
  ]);
  const total = totalRow?.total ?? 0;
  res.json(
    new ApiResponse(
      200,
      {
        items: rows,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      },
      "Books retrieved.",
    ),
  );
});

export const listAdminTickets: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.validatedQuery as AdminTicketQuery;
  const filters = [];
  if (query.status) filters.push(eq(tickets.status, query.status));
  if (query.category) filters.push(eq(tickets.category, query.category));
  if (query.priority) filters.push(eq(tickets.priority, query.priority));
  if (query.assignedTo) filters.push(eq(tickets.assignedTo, query.assignedTo));
  if (query.authorId) filters.push(eq(tickets.authorId, query.authorId));
  if (query.dateFrom) filters.push(gte(tickets.createdAt, query.dateFrom));
  if (query.dateTo) filters.push(lte(tickets.createdAt, query.dateTo));
  if (query.q) {
    filters.push(
      or(
        ilike(tickets.ticketNumber, `%${query.q}%`),
        ilike(tickets.subject, `%${query.q}%`),
        ilike(tickets.description, `%${query.q}%`),
      ),
    );
  }
  const where = filters.length ? and(...filters) : undefined;
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
        items: rows.map((ticket) => toAdminTicket(ticket)),
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

export const getAdminTicket: RequestHandler = asyncHandler(async (req, res) => {
  const { row } = await getTicketContext(getUuidParam(req, "ticketId"));
  const replies = await getDb()
    .select({
      id: ticketReplies.id,
      senderId: ticketReplies.senderId,
      senderRole: users.role,
      message: ticketReplies.message,
      createdAt: ticketReplies.createdAt,
    })
    .from(ticketReplies)
    .innerJoin(users, eq(ticketReplies.senderId, users.id))
    .where(eq(ticketReplies.ticketId, row.ticket.id))
    .orderBy(asc(ticketReplies.createdAt), asc(ticketReplies.id));
  const [author] = await getDb()
    .select({ authorId: authors.authorId, name: authors.name, email: authors.email })
    .from(authors)
    .where(eq(authors.authorId, row.ticket.authorId))
    .limit(1);
  res.json(
    new ApiResponse(
      200,
      {
        ticket: toAdminTicket(row.ticket),
        book: row.ticket.bookId
          ? { bookId: row.ticket.bookId, title: row.bookTitle, isbn: row.bookIsbn }
          : null,
        author: author ?? null,
        replies,
      },
      "Ticket retrieved.",
    ),
  );
});

async function updateAdminTicket(ticketId: string, input: PatchTicketInput) {
  const { row } = await getTicketContext(ticketId);
  const current = row.ticket;
  if (input.status && input.status !== current.status) {
    if (!canTransitionTicket(current.status, input.status)) {
      throw new ApiError(
        400,
        `Ticket cannot transition from ${current.status} to ${input.status}.`,
        [],
        "INVALID_STATUS_TRANSITION",
      );
    }
  }
  if ("assignedTo" in input) await assertAdminAccount(input.assignedTo);

  const now = new Date();
  const update: Partial<typeof tickets.$inferInsert> = { updatedAt: now };
  if (input.status) {
    update.status = input.status;
    if (input.status === "resolved" && current.status !== "resolved") update.resolvedAt = now;
    else if (input.status === "open" || input.status === "in_progress") update.resolvedAt = null;
    else if (input.status === "closed" && !current.resolvedAt) update.resolvedAt = now;
  }
  if (input.category) update.category = input.category;
  if (input.priority) update.priority = input.priority;
  if ("assignedTo" in input) update.assignedTo = input.assignedTo ?? null;

  const [updated] = await getDb()
    .update(tickets)
    .set(update)
    .where(eq(tickets.id, ticketId))
    .returning();
  if (!updated) throw new ApiError(404, "Ticket not found.");

  emitTicketUpdated(updated);
  if (updated.assignedTo !== current.assignedTo) emitTicketAssigned(updated);
  return updated;
}

export const patchAdminTicket: RequestHandler = asyncHandler(async (req, res) => {
  const updated = await updateAdminTicket(
    getUuidParam(req, "ticketId"),
    req.body as PatchTicketInput,
  );
  res.json(
    new ApiResponse(200, { ticket: toAdminTicket(updated) }, "Ticket updated."),
  );
});

export const assignAdminTicket: RequestHandler = asyncHandler(async (req, res) => {
  const { adminId } = req.body as { adminId: string | null };
  const updated = await updateAdminTicket(getUuidParam(req, "ticketId"), { assignedTo: adminId });
  res.json(
    new ApiResponse(200, { ticket: toAdminTicket(updated) }, "Ticket assignment updated."),
  );
});

export const classifyAdminTicket: RequestHandler = asyncHandler(async (req, res) => {
  const { row, context } = await getTicketContext(getUuidParam(req, "ticketId"));
  const suggestion = await classifyTicket(context);
  const [updated] = await getDb()
    .update(tickets)
    .set({
      aiCategory: suggestion.category,
      aiPriority: suggestion.priority,
      aiReason: suggestion.reason,
      aiDraftResponse: suggestion.suggestedResponse,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, row.ticket.id))
    .returning();
  if (!updated) throw new ApiError(404, "Ticket not found.");
  res.json(
    new ApiResponse(
      200,
      {
        suggestion,
        ticket: toAdminTicket(updated),
      },
      "Ticket classification suggestion generated.",
    ),
  );
});

export const draftAdminTicketResponse: RequestHandler = asyncHandler(async (req, res) => {
  const { row, context } = await getTicketContext(getUuidParam(req, "ticketId"));
  const draft = await draftTicketResponse(context, row.ticket.category);
  const [updated] = await getDb()
    .update(tickets)
    .set({ aiDraftResponse: draft, updatedAt: new Date() })
    .where(eq(tickets.id, row.ticket.id))
    .returning();
  if (!updated) throw new ApiError(404, "Ticket not found.");
  res.json(
    new ApiResponse(
      200,
      { draft, ticket: toAdminTicket(updated) },
      "Response draft generated for admin review.",
    ),
  );
});

export const postAdminReply: RequestHandler = asyncHandler(async (req, res) => {
  const ticketId = getUuidParam(req, "ticketId");
  const senderId = req.authUser?.id;
  const authorId = (await getTicketContext(ticketId)).row.ticket.authorId;
  if (!senderId) throw new ApiError(401, "Authentication required.");
  const message = (req.body as { message: string }).message;

  const result = await getDb().transaction(async (tx) => {
    const [reply] = await tx
      .insert(ticketReplies)
      .values({ ticketId, senderId, message })
      .returning();
    if (!reply) throw new Error("Reply could not be saved.");
    await tx.update(tickets).set({ updatedAt: new Date() }).where(eq(tickets.id, ticketId));
    return reply;
  });

  emitPublicReply({
    ticketId,
    authorId,
    id: result.id,
    message: result.message,
    senderId,
    senderRole: "admin",
    createdAt: result.createdAt,
  });
  res
    .status(201)
    .json(new ApiResponse(201, { reply: result }, "Public reply sent."));
});

export const listAdminNotes: RequestHandler = asyncHandler(async (req, res) => {
  const ticketId = getUuidParam(req, "ticketId");
  await getTicketContext(ticketId);
  const items = await getDb()
    .select({
      id: ticketInternalNotes.id,
      ticketId: ticketInternalNotes.ticketId,
      adminId: ticketInternalNotes.adminId,
      note: ticketInternalNotes.note,
      createdAt: ticketInternalNotes.createdAt,
    })
    .from(ticketInternalNotes)
    .where(eq(ticketInternalNotes.ticketId, ticketId))
    .orderBy(asc(ticketInternalNotes.createdAt), asc(ticketInternalNotes.id));
  res.json(new ApiResponse(200, { items }, "Internal notes retrieved."));
});

export const createAdminNote: RequestHandler = asyncHandler(async (req, res) => {
  const ticketId = getUuidParam(req, "ticketId");
  const adminId = req.authUser?.id;
  if (!adminId) throw new ApiError(401, "Authentication required.");
  await getTicketContext(ticketId);
  const note = (req.body as { note: string }).note;
  const [created] = await getDb()
    .insert(ticketInternalNotes)
    .values({ ticketId, adminId, note })
    .returning({
      id: ticketInternalNotes.id,
      ticketId: ticketInternalNotes.ticketId,
      adminId: ticketInternalNotes.adminId,
      note: ticketInternalNotes.note,
      createdAt: ticketInternalNotes.createdAt,
    });
  if (!created) throw new Error("Internal note could not be saved.");
  // Deliberately no ticket update or Socket.IO event: notes are private.
  res
    .status(201)
    .json(new ApiResponse(201, { note: created }, "Internal note created."));
});

