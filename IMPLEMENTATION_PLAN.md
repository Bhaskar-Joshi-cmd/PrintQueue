# IMPLEMENTATION_PLAN.md — PrintQueue

**Deliverable for this planning task.** This is the plan only; no application code was written yet.

- **Project:** PrintQueue — Campus Printing Queue & Job Tracker
- **Docs root:** `Documents/printqueue_project_pack/` (the authoritative project documentation folder in the repository root)
- **Task:** inspect repository + documentation, then produce a phase-wise implementation plan. No coding, no installs, no file modifications during this planning task.
- **Node/npm available:** Node v25.8.2, npm 11.11.1

---

## 0. Documentation audit and requirement confirmation

### 0.1 Repository state

| Item | Finding |
|---|---|
| Repository | `printQueue/` is **documentation-only**. It contains no `client/`, `server/`, `package.json`, `index.html`, Git repo, or JS source files. |
| Documentation folder | `Documents/printqueue_project_pack/` (the exact folder name and location). It is not a duplicate; it is the single source of truth. |
| Files present | `README.md`, `MASTER_DOCUMENTATION.md`, `docs/01-15.md`, `database/schema.sql`, `database/promote-staff-example.sql`, `server/.env.example`, `client/.env.example`, `*.gitignore` |
| Git | No `.git` repository at the project root yet. GitHub/Git setup is needed before deployment. |
| Existing code | None to preserve. There is no existing project code to avoid overwriting. |

### 0.2 Documentation files read and their authority

Read each in full:

- `docs/01-project-brief.md` — scope, users, success criteria
- `docs/02-prd.md` — Must/Should requirements, status workflow, waiting-time estimate
- `docs/03-srs.md` — detailed functional requirements, error contract, assumptions
- `docs/04-ui-ux-spec.md` — routes, shared components, page details, responsive rules
- `docs/05-architecture.md` — full-stack architecture, folder guide, design decisions
- `docs/06-database-design.md` — `users`, `print_jobs`, constraints, indexes, RLS, staff provisioning
- `docs/07-api-contract.md` — exact endpoints, statuses, response shape
- `docs/08-security-and-privacy.md` — auth, secret handling, CORS, environment variables
- `docs/09-test-plan.md` — acceptance tests T-01..T-32, deployment tests
- `docs/10-deployment-guide.md` — local setup, Vercel project structure, env vars, SPA fallback
- `docs/11-development-roadmap.md` — the 9 working phases to follow
- `docs/12-beginner-code-guidelines.md` — coding rules
- `docs/13-demo-and-viva.md` — demo script and viva questions
- `docs/14-syllabus-mapping.md` — MongoDB/Mongoose substitution note
- `docs/15-implementation-prompt.md` — agent constraints
- `database/schema.sql` — exact SQL to run
- `database/promote-staff-example.sql` — exact staff promotion SQL
- `server/.env.example`, `client/.env.example` — env templates
- `README.md`, `MASTER_DOCUMENTATION.md` — orientation

### 0.3 Confirmed technology stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite, plain JavaScript, Vite plain CSS, React Router |
| Backend | Node.js + Express, REST, simple middleware |
| Auth | `bcryptjs` password hashing + `jsonwebtoken` (custom JWT, NOT Supabase Auth) |
| Database | Supabase PostgreSQL via `@supabase/supabase-js` **from the backend only** |
| Deployment | Two Vercel projects: `client/` (frontend) and `server/` (Express API), Supabase PostgreSQL |
| Forbidden | TypeScript, MongoDB/Mongoose, Redux, WebSockets, microservices, ORM, Docker, large UI frameworks, AI/payments/uploads |

### 0.4 Contradiction / deviation findings (must record)

1. **MongoDB/Mongoose vs Supabase PostgreSQL (documented).**
   - `docs/14-syllabus-mapping.md` says the FSD-I syllabus asks for MongoDB/Mongoose, but the project owner requested Supabase. `docs/06-database-design.md`, `docs/05-architecture.md`, and `docs/15-implementation-prompt.md` all explicitly use PostgreSQL/SQL throughout.
   - **Resolution:** Keep Supabase PostgreSQL and label it a deliberate substitution. Do not describe Supabase as MongoDB in demos or viva. If the instructor insists on MongoDB/Mongoose, stop and ask for approval before changing the stack. See §G.

2. **Custom JWT vs Supabase Auth (documented).**
   - `docs/05-architecture.md` (decision 6) and `docs/08-security-and-privacy.md` say the project uses custom JWT (`jsonwebtoken`) + bcrypt with the Supabase **secret key only for server-side DB access**. This is not "Supabase Auth + custom JWT combined".
   - **Resolution:** Implement the agreed custom-JWT design. Do not add Supabase Auth.

3. **Frontend routing / nested routes returning 404 (deployment).**
   - `docs/10-deployment-guide.md` recommends `client/vercel.json` SPA rewrites. This depends on the exact Vercel routing behavior at deploy time, so the plan lists it as a verified-check item, not a universal rule.

4. **`service_role` vs current Supabase secret key.**
   - Old docs say `service_role`. Current Supabase guidance recommends a "secret key" option. The deployment phase will use current Supabase secret-key guidance and verify it in Table Editor/Log.

### 0.5 Minimum complete version (scope control)

A Must-feature release is complete when all of these work:

