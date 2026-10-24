/**
 * One-time script to create a demo admin account.
 * Usage: npx tsx scripts/create-admin.ts
 *
 * Reads credentials from env or uses defaults:
 *   DEMO_ADMIN_EMAIL    (default: admin@bookleaf.local)
 *   DEMO_ADMIN_PASSWORD (default: BookLeafAdmin!2026)
 */
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { users } from "../src/db/schema.ts";
import { closeDB, connectionDB, getDb } from "../src/db/index.ts";

dotenv.config();

async function main() {
  const email = (process.env.DEMO_ADMIN_EMAIL ?? "admin@bookleaf.local").toLowerCase();
  const password = process.env.DEMO_ADMIN_PASSWORD ?? "BookLeafAdmin!2026";

  await connectionDB();
  const db = getDb();

  const hash = await bcrypt.hash(password, 12);

  await db
    .insert(users)
    .values({
      email,
      passwordHash: hash,
      role: "admin",
      authorId: null,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash: hash, role: "admin", authorId: null, isActive: true },
    });

  const [created] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  console.log("✓ Admin account ready:");
  console.log(`  Email:    ${created?.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role:     ${created?.role}`);
}

main()
  .catch((err) => {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => closeDB());
