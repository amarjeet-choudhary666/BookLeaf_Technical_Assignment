
import {
  pgTable,
  pgEnum,
  varchar,
  text,
  integer,
  numeric,
  date,
  timestamp,
  uuid,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "author",
  "admin",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

export const ticketCategoryEnum = pgEnum("ticket_category", [
  "royalty_payments",
  "isbn_metadata",
  "printing_quality",
  "distribution_availability",
  "book_status_production",
  "general_inquiry",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "critical",
  "high",
  "medium",
  "low",
]);

// Authors
export const authors = pgTable("authors", {
  authorId: varchar("author_id", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 30 }),
  city: varchar("city", { length: 100 }),
  joinedDate: date("joined_date"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow().notNull(),
});

// Books
export const books = pgTable(
  "books",
  {
    bookId: varchar("book_id", { length: 20 }).primaryKey(),

    authorId: varchar("author_id", { length: 20 })
      .notNull()
      .references(() => authors.authorId),

    title: varchar("title", { length: 255 }).notNull(),
    isbn: varchar("isbn", { length: 50 }),
    genre: varchar("genre", { length: 150 }),
    publicationDate: date("publication_date"),
    status: varchar("status", { length: 100 }).notNull(),

    mrp: numeric("mrp", { precision: 10, scale: 2 }),
    authorRoyaltyPerCopy: numeric("author_royalty_per_copy", {
      precision: 10,
      scale: 2,
    }),

    totalCopiesSold: integer("total_copies_sold"),

    totalRoyaltyEarned: numeric("total_royalty_earned", {
      precision: 12,
      scale: 2,
    }),

    royaltyPaid: numeric("royalty_paid", {
      precision: 12,
      scale: 2,
    }),

    royaltyPending: numeric("royalty_pending", {
      precision: 12,
      scale: 2,
    }),

    lastRoyaltyPayoutDate: date("last_royalty_payout_date"),
    printPartner: varchar("print_partner", { length: 100 }),
    availableOn: text("available_on").array(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    index("books_author_id_idx").on(table.authorId),
  ],
);

// Users: authentication and role management
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  passwordHash: text("password_hash").notNull(),

  role: userRoleEnum("role").notNull(),

  authorId: varchar("author_id", { length: 20 })
    .unique()
    .references(() => authors.authorId),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow().notNull(),
});

// Tickets
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ticketNumber: varchar("ticket_number", { length: 30 })
      .notNull()
      .unique(),

    authorId: varchar("author_id", { length: 20 })
      .notNull()
      .references(() => authors.authorId),

    // Null means General / Account Level
    bookId: varchar("book_id", { length: 20 })
      .references(() => books.bookId, {
        onDelete: "set null",
      }),

    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),

    status: ticketStatusEnum("status")
      .default("open")
      .notNull(),

    category: ticketCategoryEnum("category")
      .default("general_inquiry")
      .notNull(),

    priority: ticketPriorityEnum("priority")
      .default("medium")
      .notNull(),

    // AI results, kept separate from admin-approved values
    aiCategory: ticketCategoryEnum("ai_category"),
    aiPriority: ticketPriorityEnum("ai_priority"),
    aiReason: text("ai_reason"),
    aiDraftResponse: text("ai_draft_response"),

    assignedTo: uuid("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),

    attachmentName: varchar("attachment_name", { length: 255 }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("tickets_author_id_idx").on(table.authorId),
    index("tickets_status_idx").on(table.status),
    index("tickets_category_idx").on(table.category),
    index("tickets_priority_idx").on(table.priority),
    index("tickets_assigned_to_idx").on(table.assignedTo),
    index("tickets_created_at_idx").on(table.createdAt),
  ],
);

// Author-visible replies
export const ticketReplies = pgTable(
  "ticket_replies",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),

    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id),

    message: text("message").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    index("ticket_replies_ticket_id_idx").on(table.ticketId),
  ],
);

// Private admin notes
export const ticketInternalNotes = pgTable(
  "ticket_internal_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),

    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id),

    note: text("note").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    index("internal_notes_ticket_id_idx").on(table.ticketId),
  ],
);
