import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { authors, books, users } from "./schema.ts";
import { closeDB, connectionDB, getDb } from "./index.ts";

dotenv.config();

type Row = Record<string, unknown>;

function asRow(value: unknown, label: string): Row {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Row;
}

function field(row: Row, ...names: string[]): { present: boolean; value: unknown } {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(row, name)) {
      return { present: true, value: row[name] };
    }
  }
  return { present: false, value: undefined };
}

function requiredString(row: Row, label: string, ...names: string[]): string {
  const entry = field(row, ...names);
  if (typeof entry.value !== "string" || !entry.value.trim()) {
    throw new Error(`Dataset field "${label}" is required.`);
  }
  return entry.value.trim();
}

function optionalString(row: Row, ...names: string[]): string | null | undefined {
  const entry = field(row, ...names);
  if (!entry.present) return undefined;
  if (entry.value === null || entry.value === "") return null;
  if (typeof entry.value !== "string" && typeof entry.value !== "number") {
    throw new Error(`Dataset field "${names[0]}" must be a string, number, or null.`);
  }
  return String(entry.value);
}

function optionalArray(row: Row, ...names: string[]): string[] | null | undefined {
  const entry = field(row, ...names);
  if (!entry.present) return undefined;
  if (entry.value === null) return null;
  if (!Array.isArray(entry.value) || entry.value.some((item) => typeof item !== "string")) {
    throw new Error(`Dataset field "${names[0]}" must be an array of strings.`);
  }
  return entry.value;
}

function authorRecord(value: unknown): typeof authors.$inferInsert {
  const row = asRow(value, "Author");
  const author: typeof authors.$inferInsert = {
    authorId: requiredString(row, "authorId", "authorId", "author_id", "id"),
    name: requiredString(row, "name", "name", "authorName", "author_name"),
    email: requiredString(row, "email", "email"),
  };
  const phone = optionalString(row, "phone");
  const city = optionalString(row, "city");
  const joinedDate = optionalString(row, "joinedDate", "joined_date");
  if (phone !== undefined) author.phone = phone;
  if (city !== undefined) author.city = city;
  if (joinedDate !== undefined) author.joinedDate = joinedDate;
  return author;
}

function bookRecord(value: unknown): typeof books.$inferInsert {
  const row = asRow(value, "Book");
  const book: typeof books.$inferInsert = {
    bookId: requiredString(row, "bookId", "bookId", "book_id", "id"),
    authorId: requiredString(row, "authorId", "authorId", "author_id"),
    title: requiredString(row, "title", "title", "bookTitle", "book_title"),
    status: requiredString(row, "status", "status", "bookStatus", "book_status"),
  };
  const stringFields = [
    ["isbn", ["isbn"]],
    ["genre", ["genre"]],
    ["publicationDate", ["publicationDate", "publication_date"]],
    ["mrp", ["mrp"]],
    ["authorRoyaltyPerCopy", ["authorRoyaltyPerCopy", "author_royalty_per_copy"]],
    ["totalRoyaltyEarned", ["totalRoyaltyEarned", "total_royalty_earned"]],
    ["royaltyPaid", ["royaltyPaid", "royalty_paid"]],
    ["royaltyPending", ["royaltyPending", "royalty_pending"]],
    ["lastRoyaltyPayoutDate", ["lastRoyaltyPayoutDate", "last_royalty_payout_date"]],
    ["printPartner", ["printPartner", "print_partner"]],
  ] as const;
  for (const [key, names] of stringFields) {
    const value = optionalString(row, ...names);
    if (value !== undefined) {
      (book as Record<string, unknown>)[key] = value;
    }
  }
  const sold = field(row, "totalCopiesSold", "total_copies_sold");
  if (sold.present) {
    if (sold.value === null) {
      (book as Record<string, unknown>).totalCopiesSold = null;
    } else if (typeof sold.value === "number" && Number.isInteger(sold.value)) {
      (book as Record<string, unknown>).totalCopiesSold = sold.value;
    } else {
      throw new Error("Dataset field \"totalCopiesSold\" must be an integer or null.");
    }
  }
  const available = optionalArray(row, "availableOn", "available_on");
  if (available !== undefined) book.availableOn = available;
  return book;
}