- Student register + login + logout
- Student dashboard showing only their own jobs
- Create a job (status `queued`, server-set fields)
- View own job detail
- Edit/cancel only `queued` jobs (enforced by API, not only UI)
- Staff queue (oldest-first) with allowed one-step status transitions
- Loading/empty/error/success UI states
- Plain CSS, React hooks, plain JavaScript, no third-party UI library

Optional/Should items added only after the core passes: staff queue filter by status, search by document label, waiting-time estimate.

## Phase 1 — Project structure and development environment

### 1.1 Objective

Create the repository skeleton and the local dev workflow with correct folder layout, package management, Git/GitHub, and environment templates. No application logic yet.

### 1.2 Documentation references

- `docs/10-deployment-guide.md` §C/D
- `docs/11-development-roadmap.md` Phase 0
- `docs/05-architecture.md` §5 suggested layout
- `docs/08-security-and-privacy.md` §5 env-var rules
- `docs/12-beginner-code-guidelines.md`

### 1.3 Prerequisites

Node.js LTS installed and verified. A GitHub account.

### 1.4 Exact tasks

1. In the repository root, create:
   - `README.md` (project overview, setup instructions, stack, notes)
   - `docs/` (copy the 15 docs and supporting SQL/env files from `Documents/printqueue_project_pack/` — do not rename/alter)
   - `database/schema.sql`, `database/promote-staff-example.sql`
   - `server/package.json`
   - `.gitignore`

### 1.5 Files/directories

- Root: `README.md`, `.gitignore`, `docs/`, `database/`
- `server/package.json`, `server/.env.example`
- `client/package.json`, `client/.env.example`
- Git repo + GitHub remote

### 1.6 Dependencies

- Node/npm (local dev tools)
- `express`, `cors`, `dotenv`, `@supabase/supabase-js`, `bcryptjs`, `jsonwebtoken` (backend)
- `nodemon` (backend dev only)
- Vite + React + React Router DOM (frontend)

### 1.7 Implementation approach

A flat, beginner-readable monorepo:
```
printQueue/
  README.md
  docs/
  database/
  client/
  server/
```

### 1.8 Learning notes

- Repository layout (monorepo with `client/` and `server/`)
- `.gitignore` correctly separates public templates from secrets
- npm scripts: `start` vs `dev`
- Why the repo is a monorepo (two separate Vercel projects)

### 1.9 Testing

- `npm -v && node -v`
- `git status` shows only intended files committed; `.env` and `node_modules` absent
- `npm run dev` starts without script errors

### 1.10 Acceptance criteria

- Repository has `README.md`, `docs/`, `database/`, `client/`, `server/`
- `.gitignore` excludes secrets and `node_modules`
- Docs are intact and unchanged

### 1.11 Common mistakes

- Committing `server/.env`
- Copying `.env.example` to `.env` and forgetting to add to `.gitignore`
- Using TypeScript Vite template

### 1.12 Dependencies between phases

Phase 0 must finish (docs read, repo created) before any code phase.

## Phase 2 — Basic frontend structure and UI

### 2.1 Objective

Make the interface understandable and usable with temporary mock data. Do not connect backend yet.

### 2.2 Documentation references

- `docs/04-ui-ux-spec.md`
- `docs/05-architecture.md` §5
- `docs/12-beginner-code-guidelines.md`

### 2.3 Prerequisites

Phase 1.

### 2.4 Exact tasks

1. Initialize `client/` with Vite React JavaScript template.
2. Create the route structure: `Home`, `Register`, `Login`, `Dashboard`, `NewJob`, `JobDetails`, `StaffQueue`, `NotFound`.

### 2.5 Files/directories

- `client/src/main.jsx`, `client/src/App.jsx`
- `client/src/api/api.js` (mock-first fetch helper later replaced with real API helper)
- `client/src/components/`
- `client/src/context/AuthContext.jsx`
- `client/src/pages/`
- `client/src/styles/global.css`

### 2.6 Dependencies

- React, React Router DOM, Vite (same as stack)

### 2.7 Implementation approach

Use fake/mock data and fake `currentUser`. Use plain CSS with one global stylesheet. Keep components small and named clearly.

### 2.8 Learning notes

- React component structure, props, state
- React Router navigation
- Controlled forms
- Why UI mocks are only for layout; real data comes in Phase 6

### 2.9 Testing

- Open `http://localhost:5173`, register/login, navigate all pages
- Confirm lists/forms render with mock data

### 2.10 Acceptance criteria

- All routes render
- Login/register/Logout work with mock data
- Navigate from student dashboard to staff queue correctly

### 2.11 Common mistakes

- Adding many small files before the core flow works
- Using `localStorage` for password/token handling (will be replaced with sessionStorage per docs)

### 1.12 Dependencies between phases

None. Independent of backend until Phase 7.

## Phase 3 — Supabase database setup

### 3.1 Objective

Create the hosted database and apply the documented schema so the backend can use it.

### 3.2 Documentation references

- `docs/06-database-design.md`
- `database/schema.sql`
- `docs/10-deployment-guide.md` §B

### 3.3 Prerequisites

A Supabase account. Create a Supabase project.

### 3.4 Exact tasks

