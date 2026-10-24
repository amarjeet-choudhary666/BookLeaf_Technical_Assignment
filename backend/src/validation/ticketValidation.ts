import { z } from "zod";

export const ticketStatuses = ["open", "in_progress", "resolved", "closed"] as const;
export const ticketCategories = [
  "royalty_payments",
  "isbn_metadata",
  "printing_quality",
  "distribution_availability",
  "book_status_production",
  "general_inquiry",
] as const;
export const ticketPriorities = ["critical", "high", "medium", "low"] as const;

const optionalUuid = z.string().uuid().optional();
const pageSchema = z.coerce.number().int().min(1).default(1);
const pageSizeSchema = z.coerce.number().int().min(1).max(100).default(20);

export const createTicketSchema = z
  .object({
    bookId: z.string().trim().min(1).max(20).optional().nullable(),
    subject: z.string().trim().min(3).max(255),
    description: z.string().trim().min(10).max(10_000),
  })
  .strict();

export const replySchema = z
  .object({
    message: z.string().trim().min(1).max(10_000),
  })
  .strict();

export const internalNoteSchema = z
  .object({
    note: z.string().trim().min(1).max(10_000),
  })
  .strict();

export const patchTicketSchema = z
  .object({
    status: z.enum(ticketStatuses).optional(),
    category: z.enum(ticketCategories).optional(),
    priority: z.enum(ticketPriorities).optional(),
    assignedTo: optionalUuid.nullable(),
  })
  .strict()
  .refine((input) => Object.keys(input).length > 0, "Provide at least one field to update.");

export const assignTicketSchema = z
  .object({ adminId: z.string().uuid().nullable() })
  .strict();

export const paginationSchema = z
  .object({
    page: pageSchema,
    pageSize: pageSizeSchema,
    sort: z.enum(["createdAt", "updatedAt", "priority"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export const authorTicketQuerySchema = paginationSchema.extend({
  status: z.enum(ticketStatuses).optional(),
  category: z.enum(ticketCategories).optional(),
  priority: z.enum(ticketPriorities).optional(),
});

export const adminTicketQuerySchema = authorTicketQuerySchema.extend({
  assignedTo: z.string().uuid().optional(),
  authorId: z.string().max(20).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  q: z.string().trim().max(200).optional(),
}).refine(
  (query) => !query.dateFrom || !query.dateTo || query.dateFrom <= query.dateTo,
  { message: "dateFrom must be earlier than or equal to dateTo.", path: ["dateTo"] },
);

export const listQuerySchema = z
  .object({
    page: pageSchema,
    pageSize: pageSizeSchema,
    q: z.string().trim().max(200).optional(),
    authorId: z.string().max(20).optional(),
  })
  .strict();

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type PatchTicketInput = z.infer<typeof patchTicketSchema>;
export type AuthorTicketQuery = z.infer<typeof authorTicketQuerySchema>;
export type AdminTicketQuery = z.infer<typeof adminTicketQuerySchema>;
