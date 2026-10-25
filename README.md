# PrintQueue — Campus Printing Queue & Job Tracker

A beginner-friendly full-stack mini project for the FSD-I course. Students submit print requests and track their status; shop staff see a shared queue and update jobs through the printing workflow.

## Stack

 | Layer | Choice |
|---|---|
| Frontend | React + Vite, plain JavaScript, plain CSS, React Router |
| Backend | Node.js + Express, REST API |
| Database | Supabase PostgreSQL (via @supabase/supabase-js) |
| Auth | bcryptjs password hashing + jsonwebtoken (custom JWT) |
| Deployment | Two Vercel projects (client/ and server/), Supabase database |

## Documentation

All project documentation is in Documents/printqueue_project_pack/ (the single source of truth):

- docs/01-project-brief.md
- docs/02-prd.md
- docs/03-srs.md
- docs/04-ui-ux-spec.md
- docs/05-architecture.md
- docs/06-database-design.md
- docs/07-api-contract.md
- docs/08-security-and-privacy.md
- docs/09-test-plan.md
- docs/10-deployment-guide.md
- docs/11-development-roadmap.md
- docs/12-beginner-code-guidelines.md
- docs/13-demo-and-viva.md
- docs/14-syllabus-mapping.md
- docs/15-implementation-prompt.md
- database/schema.sql and database/promote-staff-example.sql

## Quick start (local development)

1. Start the backend:

   

2. Start the frontend (in a new terminal):

   

3. Open http://localhost:5173.

## Scope boundaries

- Includes: login, student and staff views, job request form, queue, status updates, basic search/filtering, estimated waiting time, validation, error/loading states, deployment.
- Not included in version 1: online payments, actual printer integration, uploading PDFs, live WebSockets, email/SMS notifications, multiple shop locations, reports/analytics, advanced role-management screens.

## Important course trade-off

The FSD-I syllabus describes MongoDB/Mongoose, but this project uses Supabase PostgreSQL as requested. You can still show schemas, validation, CRUD, REST APIs, React hooks, routing, middleware, authentication, and deployment. Supabase PostgreSQL is not MongoDB, and this project does not demonstrate Mongoose-specific methods.

## Where to run things

- Frontend: client/ (Vite + React)
- Backend: server/ (Express)
- Database: Supabase (hosted PostgreSQL)

## License

Academic project.