1. Create a Supabase project in the dashboard.
2. Go to **SQL Editor** and run `database/schema.sql` **once**.
3. Verify `public.users` and `public.print_jobs` appear in Table Editor.
4. Confirm RLS is enabled on both tables.

### 3.5 Files/directories

- Cloud only (no code copied); supporting files already in `database/schema.sql` and `database/promote-staff-example.sql`.

### 3.6 Dependencies

- Supabase project
- Schema runs once; no Python/Go dependencies needed locally

### 3.7 Implementation approach

Use the **Supabase Dashboard → SQL Editor**. Execute the exact SQL. Verify in Table Editor. Use the secret key only in Express environment variables.

### 3.8 Learning notes

- PostgreSQL relational model (tables, PK, FK)
- RLS and why this architecture keeps the secret key server-side
- How `schema.sql` defines constraints and indexes

### 3.9 Testing

- Run a `SELECT` in the Supabase SQL Editor against both tables.
- Verify `check`, `unique`, and `references` constraints in Table Editor.

### 3.10 Acceptance criteria

- Two tables exist, RLS enabled, constraints present
- Secret key is stored only in backend env vars

### 3.11 Common mistakes

- Exposing `service_role`/`secret_key` in the browser
- Creating public policies that bypass the ownership checks
- Changing column names from `schema.sql`

### 3.12 Dependencies between phases

Phase 3 must be done before backend API routes can write/read data.


## Phase 4 — Express backend foundation

### 4.1 Objective

Stand up a working Express API that can start locally, health-check, parse JSON, handle CORS, and reach Supabase. No auth or job routes yet.

### 4.2 Documentation references

- `docs/11-development-roadmap.md` Phase 1
- `docs/10-deployment-guide.md` §D
- `docs/05-architecture.md` §4
- `docs/08-security-and-privacy.md`

### 4.3 Prerequisites

Phase 3 (database schema applied). `server/` initialized with the exact packages.

### 4.4 Exact tasks

1. Create `server/index.js`.
2. Add `server/src/config/supabase.js` — creates the Supabase client from `SUPABASE_URL` and `SUPABASE_SECRET_KEY`.
3. Add `server/src/middleware/errorMiddleware.js` — a simple JSON error handler.
4. Add `server/src/middleware/corsMiddleware.js` guarded by `NODE_ENV`: local allows `http://localhost:5173`; production allows `FRONTEND_ORIGIN`.
5. Add `server/src/routes/health.js` (optional small route file) for `GET /api/health`.
6. Wire in `app.use(express.json())`, `app.use(cors(...))`, `app.use('/api/health', ...)`, and 404 handler.
7. Export the app for Vercel and, when run directly, listen on `PORT`.
8. Add `server/package.json` scripts: `start` = `node index.js`, `dev` = `nodemon index.js`.

### 4.5 Files/directories

- `server/package.json`
- `server/index.js`
- `server/src/config/supabase.js`
- `server/src/middleware/errorMiddleware.js`
- `server/src/middleware/corsMiddleware.js`
- `server/src/routes/health.js`
- Root `server/.env.example`

### 4.6 Dependencies

- `express`, `cors`, `dotenv`, `@supabase/supabase-js`

### 4.7 Implementation approach

Keep it minimal: one health route, one error handler, CORS by env, one Supabase client. Export the app for Vercel; listen only when run locally.

### 4.8 Learning notes

- Express app vs Express function on Vercel
- How the backend connects to Supabase without exposing the secret
- Why CORS is environment-aware

### 4.9 Testing

- `cd server && npm run dev`
- `curl http://localhost:5000/api/health` returns `{ success: true, data: { status: "ok" } }`
- Verify no `error` from Supabase client when the secret is configured.

### 4.10 Acceptance criteria

- Backend starts and health endpoint returns success
- JSON parsing works for subsequent API calls
- CORS permits local Vite origin in development

### 4.11 Common mistakes

- Putting secrets in `.env` present in a committed file
- Listening on a hardcoded port instead of `process.env.PORT`
- Exposing `error` details from Supabase to the browser

### 4.12 Dependencies between phases

Phase 4 must be runnable before implementing auth and job APIs.

## Phase 5 — Authentication and authorization

### 5.1 Objective

Implement secure registration/login/logout and token-protected routes so students and staff are identified safely.

### 5.2 Documentation references

- `docs/03-srs.md` §3
- `docs/07-api-contract.md`
- `docs/08-security-and-privacy.md`
- `docs/11-development-roadmap.md` Phase 2

### 5.3 Prerequisites

Phase 4 health endpoint working.

### 5.4 Exact tasks

1. Create `server/src/controllers/authController.js`:
   - `register` — validate, hash with `bcryptjs`, insert into `public.users` with `role='student'`, return safe `id/fullName/email/role`.
   - `login` — find user by email, compare password hash with `bcrypt`, sign JWT with `JWT_SECRET`, expiry 4 hours.
   - `me` — verify token, return safe user.
2. Create `server/src/middleware/authMiddleware.js`:
   - `verifyToken` — parse `Authorization: Bearer <token>`, return 401 if missing/malformed/expired/invalid.
   - `requireUser` — ensure user exists.
   - `requireStaff` — ensure role is `staff`, else 403.
3. Create `server/src/routes/authRoutes.js`.
4. Wire routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.

### 5.5 Files/directories

