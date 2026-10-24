/**
 * Creates a demo author account linked to a new author profile.
 * Usage: npx tsx scripts/create-demo-author.ts
 */
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { randomBytes } from "node:crypto";
import { authors, users } from "../src/db/schema.ts";
import { closeDB, connectionDB, getDb } from "../src/db/index.ts";

dotenv.config();

async function main() {
  const email = (process.env.DEMO_AUTHOR_EMAIL ?? "author@bookleaf.local").toLowerCase();
  const password = process.env.DEMO_AUTHOR_PASSWORD ?? "BookLeafAuthor!2026";

  await connectionDB();
  const db = getDb();

  const hash = await bcrypt.hash(password, 12);
  const authorId = randomBytes(10).toString("hex").toUpperCase();

  await db.transaction(async (tx) => {
    await tx
      .insert(authors)
      .values({
        authorId,
        name: "Demo Author",
        email,
        phone: null,
        city: "Mumbai",
        joinedDate: new Date().toISOString().slice(0, 10),
      })
      .onConflictDoNothing();

    await tx
      .insert(users)
      .values({
        email,
        passwordHash: hash,
        role: "author",
        authorId,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { passwordHash: hash, role: "author", isActive: true },
      });
  });

  console.log("✓ Author account ready:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  AuthorId: ${authorId}`);
}

main()
  .catch((err) => {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => closeDB());
