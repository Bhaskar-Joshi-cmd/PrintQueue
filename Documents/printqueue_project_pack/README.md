# PrintQueue — Project Documentation Pack

**Version:** 1.0  
**Prepared:** 25 October 2026  
**Project type:** Beginner-friendly full-stack development mini project

PrintQueue helps a campus printing shop organise student print requests and lets students track whether a job is queued, being printed, ready for pickup, or completed.

## Start here

Read these in order before writing code:

1. [`docs/01-project-brief.md`](docs/01-project-brief.md) — one-page purpose and scope.
2. [`docs/02-prd.md`](docs/02-prd.md) — the features the product must have.
3. [`docs/03-srs.md`](docs/03-srs.md) — detailed functional and quality requirements.
4. [`docs/04-ui-ux-spec.md`](docs/04-ui-ux-spec.md) — pages, forms, states, and user flows.
5. [`docs/05-architecture.md`](docs/05-architecture.md) — how the pieces communicate.
6. [`docs/06-database-design.md`](docs/06-database-design.md) and [`database/schema.sql`](database/schema.sql) — database tables and constraints.
7. [`docs/07-api-contract.md`](docs/07-api-contract.md) — exact API endpoints and request/response shapes.
8. [`docs/08-security-and-privacy.md`](docs/08-security-and-privacy.md) — authentication, permissions, and secret handling.
9. [`docs/09-test-plan.md`](docs/09-test-plan.md) — manual test cases and acceptance checks.
10. [`docs/10-deployment-guide.md`](docs/10-deployment-guide.md) — local setup and deployment to Vercel + Supabase.
11. [`docs/11-development-roadmap.md`](docs/11-development-roadmap.md) — implementation order and definition of done.
12. [`docs/12-beginner-code-guidelines.md`](docs/12-beginner-code-guidelines.md) — rules to keep the code easy to understand.
13. [`docs/13-demo-and-viva.md`](docs/13-demo-and-viva.md) — demo flow and likely viva questions.
14. [`docs/14-syllabus-mapping.md`](docs/14-syllabus-mapping.md) — mapping to the provided FSD-I syllabus.
15. [`docs/15-implementation-prompt.md`](docs/15-implementation-prompt.md) — reusable instructions for a coding assistant.

## Selected stack

- **Frontend:** React + Vite + plain JavaScript + ordinary CSS
- **Backend:** Node.js + Express REST API
- **Database:** Supabase PostgreSQL, accessed through `@supabase/supabase-js` from the backend
- **Authentication:** simple email/password registration with `bcryptjs` password hashing and `jsonwebtoken` access tokens
- **Hosting:** two Vercel projects from one Git repository: one rooted at `client/`, another rooted at `server/`

## Important course trade-off

The supplied FSD-I syllabus describes MongoDB/Mongoose in its database experiments. This plan uses **Supabase PostgreSQL**, as requested. You can still show schemas, validation, CRUD, REST APIs, React hooks, routing, middleware, authentication, and deployment. However, Supabase PostgreSQL is not MongoDB, and this project will not demonstrate Mongoose-specific methods such as `findByIdAndUpdate()` or `.populate()`. Ask your instructor whether the database substitution is acceptable before locking the stack.

## Scope boundaries

This is a request tracker, not a printer driver or a document-storage service. Students enter print job details and take/provide the actual document to the shop using the shop's existing process. The app does not upload, store, or print the document file.

Included: login, student and staff views, job request form, queue, status updates, history, basic search/filtering, estimated waiting time, validation, error/loading states, deployment.

Not included in version 1: online payments, actual printer integration, uploading PDFs, live WebSockets, email/SMS notifications, multiple shop locations, reports/analytics, advanced role-management screens.

## Environment templates

- Frontend variables: [`client/.env.example`](client/.env.example)
- Backend variables: [`server/.env.example`](server/.env.example)

Never commit real environment values. The backend Supabase secret key and JWT secret must never be placed in a `VITE_` variable or frontend code.

## Documentation authority

When implementing the app, treat PRD, SRS, UI/UX, database design, API contract and security document as the source of truth. If two documents conflict, prefer the narrower and safer behaviour and update the documents before changing the implementation.