- `server/src/controllers/authController.js`
- `server/src/middleware/authMiddleware.js`
- `server/src/routes/authRoutes.js`
- `server/src/routes/authRouter.js` (or reuse `authRoutes.js`)

### 5.6 Dependencies

- `bcryptjs` (password hashing)
- `jsonwebtoken` (token signing/verification)
- `dotenv`

### 5.7 Implementation approach

Disable `confirmPassword` UI-only behavior; backend does all validation. Always set role `student` on registration. Server controls `user_id` and `role`.

### 5.8 Learning notes

- bcrypt hashing and why plain passwords are never stored
- JWT signing and verification
- Why `requireStaff` catches students trying staff endpoints
- How `me` lets the UI know the current user

### 5.9 Testing

- Register valid user → 201, role `student`
- Duplicate email → 409
- Register short password → 400 with `errors`
- Login correct → 200 with `token` + safe `user`
- Login wrong password → 401 generic message
- `/api/auth/me` without token → 401
- `/api/auth/me` with invalid/expired token → 401

### 5.10 Acceptance criteria

- Register/login/logout work with a real Supabase-backed user row
- Protected endpoint requires a token
- Invalid token yields 401

### 5.11 Common mistakes

- Returning password hash or entire row to frontend
- Accepting `user_id` or `role` from the request body
- Returning stack traces on duplicate-email errors

### 5.12 Dependencies between phases

None. Independent of job routes.


## Phase 6 — Printing job APIs

### 6.1 Objective

Implement create/list/detail/update/cancel and staff queue/status endpoints, with ownership/role checks and validation.

### 6.2 Documentation references

- `docs/07-api-contract.md`
- `docs/03-srs.md` §3
- `docs/09-test-plan.md`
- `docs/11-development-roadmap.md` Phase 3

### 6.3 Prerequisites

Phase 5 authentication working.

### 6.4 Exact tasks

1. Create `server/src/controllers/jobController.js` with one function per action:
   - `createJob` — server sets `user_id` from token, `status='queued'`, timestamps; ignores client `user_id`/`status`.
   - `getMyJobs` — filter by `user_id`; `?status=` and `?search=` filters; newest-first for students.
   - `getJobById` — staff may read any job; students only their own; 404/403 consistent.
   - `updateJob` — allowed fields only; owner + `queued`; updates `updated_at`; rejects `status`.
   - `cancelJob` — owner + `queued`; sets `cancelled`; else 409.
   - `getStaffQueue` — staff only; optional `?status=`; active by default; `created_at` ascending.
   - `updateJobStatus` — staff only; one-step forward; else 409.
2. Create `server/src/routes/jobRoutes.js` with the exact endpoints in `docs/07-api-contract.md`.
3. Add a validation module `server/src/utils/validation.js` for repeated field checks.
4. Add basic validation middleware before database calls.
5. Ensure all Supabase errors are translated into safe messages; no stack traces or raw SQL.

### 6.5 Files/directories

- `server/src/controllers/jobController.js`
- `server/src/middleware/validationMiddleware.js`
- `server/src/utils/validation.js`
- `server/src/routes/jobRoutes.js`

### 6.6 Dependencies

- `@supabase/supabase-js`
- `bcryptjs`, `jsonwebtoken` (already used)

### 6.7 Implementation approach

One controller per action, straightforward `async/await`, simple `if` checks. Keep business rules in the backend.

### 6.8 Learning notes

- Ownership and role enforcement in the API
- Server-controlled fields (`user_id`, `status`, `created_at`, `updated_at`)
- Why client-supplied status is ignored
- Mapping of HTTP statuses: 201, 400, 401, 403, 404, 409, 500

### 6.9 Testing

- T-10 through T-24 from `docs/09-test-plan.md`
- Use Postman or VS Code REST Client for independent API tests

### 6.10 Acceptance criteria

- Student creates and lists only their own jobs
- Student cannot update another student's job
- Staff queue returns oldest-first; status transitions only one step forward
- Invalid transition returns 409

### 6.11 Common mistakes

- Forgetting to filter student lists by authenticated `user_id`
- Returning raw database error text to client
- Allowing status edits from frontend

### 6.12 Dependencies between phases

None. Independent of frontend.

## Phase 7 — Connect the frontend to the backend

### 7.1 Objective

Replace mock data with real API responses from the Express API.

### 7.2 Documentation references

- `docs/04-ui-ux-spec.md`
- `docs/05-architecture.md` §4
- `docs/12-beginner-code-guidelines.md`

### 7.3 Prerequisites

Phases 4, 5, 6 working locally.

### 7.4 Exact tasks

1. In `client/.env`, set `VITE_API_BASE_URL=http://localhost:5000/api`.
2. Replace mock data in `api.js` with `fetch()` calls using the documented endpoints.
3. Wire `AuthContext` to login/register/logout and `GET /api/auth/me`.
4. Connect Dashboard, NewJob, JobDetails, and StaffQueue to real API calls.
5. Handle loading (`isLoading`), empty (`EmptyState`), error (`ErrorMessage`), and success states.
6. On successful create/update/cancel, refetch the relevant list.
7. Add a Retry button for failed API calls.

### 7.5 Files/directories

- `client/src/api/api.js`
- `client/src/context/AuthContext.jsx`
- `client/src/pages/Home.jsx`, `Register.jsx`, `Login.jsx`, `Dashboard.jsx`, `NewJob.jsx`, `JobDetails.jsx`, `StaffQueue.jsx`, `NotFound.jsx`

