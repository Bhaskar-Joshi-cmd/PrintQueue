# 11 — Development Roadmap

Build in small working slices. Do not generate every page at once or add optional features before the current stage passes its checks.

## Phase 0 — Understand and prepare
- Read the project brief, PRD, API contract and code guidelines.
- Create the repository and folders.
- Install Node.js and test `node -v` and `npm -v`.
- Create a Supabase project and run `database/schema.sql`.

**Done when:** database tables exist and local environment files are configured.

## Phase 1 — Minimal backend
- Create Express app and `GET /api/health`.
- Add JSON parsing, CORS and one simple error handler.
- Connect the Supabase client using server environment variables.
- Test health endpoint and a simple database read.

**Done when:** backend starts locally and can reach Supabase without any secret in the frontend.

## Phase 2 — Authentication
- Implement register with validation and bcrypt hashing.
- Implement login and JWT generation.
- Implement token verification middleware and `/api/auth/me`.
- Test missing/invalid/expired tokens.
- Keep public registration role fixed to student.

**Done when:** a student can register/log in and protected APIs require a valid token.

## Phase 3 — Student print jobs
- Implement create job.
- Implement list own jobs.
- Implement get details.
- Implement edit and cancel for queued jobs only.
- Enforce ownership in Express.

**Done when:** a student can complete the end-to-end request flow and cannot access another student's jobs.

## Phase 4 — Staff queue
- Create/promote a test staff account manually.
- Implement staff-only queue endpoint.
- Implement next-step status update.
- Check invalid status transitions.

**Done when:** staff can move a job through the allowed workflow and student accounts cannot.

## Phase 5 — React foundation
- Build route structure and common layout.
- Build register and login forms.
- Build a single `apiFetch()` helper.
- Store the token in `sessionStorage` for the demo and share auth state through a small context.

**Done when:** frontend can register, log in, log out and load the current user.

## Phase 6 — Job UI
- Build student dashboard, new-job form and details.
- Build staff queue page and status buttons.
- Add loading, empty, success and error states.
- Add simple search/filtering if core flow is already reliable.

**Done when:** all required actions work from the browser without manual database editing except staff provisioning.

## Phase 7 — Quality pass
- Run the full test plan.
- Check ownership and roles using direct API requests, not only the UI.
- Test at mobile and desktop widths.
- Fix confusing error messages and form validation.
- Update README instructions.

**Done when:** all Must requirements pass.

## Phase 8 — Deploy
- Deploy backend project from the `server/` root directory.
- Deploy frontend project from the `client/` root directory.
- Set env vars and CORS correctly.
- Run deployed acceptance tests.

**Done when:** the deployed app works end-to-end and no secret appears in browser assets.

## Scope control
Do not start these until every Must feature passes: file uploads, payments, WebSockets, email notifications, Redux, TypeScript, Docker, microservices, complex role management or analytics. They do not make the core mini project more complete if the fundamental request flow is unreliable.
