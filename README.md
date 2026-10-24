# BookLeaf Publishing — Full-Stack Application

Technical-assignment project for BookLeaf Publishing. The application is built
with a React and TypeScript frontend and an Express and TypeScript API backed by
PostgreSQL and Drizzle ORM.

## Project structure

- `frontend/` — React, Vite, and TypeScript web application
- `backend/` — Express API, database schema, migrations, and seed script
- `.prettierrc.json` — shared code-formatting defaults

## Prerequisites

- Node.js and npm
- PostgreSQL running locally
- The supplied `bookleaf_sample_data.json` attachment for database seeding

The migration and seed scripts are intentionally restricted to local
development databases by default.

## Setup

### 1. Configure and start the backend

```sh
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your local PostgreSQL database.
Replace both token secrets with different random values of at least 32
characters. The example uses port `5000` and the database name `bookleaf`.

Copy the supplied JSON attachment to `backend/data/bookleaf.json` (create the
`data` directory if needed), or set `BOOKLEAF_DATASET` in `backend/.env` to its
path. The seed script expects a JSON object containing `authors` and `books`
arrays with exactly 10 authors and 18 books.

From the `backend/` directory, run:

```sh
npm run migrate
npm run seed
npm run dev
```

The seed command requires `NODE_ENV=development` and a local database host. It
upserts dataset rows by ID and creates development demo accounts unless
`SEED_DEMO_ACCOUNTS=false` is set.

### 2. Start the frontend

In a second terminal:

```sh
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend defaults to `http://localhost:5173` and the API defaults to
`http://localhost:5000`. These can be changed in the respective `.env` files.

## Useful URLs and commands

- Web app: `http://localhost:5173`
- API health check: `http://localhost:5000/api/health`
- API documentation: `http://localhost:5000/api/docs`

Backend checks, run from `backend/`:

```sh
npm run typecheck
npm test
npm run build
```

Frontend checks, run from `frontend/`:

```sh
npm run lint
npm run build
```

## Notes and assumptions

- Keep `.env` files and credentials private; only the `.env.example` files
  belong in source control.
- The included demo account defaults are for local development only. Change
  them before sharing a development environment, and never use them in
  production.
- The seed script validates the dataset size and supports common camelCase and
  snake_case field names. Dataset rows are inserted or updated by their
  original IDs.
- The assignment brief (`BookLeaf_Technical_Assignment_1.docx`) and sample data
  (`bookleaf_sample_data.json`) were not present in the project workspace when
  this setup guide was written. The setup above follows the existing backend
  configuration and seed-script requirements; place the email attachment at
  the path noted above before seeding.
