import { sql } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: PostgresJsDatabase | undefined;
let postgresClient: ReturnType<typeof postgres> | undefined;

export function getDb(): PostgresJsDatabase {
  if (!db) {
    throw new Error("Database is not connected yet. Call connectionDB() first.");
  }

  return db;
}

export async function connectionDB(): Promise<void> {
  if (db) return;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  // The configured Supabase pooler uses transaction mode; disable prepared statements.
  const client = postgres(databaseUrl, { prepare: false });
  const connection = drizzle({ client });

  try {
    await connection.execute(sql`select 1`);
    db = connection;
    postgresClient = client;
    console.log("Database connection established successfully.");
  } catch (error) {
    await client.end({ timeout: 5 });
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  if (!postgresClient) return;
  const client = postgresClient;
  postgresClient = undefined;
  db = undefined;
  await client.end({ timeout: 5 });
}