### 7.6 Dependencies

- None beyond the running backend API

### 7.7 Implementation approach

One `apiFetch()` helper handles JSON headers and token. Use `sessionStorage` for the JWT. Refetch after successful actions.

### 7.8 Learning notes

- How the frontend calls the backend over HTTPS
- How state updates after an API call
- Why API errors are shown without exposing details

### 7.9 Testing

- Register/login, create a job, refresh the page, and confirm the job remains
- Try edit/cancel on a non-queued job and confirm disabled states plus API 409

### 7.10 Acceptance criteria

- All pages render with live data
- Actions succeed and UI reflects backend state

### 7.11 Common mistakes

- Hardcoding API URLs
- Updating local state without confirming the API call succeeded

### 7.12 Dependencies between phases

None.


## Phase 11 — Final review, demonstration, and viva preparation

### 11.1 Objective

Ensure the final app is demonstrable and explainable file-by-file.

### 11.2 Documentation references

- `docs/13-demo-and-viva.md`
- `docs/14-syllabus-mapping.md`
- `docs/09-test-plan.md`

### 11.3 Prerequisites

- Phase 10 complete
- Deployed frontend and API working

### 11.4 Exact tasks

1. Review UI and workflows end-to-end.
2. Prepare sample demo data; verify it is safe and non-sensitive.
3. Prepare a 4–6 minute demo script using `docs/13-demo-and-viva.md`.
4. Prepare viva answers for the likely questions in the doc.
5. Write an end-to-end README with setup/deploy steps.
6. Record the known limitations and future improvements.

### 11.5 Files/directories

- README.md updates
- Maybe a short `demo-viva/` notes file for the student (optional)

### 11.6 Dependencies

- Phase 10 complete.

### 11.7 Implementation approach

A structured demo and viva checklist.

### 11.8 Learning notes

- How to explain each file and how data flows from UI to database
- How to explain the architecture without claiming real-time/production claims

### 11.9 Testing

- Run the demo to a live audience or recording once.

### 11.10 Acceptance criteria

- All Must requirements pass.
- Demo runs for the required time and answers expected viva questions.

### 11.11 Common mistakes

- Overstating capabilities (printer integration, real-time sync, file uploads).

### 11.12 Dependencies between phases

None.


## Phase 8 — Complete the student and shop workflows

### 8.1 Objective

Finish the end-to-end workflow, including queue-position and waiting-time estimate logic.

### 8.2 Documentation references

- `docs/02-prd.md` §8
- `docs/04-ui-ux-spec.md`
- `docs/09-test-plan.md`

### 8.3 Prerequisites

Phases 5–7. Student and staff accounts ready in Supabase.

### 8.4 Exact tasks

1. Implement waiting-time estimate in a small, named helper:
   - For queued jobs: `estimatedWaitMinutes = numberOfEarlierQueuedJobs × 5`
2. Show status-specific messages for printing/ready/completed jobs.

### 8.5 Files/directories

- Reuse existing pages/components; modify helpers only

### 8.6 Dependencies

- Phase 7 must be done

### 8.7 Implementation approach

Keep the calculation a simple named function, not a complex utility.

### 8.8 Learning notes

- Why queue estimate is a configurable, non-guaranteed value
- How to compute "earlier queued jobs" for a given job

### 8.9 Testing

- T-25 through T-32 from `docs/09-test-plan.md`
- Verify status text plus color for accessibility

### 8.10 Acceptance criteria

- Complete student journey works end-to-end
- Staff workflow works with no direct DB editing except staff provisioning

### 8.11 Common mistakes

- Adding "reopen" or "redo" workflows not in docs
- Over-engineering status transitions

### 8.12 Dependencies between phases

None.

## Phase 9 — Testing and fixing

### 9.1 Objective

Run the documented test plan and fix failures before deployment.

### 9.2 Documentation references

- `docs/09-test-plan.md`
- `docs/11-development-roadmap.md` Phase 7
- `docs/13-demo-and-viva.md`

### 9.3 Prerequisites

Phases 5–8 complete locally.

### 9.4 Exact tasks

1. Manual API tests for auth and jobs (T-01..T-24).
2. Manual UI tests (T-25..T-32) at 375px, 768px, and 1366px.
3. Check ownership and permission boundaries with direct API calls.
4. Verify no secrets appear in browser assets.
5. Check CORS, error messages, and success/empty/loading states.
6. Update README with clear local and deploy commands.

### 9.5 Files/directories

- None changed; tests are manual plus README updates.

### 9.6 Dependencies

- Phases 4–8 complete.

### 9.7 Implementation approach

Manual testing is the primary validation method for this beginner project.

### 9.8 Learning notes

- How to verify security without a full test suite
- How to record failures and fixes

### 9.9 Testing

- Run T-01..T-24 and T-25..T-32; record pass/fail.

### 9.10 Acceptance criteria

- All Must requirements (PRD) pass.
- Release acceptance checklist from `docs/09-test-plan.md` is complete.

### 9.11 Common mistakes

- Claiming a test passed without actually executing it.

### 9.12 Dependencies between phases

None.

## Phase 10 — Vercel and Supabase deployment

### 10.1 Objective

