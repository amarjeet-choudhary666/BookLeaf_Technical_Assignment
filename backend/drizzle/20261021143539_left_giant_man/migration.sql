CREATE TYPE "ticket_category" AS ENUM('royalty_payments', 'isbn_metadata', 'printing_quality', 'distribution_availability', 'book_status_production', 'general_inquiry');--> statement-breakpoint
CREATE TYPE "ticket_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('author', 'admin');--> statement-breakpoint
CREATE TABLE "authors" (
	"author_id" varchar(20) PRIMARY KEY,
	"name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"phone" varchar(30),
	"city" varchar(100),
	"joined_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"book_id" varchar(20) PRIMARY KEY,
	"author_id" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"isbn" varchar(50),
	"genre" varchar(150),
	"publication_date" date,
	"status" varchar(100) NOT NULL,
	"mrp" numeric(10,2),
	"author_royalty_per_copy" numeric(10,2),
	"total_copies_sold" integer DEFAULT 0 NOT NULL,
	"total_royalty_earned" numeric(12,2) DEFAULT '0' NOT NULL,
	"royalty_paid" numeric(12,2) DEFAULT '0' NOT NULL,
	"royalty_pending" numeric(12,2) DEFAULT '0' NOT NULL,
	"last_royalty_payout_date" date,
	"print_partner" varchar(100),
	"available_on" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_internal_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ticket_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ticket_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ticket_number" varchar(30) NOT NULL UNIQUE,
	"author_id" varchar(20) NOT NULL,
	"book_id" varchar(20),
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open'::"ticket_status" NOT NULL,
	"category" "ticket_category" DEFAULT 'general_inquiry'::"ticket_category" NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium'::"ticket_priority" NOT NULL,
	"ai_category" "ticket_category",
	"ai_priority" "ticket_priority",
	"ai_reason" text,
	"ai_draft_response" text,
	"assigned_to" uuid,
	"attachment_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"author_id" varchar(20) UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "books_author_id_idx" ON "books" ("author_id");--> statement-breakpoint
CREATE INDEX "internal_notes_ticket_id_idx" ON "ticket_internal_notes" ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_replies_ticket_id_idx" ON "ticket_replies" ("ticket_id");--> statement-breakpoint
CREATE INDEX "tickets_author_id_idx" ON "tickets" ("author_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" ("status");--> statement-breakpoint
CREATE INDEX "tickets_category_idx" ON "tickets" ("category");--> statement-breakpoint
CREATE INDEX "tickets_priority_idx" ON "tickets" ("priority");--> statement-breakpoint
CREATE INDEX "tickets_created_at_idx" ON "tickets" ("created_at");--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_author_id_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("author_id");--> statement-breakpoint
ALTER TABLE "ticket_internal_notes" ADD CONSTRAINT "ticket_internal_notes_ticket_id_tickets_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket_internal_notes" ADD CONSTRAINT "ticket_internal_notes_admin_id_users_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_ticket_id_tickets_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_sender_id_users_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_author_id_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("author_id");--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_book_id_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("book_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_author_id_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("author_id");