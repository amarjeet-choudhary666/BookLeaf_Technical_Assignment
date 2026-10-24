import { and, count, desc, eq, ilike } from "drizzle-orm";
import type { RequestHandler } from "express";
import { getDb } from "../db/index.ts";
import { authors, books, tickets } from "../db/schema.ts";
import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { getRouteParam } from "../utils/requestParams.ts";
import { toAuthorTicket } from "../utils/ticketDto.ts";

function getAuthorId(req: Parameters<RequestHandler>[0]): string {
  const authorId = req.authUser?.authorId;
  if (!authorId) throw new ApiError(403, "This account is not linked to an author profile.");
  return authorId;
}

function getPageQuery(req: Parameters<RequestHandler>[0]) {
  return (req.validatedQuery ?? { page: 1, pageSize: 20, sort: "createdAt", order: "desc" }) as {
    page: number;
    pageSize: number;
    q?: string;
  };
}

export const getMyAuthorProfile: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = getAuthorId(req);
  const [author] = await getDb()
    .select()
    .from(authors)
    .where(eq(authors.authorId, authorId))
    .limit(1);
  if (!author) throw new ApiError(404, "Author profile not found.");
  res.json(new ApiResponse(200, { author }, "Author profile retrieved."));
});

export const getMyDashboard: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = getAuthorId(req);
  const db = getDb();
  const [[bookCount], [ticketCount], [openCount], [resolvedCount], recentTickets] =
    await Promise.all([
      db.select({ total: count() }).from(books).where(eq(books.authorId, authorId)),
      db.select({ total: count() }).from(tickets).where(eq(tickets.authorId, authorId)),
      db
        .select({ total: count() })
        .from(tickets)
        .where(and(eq(tickets.authorId, authorId), eq(tickets.status, "open"))),
      db
        .select({ total: count() })
        .from(tickets)
        .where(and(eq(tickets.authorId, authorId), eq(tickets.status, "resolved"))),
      db
        .select()
        .from(tickets)
        .where(eq(tickets.authorId, authorId))
        .orderBy(desc(tickets.updatedAt), desc(tickets.id))
        .limit(5),
    ]);

  res.json(
    new ApiResponse(
      200,
      {
        books: bookCount?.total ?? 0,
        tickets: ticketCount?.total ?? 0,
        openTickets: openCount?.total ?? 0,
        resolvedTickets: resolvedCount?.total ?? 0,
        recentTickets: recentTickets.map((ticket) => toAuthorTicket(ticket)),
      },
      "Author dashboard retrieved.",
    ),
  );
});

export const getMyBooks: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = getAuthorId(req);
  const { page, pageSize, q } = getPageQuery(req);
  const filters = [eq(books.authorId, authorId)];
  if (q) filters.push(ilike(books.title, `%${q}%`));
  const where = and(...filters);

  const [[totalRow], items] = await Promise.all([
    getDb().select({ total: count() }).from(books).where(where),
    getDb()
      .select()
      .from(books)
      .where(where)
      .orderBy(desc(books.createdAt), desc(books.bookId))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
  ]);

  res.json(
    new ApiResponse(
      200,
      {
        items,
        pagination: {
          page,
          pageSize,
          total: totalRow?.total ?? 0,
          totalPages: Math.ceil((totalRow?.total ?? 0) / pageSize),
        },
      },
      "Books retrieved.",
    ),
  );
});

export const getMyBook: RequestHandler = asyncHandler(async (req, res) => {
  const authorId = getAuthorId(req);
  const [book] = await getDb()
    .select()
    .from(books)
    .where(and(eq(books.bookId, getRouteParam(req, "bookId", 20)), eq(books.authorId, authorId)))
    .limit(1);
  if (!book) throw new ApiError(404, "Book not found.");
  res.json(new ApiResponse(200, { book }, "Book retrieved."));
});
