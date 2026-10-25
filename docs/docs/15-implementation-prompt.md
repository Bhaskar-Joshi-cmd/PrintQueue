# 15 — Implementation Prompt for a Coding Assistant

Use this prompt when asking an AI coding assistant to help build PrintQueue. The aim is to keep the generated code beginner-friendly and aligned to the documents.

---

You are helping me build **PrintQueue**, a beginner-friendly FSD-I mini project. Before writing code, read the project documentation in this repository, especially the PRD, SRS, UI/UX specification, architecture, database design, API contract, security requirements, test plan and coding guidelines.

## Non-negotiable technical choices
- Frontend: React + Vite + plain JavaScript + CSS.
- Backend: Node.js + Express REST API.
- Database: Supabase PostgreSQL using `@supabase/supabase-js` **from the backend only**.
- Authentication: `bcryptjs` for password hashing and `jsonwebtoken` for JWT tokens.
- Deployment: two Vercel projects rooted at `client/` and `server/`.
- Do not use TypeScript, MongoDB/Mongoose, Redux, WebSockets, microservices, ORM, Docker, or a large UI framework.
- Never put `SUPABASE_SECRET_KEY` or `JWT_SECRET` in browser code or any `VITE_` variable.

## Product scope
Students can register/log in, create print requests, list their own jobs, view details, edit/cancel only queued jobs, and track status. Staff can see the shared queue and move jobs only through `queued` → `printing` → `ready_for_pickup` → `completed`. Registration always creates a student; staff is provisioned manually. The actual document file is not uploaded.

## Coding behaviour
1. Build in the roadmap's phases; do not generate the whole project in one giant step.
2. Before each phase, list the files that will change and explain their roles in simple terms.
3. Produce complete runnable code for the phase, with filenames and exact install/run commands.
4. Use readable variable/function names, straightforward `async/await`, simple `if` statements, and comments only where helpful.
5. Handle loading, empty, success and error states in the UI.
6. Validate input on the backend; do not trust the frontend.
7. Enforce job ownership and staff role in the API on every protected operation.
8. Check Supabase query errors explicitly. Never display raw database errors or stack traces to users.
9. Use consistent field and endpoint names from `docs/07-api-contract.md` and `database/schema.sql`.
10. After implementing a phase, provide a short manual test checklist and explain the key logic in plain English. Do not jump to the next phase until the current one runs and has been tested.

## First task
Start with Phase 1 (minimal backend) from `docs/11-development-roadmap.md`. Create only the necessary backend files for an Express app, health route, JSON parsing, CORS and safe error handling. Show the exact commands to install packages and run the server. Do not implement authentication or job routes yet.

---

**Note:** A coding assistant should be treated as a helper, not as proof the work is correct. Run the app, test it, read the code, and make sure you can explain every important function before submission.