Deploy the frontend and Express API to Vercel with correct env vars, CORS, and secrets, then verify the live app.

### 10.2 Documentation references

- `docs/10-deployment-guide.md`
- `docs/08-security-and-privacy.md`
- `docs/05-architecture.md` §3
- `docs/11-development-roadmap.md` Phase 8

### 10.3 Prerequisites

- Phase 9 complete (or at least all Must requirements passing)
- GitHub repository with the project committed and pushed
- A Supabase project with schema applied
- Backend secret key and JWT secret ready

### 10.4 Exact tasks

1. Create a **Vercel project for the backend**:
   - Import the GitHub repo.
   - Root Directory: `server/`
   - Node.js project; match package manager and build settings to `server/package.json`.

### 10.5 Files/directories

- `client/vercel.json` (optional, only if needed for SPA fallback)

### 10.6 Dependencies

- GitHub repository, Vercel and Supabase accounts
- Production Supabase project

### 10.7 Implementation approach

Two separate Vercel projects. Do not serve the React build from the Express deployment. Keep secrets only in variable settings.

### 10.8 Learning notes

- How Vercel functions differ from local Node processes
- How environment variables are separated between frontend and backend
- Why environment changes require a redeploy

### 10.9 Testing

- Open the frontend URL over HTTPS
- Full flow from the deployed app
- Inspect browser network and source for secret leakage

### 10.10 Acceptance criteria

- Deployed frontend and API both work end-to-end
- No secret in browser assets
- Production CORS origin correct

### 10.11 Common mistakes

- Committing `server/.env` and then thinking Vercel will use it
- Forgetting to redeploy after changing env vars
- Wrong root directory (`server/` for frontend or `client/` for backend)

### 10.12 Dependencies between phases

None.


# Appendix A — Final project directory tree

```
printQueue/
├── README.md                          # configuration files
├── .gitignore                         # configuration files
├── docs/                              # documentation files
│   ├── 01-project-brief.md ...
│   ├── 15-implementation-prompt.md
│   └── ...
├── database/                          # SQL scripts
│   ├── schema.sql                     # database schema + constraints + RLS
│   └── promote-staff-example.sql      # staff account provisioning
│
├── client/                            # frontend (Vite + React)
│   ├── package.json                   # configuration files
│   ├── .env.example                   # environment template
│   ├── index.html                     # configuration files
│   └── vite.config.js                 # configuration files (generated)
│   ├── public/
│   └── src/
│       ├── main.jsx                   # configuration files
│       ├── App.jsx                    # configuration files
│       ├── api/
│       │   └── api.js                 # frontend fetch helper + token attach
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── JobCard.jsx
│       │   ├── LoadingMessage.jsx
│       │   ├── ErrorMessage.jsx
│       │   └── EmptyState.jsx
│       ├── context/
│       │   └── AuthContext.jsx        # auth state + token in sessionStorage
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Register.jsx
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── NewJob.jsx
│       │   ├── JobDetails.jsx
│       │   ├── StaffQueue.jsx
│       │   └── NotFound.jsx
│       └── styles/
│           └── global.css             # plain CSS
│
└── server/                            # backend (Express)
    ├── package.json                   # configuration files
    ├── .env.example                   # environment template
    ├── index.js                       # Express app export + local listen
    └── src/
        ├── config/
        │   └── supabase.js            # Supabase client from env only
        ├── middleware/
        │   ├── authMiddleware.js      # verifyToken, requireUser, requireStaff
        │   ├── corsMiddleware.js
        │   └── errorMiddleware.js
        ├── routes/
        │   ├── authRoutes.js
        │   └── jobRoutes.js
        ├── controllers/
        │   ├── authController.js
        │   └── jobController.js
        └── utils/
            └── validation.js          # frontend/consistent field rules
```

### Responsibility summary

| Type | Files |
|---|---|
| Configuration | `README.md`, `.gitignore`, `package.json` files, `vite.config.js`, `index.html`, `client/vercel.json` (optional) |
| Frontend | `client/src/...` |
| Backend | `server/src/...`, `server/index.js` |
| SQL | `database/schema.sql`, `database/promote-staff-example.sql` |
| Documentation | `docs/...` and root `README.md` |
| Environment templates | `server/.env.example`, `client/.env.example` |


# Appendix B — API implementation checklist

From `docs/07-api-contract.md`.

| # | Method / Path | Access | Purpose | Phase |
|---|---|---|---|---|
| 1 | `GET /api/health` | Public | Health check | 4 |
| 2 | `POST /api/auth/register` | Public | Student registration (role always `student`) | 5 |
| 3 | `POST /api/auth/login` | Public | Login, JWT + safe user | 5 |
| 4 | `GET /api/auth/me` | Signed-in | Return current safe user | 5 |
| 5 | `POST /api/jobs` | Student | Create a queued job, server sets fields | 6 |
| 6 | `GET /api/jobs/my` | Student | List only the current student's jobs | 6 |
| 7 | `GET /api/jobs/:id` | Owner or staff | Get one job | 6 |
| 8 | `PATCH /api/jobs/:id` | Owner, queued only | Edit metadata | 6 |
| 9 | `PATCH /api/jobs/:id/cancel` | Owner, queued only | Cancel own queued job | 6 |
| 10 | `GET /api/jobs/queue` | Staff | Staff queue, oldest first | 6 |
| 11 | `PATCH /api/jobs/:id/status` | Staff | One-step status update | 6 |

