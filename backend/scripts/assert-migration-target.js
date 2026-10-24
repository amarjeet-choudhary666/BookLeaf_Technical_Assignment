import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required before running migrations.");

const hostname = new URL(databaseUrl).hostname.toLowerCase();
const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname);
const safeLocal =
  isLocal && process.env.NODE_ENV !== "production";
const explicitRemoteApproval =
  process.env.NODE_ENV === "development" &&
  process.env.ALLOW_REMOTE_MIGRATIONS === "true" &&
  process.env.MIGRATION_TARGET_HOST?.toLowerCase() === hostname;

if (!safeLocal && !explicitRemoteApproval) {
  throw new Error(
    "Refusing to migrate a remote database. Verify it is a development database, then set ALLOW_REMOTE_MIGRATIONS=true and MIGRATION_TARGET_HOST to its exact hostname.",
  );
}