async function loadDataset(fileName: string) {
  const absolutePath = path.resolve(process.cwd(), fileName);
  const source = JSON.parse(await readFile(absolutePath, "utf8")) as unknown;
  const root = asRow(source, "Dataset");
  if (!Array.isArray(root.authors)) {
    throw new Error('Dataset must contain an "authors" array.');
  }

  const normalizedAuthors = root.authors.map(authorRecord);
  let rawBooks: unknown[];

  if (Array.isArray(root.books)) {
    rawBooks = root.books;
  } else {
    rawBooks = root.authors.flatMap((authorValue, index) => {
      const authorRow = asRow(authorValue, `Author ${index + 1}`);
      if (!Array.isArray(authorRow.books)) {
        throw new Error(
          'Dataset must contain a top-level "books" array or a "books" array for each author.',
        );
      }

      const authorId = normalizedAuthors[index].authorId;
      return authorRow.books.map((bookValue) => {
        const bookRow = asRow(bookValue, "Book");
        const bookAuthorId = field(bookRow, "authorId", "author_id");
        return bookAuthorId.present ? bookRow : { ...bookRow, author_id: authorId };
      });
    });
  }

  if (normalizedAuthors.length !== 10 || rawBooks.length !== 18) {
    throw new Error(
      `Expected the supplied dataset to contain 10 authors and 18 books; found ${normalizedAuthors.length} and ${rawBooks.length}.`,
    );
  }

  return {
    authors: normalizedAuthors,
    books: rawBooks.map(bookRecord),
  };
}

function assertSafeDevelopmentDatabase() {
  const urlValue = process.env.DATABASE_URL;
  if (!urlValue) throw new Error("DATABASE_URL is required.");

  if (process.env.SKIP_DB_HOST_CHECK === "true") return;

  const hostname = new URL(urlValue).hostname.toLowerCase();
  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error(
      "Refusing to seed a non-local database. Use a local development PostgreSQL database, " +
      "or set SKIP_DB_HOST_CHECK=true to allow seeding a remote database.",
    );
  }
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Seeding is allowed only when NODE_ENV=development.");
  }
}

async function upsertDataset(data: Awaited<ReturnType<typeof loadDataset>>) {
  await getDb().transaction(async (tx) => {
    for (const author of data.authors) {
      const { authorId, ...updates } = author;
      await tx
        .insert(authors)
        .values(author)
        .onConflictDoUpdate({ target: authors.authorId, set: updates });
    }
    for (const book of data.books) {
      const { bookId, ...updates } = book;
      await tx
        .insert(books)
        .values(book)
        .onConflictDoUpdate({ target: books.bookId, set: updates });
    }
  });
}

async function seedDemoAccounts() {
  const adminEmail = (process.env.DEMO_ADMIN_EMAIL ?? "admin@bookleaf.local").toLowerCase();
  const authorEmail = (process.env.DEMO_AUTHOR_EMAIL ?? "author@bookleaf.local").toLowerCase();
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD ?? "BookLeafAdmin!2026";
  const authorPassword = process.env.DEMO_AUTHOR_PASSWORD ?? "BookLeafAuthor!2026";
  if (adminPassword.length < 12 || authorPassword.length < 12) {
    throw new Error("Demo account passwords must be at least 12 characters.");
  }

  const db = getDb();
  const existingDemoAuthor = await db
    .select({ authorId: users.authorId })
    .from(users)
    .where(and(eq(users.email, authorEmail), eq(users.role, "author")))
    .limit(1);
  let demoAuthorId = existingDemoAuthor[0]?.authorId ?? null;
  if (!demoAuthorId) {
    const linkedAuthors = await db
      .select({ authorId: users.authorId })
      .from(users)
      .where(sql`${users.authorId} IS NOT NULL`);
    const linkedIds = linkedAuthors.flatMap((item) => item.authorId ? [item.authorId] : []);
    const availableAuthors = await db
      .select({ authorId: authors.authorId })
      .from(authors)
      .where(linkedIds.length ? notInArray(authors.authorId, linkedIds) : undefined)
      .limit(1);
    demoAuthorId = availableAuthors[0]?.authorId ?? null;
  }
  if (!demoAuthorId) {
    throw new Error("No unlinked dataset author is available for the demo author account.");
  }

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const authorHash = await bcrypt.hash(authorPassword, 12);
  await db
    .insert(users)
    .values({ email: adminEmail, passwordHash: adminHash, role: "admin", authorId: null, isActive: true })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash: adminHash, role: "admin", authorId: null, isActive: true },
    });
  await db
    .insert(users)
    .values({ email: authorEmail, passwordHash: authorHash, role: "author", authorId: demoAuthorId, isActive: true })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash: authorHash, role: "author", authorId: demoAuthorId, isActive: true },
    });
}

async function main() {
  assertSafeDevelopmentDatabase();
  const datasetPath = process.env.BOOKLEAF_DATASET ?? "./data/bookleaf.json";
  const dataset = await loadDataset(datasetPath);
  await connectionDB();
  await upsertDataset(dataset);
  if (process.env.SEED_DEMO_ACCOUNTS !== "false") await seedDemoAccounts();
  console.log(`Seeded ${dataset.authors.length} authors and ${dataset.books.length} books.`);
}

main()
  .catch((error: unknown) => {
    console.error(
      "Seed failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    process.exitCode = 1;
  })
  .finally(async () => closeDB());
