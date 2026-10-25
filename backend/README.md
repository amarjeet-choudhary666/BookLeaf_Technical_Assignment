# BookLeaf Backend

Express/TypeScript API with PostgreSQL and Drizzle ORM. The existing first
migration creates the core tables; follow-up migrations add an assignment index
and relax book statistics/availability fields to preserve dataset nulls.

## Development

1. Copy `.env.example` to `.env` and configure a **local development** PostgreSQL
   database plus random JWT secrets (at least 32 characters).
2. Install dependencies with `npm install`.
3. Apply migrations with `npm run migrate`.
4. Run `npm run seed` to use the bundled synthetic development dataset at
   `data/bookleaf.json`. To use the assignment's supplied JSON instead, replace
   that file or set `BOOKLEAF_DATASET` to its path. The seed script accepts
   books nested under authors or separate top-level arrays, and expects exactly
   10 authors and 18 books.
5. Run `npm run dev`.

The bundled data is synthetic and uses reserved `example.test` email addresses.
The seed script refuses to run unless `NODE_ENV=development` and `DATABASE_URL`
points to `localhost`, `127.0.0.1`, or `::1`. It upserts dataset rows by ID and
only creates the demo accounts listed below.

Migrations also default to local development databases. A remote development
database requires both `ALLOW_REMOTE_MIGRATIONS=true` and an exact
`MIGRATION_TARGET_HOST` match after manually verifying the target. Production
hosts are intentionally blocked by the npm migration script.

**Development-only demo credentials**

- Admin: `admin@bookleaf.local` / `BookLeafAdmin!2026`
- Author: `author@bookleaf.local` / `BookLeafAuthor!2026`

Change these before sharing a development environment. Do not use them in
production. The seed command refuses non-local database hosts.

## Commands

- `npm run dev` — development server
- `npm run build` / `npm start` — production compile and run
- `npm run typecheck` — TypeScript check
- `npm test` — Vitest and Supertest suite
- `npm run generate` — generate a Drizzle migration
- `npm run migrate` — apply Drizzle migrations
- `npm run seed` — guarded, idempotent dataset/demo seed

OpenAPI documentation is served at `/api/docs`; the health endpoint is
`/api/health`. Author-facing APIs are rooted at `/api/authors`, `/api/books`,
and `/api/tickets`; admin APIs are rooted at `/api/admin`.
