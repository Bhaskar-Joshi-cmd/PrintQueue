# PrintQueue — Campus Printing Queue & Job Tracker

A beginner-friendly full-stack mini project for the FSD-I course. Students submit print requests (with an optional document file) and track their status; shop staff see a shared queue and update jobs through the printing workflow.

## Stack

 | Layer | Choice |
|---|---|
| Frontend | React + Vite, plain JavaScript, plain CSS, React Router |
| Backend | Node.js + Express, REST API |
| Database | Supabase PostgreSQL (via @supabase/supabase-js) |
| Auth | bcryptjs password hashing + jsonwebtoken (custom JWT) |
| Storage | Supabase Storage bucket `printqueue-documents` |

## Documentation

- `docs/` — 15 design documents (project brief, PRD, SRS, UI/UX, architecture, database design, API contract, security, test plan, deployment guide, roadmap, beginner guidelines, demo & viva, syllabus mapping, implementation prompt)
- `Documents/` — master documentation (MASTER_DOCUMENTATION.md + Word copy)
- `database/schema.sql` — SQL to run in Supabase Dashboard → SQL Editor

## Quick start (local development)

### 1. Set up environment variables

Copy the example files and fill in your own values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

- `server/.env`: set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `JWT_SECRET`.
- `client/.env`: set `VITE_API_BASE_URL=http://localhost:5000/api`.

> Never commit real secrets. `.env` files are gitignored.

### 2. Set up the database

Run `database/schema.sql` in Supabase Dashboard → SQL Editor. This creates the `users` and `print_jobs` tables (including document columns) and enables row-level security.

### 3. Create the storage bucket

In Supabase Dashboard → Storage, create a bucket named `printqueue-documents`. Configure CORS to allow `GET` and `PUT` from your client origin (e.g. `http://localhost:5173`).

### 4. Start the backend

```bash
cd server
npm install
npm start
```

API runs on `http://localhost:5000`.

### 5. Start the frontend (in a new terminal)

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Scope boundaries

- Includes: login, student and staff views, job request form, queue, status updates, basic search/filtering, estimated waiting time, validation, error/loading states, deployment.
- File uploads are supported: optional document file stored in the Supabase `printqueue-documents` bucket, deleted when a job is completed.
- Not included: online payments, actual printer integration, live WebSockets, email/SMS notifications, multiple shop locations, reports/analytics.

## Important course trade-off

The FSD-I syllabus describes MongoDB/Mongoose, but this project uses Supabase PostgreSQL as requested. You can still show schemas, validation, CRUD, REST APIs, React hooks, routing, middleware, authentication, and deployment. Supabase PostgreSQL is not MongoDB, and this project does not demonstrate Mongoose-specific methods.

## Where to run things

- Frontend: `client/` (Vite + React)
- Backend: `server/` (Express)
- Database & Storage: Supabase (hosted PostgreSQL + Storage)

## License

Academic project.