No undocumented endpoints should be added unless approved in §G.


# Appendix C — Database implementation checklist

From `database/schema.sql`.

## `public.users`

| Field | Rule | Notes |
|---|---|---|
| `id` | UUID PK default `gen_random_uuid()` | |
| `full_name` | VARCHAR(100), `not null`, check 2–100 after trim | |
| `email` | VARCHAR(255), `not null`, unique | lowercase by backend |
| `password_hash` | TEXT, `not null` | bcrypt, never returned |
| `role` | TEXT, default `student`, check student/staff | staff via SQL only |
| `created_at` | TIMESTAMPTZ default `now()` | |

## `public.print_jobs`

| Field | Rule | Notes |
|---|---|---|
| `id` | UUID PK default `gen_random_uuid()` | |
| `user_id` | UUID FK → `users.id`, `on delete cascade` | owner |
| `document_name` | VARCHAR(120), check 1–120 | label only, no file |
| `pages` | INTEGER, check 1–500 | |
| `copies` | INTEGER, default 1, check 1–20 | |
| `print_mode` | TEXT, check `mono`/`color` | |
| `sides` | TEXT, check `single`/`double` | |
| `notes` | VARCHAR(300) | optional |
| `status` | TEXT, check enumerated statuses | server-set/updated |
| `created_at` | TIMESTAMPTZ default `now()` | queue ordering |
| `updated_at` | TIMESTAMPTZ default `now()` | set on edits |

Indexes from schema:

- `idx_print_jobs_user_id` on `print_jobs(user_id)`
- `idx_print_jobs_status_created_at` on `print_jobs(status, created_at)`

RLS/permissions:

- Enable RLS on both tables
- Revoke from `anon`, `authenticated`
- Grant to `service_role` (via backend secret key)

Seed/setup data: none required. Demo jobs are created through the UI.


# Appendix D — Environment-variable checklist

| Variable | Used by | Secret? | Local | Production (Vercel) |
|---|---|---|---|---|
| `PORT` | Backend | No | `5000` | inferred/auto; set in Vercel if needed |
| `NODE_ENV` | Backend | No | `development` | `production` |
| `FRONTEND_ORIGIN` | Backend CORS | No | `http://localhost:5173` | frontend deployment URL |
| `VITE_API_BASE_URL` | Frontend | No | `http://localhost:5000/api` | `https://<frontend-project>.vercel.app/api` |
| `SUPABASE_URL` | Backend | No | Supabase project URL | same |
| `SUPABASE_SECRET_KEY` | Backend | **Yes** | copy from Supabase Settings → API Keys | same |
| `JWT_SECRET` | Backend | **Yes** | long random secret | long random secret |

Rules:

- `server/.env` is local-only; `server/.env.example` may be committed.
- No `VITE_` secrets. The only frontend env var is `VITE_API_BASE_URL`.
- After changing env vars in Vercel, redeploy.


# Appendix E — Requirement traceability matrix

| Requirement | Phase | Frontend/Backend | DB table | Test |
|---|---|---|---|---|
| FR-01 Register | 5 | `authController.register` + UI | `users` | T-01 |
| FR-02 Login | 5 | `authController.login` + UI | `users` | T-05 |
| FR-03 Logout | 5/7 | Clear `sessionStorage` + UI | — | T-09 |
| FR-04 Protected student dashboard | 5/7 | `Dashboard.jsx` + `GET /api/jobs/my` | `print_jobs` | T-14 |
| FR-05 Create job | 6/7 | `jobController.createJob` + UI | `print_jobs` | T-10 |
| FR-06 Backend validation | 6 | `validation.js` + middleware | constraints | T-11/T-12/T-13 |
| FR-07 Edit queued job | 6/7 | `jobController.updateJob` + UI | `print_jobs` | T-16 |
| FR-08 Cancel queued job | 6/7 | `jobController.cancelJob` + UI | `print_jobs` | T-18 |
| FR-09 Staff oldest-first queue | 6 | `jobController.getStaffQueue` + UI | `print_jobs` | T-22 |
| FR-10 Staff allowed transitions | 6 | `jobController.updateJobStatus` + UI | `print_jobs` | T-22/T-23/T-24 |
| FR-11 Loading/empty/error states | 7 | UI components | — | T-25..T-27 |
| FR-12 Queue status filter | 8 | StaffQueue filter UI | `print_jobs` | T-22..T-24 |
| FR-13 Search by label | 8 | Search UI | `print_jobs` | T-13/T-14 |
| FR-14 Waiting-time estimate | 8 | `estimatedWaitMinutes` helper + UI | `print_jobs` | T-24 |
| FR-15 Responsive layout | 7/8 | CSS + viewport tests | — | T-32 |
| SRS-AUTH-* | 5 | `authMiddleware`, `requireStaff` | `users` | T-01..T-09 |
| SRS-JOB-* | 6 | `jobController`, routes | `print_jobs` | T-10..T-24 |


# Appendix F — Phase completion checklist

A square checkbox `[ ]` means not started; `[x]` means done. Start the next permitted phase only after the current phase passes its acceptance criteria.

