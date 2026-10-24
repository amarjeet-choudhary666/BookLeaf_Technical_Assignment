ALTER TABLE "books" ALTER COLUMN "total_copies_sold" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "total_copies_sold" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "total_royalty_earned" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "total_royalty_earned" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "royalty_paid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "royalty_paid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "royalty_pending" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "royalty_pending" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "available_on" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "available_on" DROP NOT NULL;