**Phase 1 — Project structure and development environment**
- [ ] Repository skeleton created
- [ ] `.gitignore` correct
- [ ] Docs copied verbatim from `Documents/printqueue_project_pack/`
- [ ] GitHub repo created and README updated

**Phase 2 — Basic frontend structure and UI**
- [ ] All public pages render
- [ ] Login/register/Logout with mock data work
- [ ] Dashboard/queue pages render with mock data
- [ ] Loading/empty/error states exist

**Phase 3 — Supabase database setup**
- [ ] Supabase project created
- [ ] `database/schema.sql` run once
- [ ] Tables exist in Table Editor
- [ ] RLS enabled; no public policies
- [ ] Secret key documented only in env

**Phase 4 — Express backend foundation**
- [ ] Backend starts locally
- [ ] `GET /api/health` returns success
- [ ] JSON parsing and CORS work locally
- [ ] Supabase client reachable from backend

**Phase 5 — Authentication and authorization**
- [ ] Register/login/logout work
- [ ] Protected endpoints require a token
- [ ] Invalid/expired tokens return 401
- [ ] Role `student` set on registration

**Phase 6 — Printing job APIs**
- [ ] Create/list/get/update/cancel endpoints work
- [ ] Ownership enforced
- [ ] Staff queue and transitions work
- [ ] Validation and 409s behave per contract

**Phase 7 — Connect the frontend to the backend**
- [ ] All pages show live data
- [ ] Actions refresh from backend
- [ ] Loading/empty/error UI works

**Phase 8 — Complete the student and shop workflows**
- [ ] End-to-end student journey works
- [ ] Staff workflow works
- [ ] Waiting-time estimate displayed

**Phase 9 — Testing and fixing**
- [ ] Auth tests T-01..T-09 pass
- [ ] Job tests T-10..T-24 pass
- [ ] UI tests T-25..T-32 pass
- [ ] README updated

**Phase 10 — Vercel and Supabase deployment**
- [ ] Backend deployed from `server/` root
- [ ] Frontend deployed from `client/` root
- [ ] Env vars set; CORS correct
- [ ] No secrets in browser assets
- [ ] Deployed flow verified

**Phase 11 — Final review, demonstration, and viva**
- [ ] Demo runs end-to-end
- [ ] Viva Q&A prepared
- [ ] README complete


# Appendix G — Risks and unresolved decisions

1. **MongoDB/Mongoose substitution.**
   - **Status:** documented in `docs/14-syllabus-mapping.md` as an intentional substitution. The plan keeps Supabase PostgreSQL.
   - **Decision required:** if your instructor grades MongoDB/Mongoose as mandatory, stop and ask whether an alternative database is permitted. Do not silently switch.

2. **`service_role` vs current Supabase secret key.**
   - Old documents reference `service_role`; newer Supabase guidance recommends the current secret-key option. Use current Supabase guidance and verify in Table Editor/Log.

3. **SPA fallback for nested routes.**
   - `client/vercel.json` with `rewrites` is only needed if Vercel's current routing returns 404 for nested paths such as `/staff/queue`. Verify after first deploy.

4. **Token storage.**
   - Docs specify `sessionStorage` for the MVP. This is convenient for demos but not secure against XSS. Do not present this as a secure production session design.

5. **Custom JWT vs Supabase Auth.**
   - The docs explicitly choose custom JWT for this academic project. Do not add Supabase Auth unless the project owner changes the architecture.

6. **Production secrets.**
   - You will need to obtain `SUPABASE_SECRET_KEY` and `JWT_SECRET` from your own Supabase/Vercel account. Never paste them in chat or commit them.

7. **Deployment behavior of Vercel Express functions.**
   - Verify the current Vercel Express/Node entry-point documentation. The plan assumes a standard Vercel Node/Express function setup.


# Appendix H — Recommended implementation order

## Phase execution order (coding agent)

1. **Phase 1** — Project structure and development environment
2. **Phase 3** — Supabase database setup (parallel with Phase 1 where convenient)
3. **Phase 2** — Basic frontend structure and UI (mock data)
4. **Phase 4** — Express backend foundation
5. **Phase 5** — Authentication and authorization
6. **Phase 6** — Printing job APIs
7. **Phase 7** — Connect the frontend to the backend
8. **Phase 8** — Complete the student and shop workflows
9. **Phase 9** — Testing and fixing
10. **Phase 10** — Vercel and Supabase deployment
11. **Phase 11** — Final review, demonstration, and viva preparation

## Independence safety

- **Phase 1** and **Phase 3** are independent and can proceed in parallel.
- **Phase 2** (mock frontend) is independent of backend phases until Phase 7.
- **Phase 4**–**Phase 6** can be built while the frontend is still mock.
- **Phase 7** must not start before Phases 4–6 are locally tested.
- **Phase 8** must not start before Phase 7 is complete.
- **Phase 10** must wait until all Must requirements pass.
- **Phase 11** must wait until Phase 10 is verified.

## Do not start until approved

- Adding any "enhanced" feature listed as out-of-scope (file uploads, payments, WebSockets, email, complex role management, analytics, TypeScript, Redux, Docker, microservices).
- Switching the database to MongoDB/Mongoose without instructor approval.
- Adding a role selector to the public registration form.

---

*This plan is a guide for a beginner to build PrintQueue step by step. Each phase's acceptance criteria must be verified before moving on.*