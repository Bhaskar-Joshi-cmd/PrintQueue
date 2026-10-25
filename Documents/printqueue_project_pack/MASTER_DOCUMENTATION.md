# PrintQueue — Master Project Documentation

Version 1.0 | 25 October 2026

This document combines the planning documents. SQL and environment templates remain separate files in the documentation ZIP.


---

# 01 — Project Brief

## Project name
**PrintQueue — Campus Printing Queue & Job Tracker**

## Problem statement
During busy submission periods, students may have to visit a campus print shop just to place a print request, ask about its progress, or discover whether it is ready. The shop operator may also need to handle requests and explain the queue repeatedly. PrintQueue provides one small place to submit a request and follow its status.

## Proposed solution
A responsive website with two user roles:

- **Student:** submits a job request, sees their own jobs and their status, estimates the waiting time, and cancels a job while it is still queued.
- **Shop staff:** sees the shared queue and updates a job through the printing workflow.

## Value
- Reduces repeated status enquiries.
- Makes the request queue visible and organised.
- Gives students a simple way to check status before walking to the shop.
- Demonstrates the main building blocks of a full-stack web application.

## Target users
1. College students who use the campus printing shop.
2. One or more shop staff members responsible for processing jobs.

## Primary workflow
1. Student registers and logs in.
2. Student submits job details: document label, pages, copies, print mode, sides, optional note.
3. A job is created with status `queued`.
4. Staff views queued jobs in oldest-first order.
5. Staff changes status: `queued` → `printing` → `ready_for_pickup` → `completed`.
6. Student sees the updated status on their dashboard.

## Success criteria
- A student can register, log in, submit a valid job, and see it in their own list.
- A student cannot view or edit another student's job.
- Staff can see the queue and move a job through the allowed status sequence.
- Invalid data receives a useful error message rather than silently failing.
- The app works on a desktop and a mobile-width screen.
- The deployed frontend can communicate with the deployed API and Supabase database.
- The student can explain the main components and one complete request from frontend to database.

## Project level
Medium-size academic mini project. The core workflow should be finished before any optional styling or extras are started.


---

# 02 — Product Requirements Document (PRD)

## 1. Product overview
PrintQueue is a campus print-request tracker. It is intended to organise job requests and status updates, not to replace the physical print process.

## 2. Goals
- Provide a simple way to create and track print jobs.
- Give staff a chronological queue and a small set of status actions.
- Reduce repeated in-person progress checks.
- Demonstrate an end-to-end React, Express, SQL database, authentication and deployment workflow.

## 3. Non-goals
- Accepting payments or calculating charges.
- Uploading or storing student documents.
- Connecting to a physical printer.
- Sending email/SMS/push notifications.
- Real-time sockets or background workers.
- Multi-branch shops, inventory, analytics dashboards, or complicated admin tools.

## 4. Users and permissions

### Student
- Can create an account and log in.
- Can create a print job.
- Can see only their own jobs.
- Can edit or cancel a job only while its status is `queued`.
- Cannot update a job's workflow status.

### Staff
- Uses an account whose role has been assigned by the project owner through a controlled database operation.
- Can view all jobs in the queue.
- Can update status only along the allowed workflow.
- Cannot change another user's password or promote themselves to staff through the public registration form.

Public registration always creates a `student` role. The form must not contain a role selector.

## 5. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Register using full name, email and password. | Must |
| FR-02 | Log in using email and password. | Must |
| FR-03 | End the current session using Log out. | Must |
| FR-04 | Show a protected student dashboard with the student's jobs. | Must |
| FR-05 | Create a job with a label, pages, copies, print mode, sides and optional note. | Must |
| FR-06 | Validate all user-controlled input on the backend. | Must |
| FR-07 | Allow a student to edit a queued job. | Must |
| FR-08 | Allow a student to cancel a queued job. | Must |
| FR-09 | Show staff a queue sorted oldest first. | Must |
| FR-10 | Allow staff to move jobs through the allowed statuses. | Must |
| FR-11 | Show clear loading, empty, success and error states. | Must |
| FR-12 | Filter the staff queue by status. | Should |
| FR-13 | Search a user's job history by document label. | Should |
| FR-14 | Display an approximate waiting time for a queued job. | Should |
| FR-15 | Work on common desktop and mobile screen sizes. | Must |

## 6. Job fields
- Document label: required, 1–120 characters; it is a label only, not an uploaded file.
- Pages: whole number from 1 to 500.
- Copies: whole number from 1 to 20.
- Print mode: `mono` or `color`.
- Sides: `single` or `double`.
- Note: optional, maximum 300 characters; do not enter private information.
- Status: assigned by the backend, never trusted from a student create request.

## 7. Status workflow

`queued` → `printing` → `ready_for_pickup` → `completed`

A student may cancel only a `queued` job: `queued` → `cancelled`.

No direct transition from `queued` to `completed` is allowed. A job in `printing`, `ready_for_pickup`, `completed`, or `cancelled` cannot be edited or cancelled by the student. Staff may only move a job forward by one step in the workflow. To keep the MVP understandable, no reopen/reprint workflow is provided.

## 8. Waiting-time estimate
For a queued job, use a simple estimate:

`estimatedWaitMinutes = numberOfEarlierQueuedJobs × 5`

The constant 5 minutes is an illustrative configuration value, not a measured guarantee. Display it as an estimate and state that actual waiting time depends on the shop. The calculation can be shown only for queued jobs; jobs already printing or ready have status-specific messages.

## 9. UX requirements
- Primary actions must have descriptive labels.
- Destructive actions such as Cancel require a confirmation step.
- Status must be written as text, not communicated by colour alone.
- Forms show validation messages beside fields or in a clear summary.
- The app must not expose a stack trace, database error, password hash, JWT secret, or environment variable to a user.

## 10. Acceptance criteria
The release is accepted when every Must requirement passes the test plan, student ownership restrictions work through the API (not just by hiding buttons), staff-only routes reject student tokens, and the deployed application works with the production environment variables.


---

# 03 — Software Requirements Specification (SRS)

## 1. Purpose
This document translates PrintQueue's product scope into system behaviour suitable for implementation and testing.

## 2. System context
The React frontend calls the Express API over HTTPS. The Express API verifies tokens, checks permissions, validates inputs and uses the Supabase JavaScript client to read/write PostgreSQL data. The browser must never receive the Supabase secret key.

## 3. Functional requirements

### Authentication
- **SRS-AUTH-01:** Registration accepts `fullName`, `email`, and `password`.
- **SRS-AUTH-02:** Email is trimmed and normalised to lowercase before checking uniqueness.
- **SRS-AUTH-03:** Password is hashed with bcrypt before storage. Plain-text passwords are never stored or returned.
- **SRS-AUTH-04:** Successful login returns a signed JWT and a safe user object (`id`, `fullName`, `email`, `role`).
- **SRS-AUTH-05:** Protected routes require `Authorization: Bearer <token>`.
- **SRS-AUTH-06:** Expired, malformed or invalid tokens receive HTTP 401.
- **SRS-AUTH-07:** Public registration always sets role to `student`.

### Print jobs
- **SRS-JOB-01:** Only authenticated users may create a job.
- **SRS-JOB-02:** Server validation checks required fields, lengths, ranges and allowed enum values.
- **SRS-JOB-03:** The server sets `user_id` from the verified token, not from the request body.
- **SRS-JOB-04:** The server sets new job status to `queued`, not to a client-supplied status.
- **SRS-JOB-05:** A student job list is always filtered by the verified user's ID.
- **SRS-JOB-06:** A student may update job details only when the job belongs to them and status is `queued`.
- **SRS-JOB-07:** A student may cancel only their own queued job.
- **SRS-JOB-08:** Staff may list all jobs and update statuses using the allowed transition sequence.
- **SRS-JOB-09:** The API returns a consistent JSON response for success and error cases.
- **SRS-JOB-10:** Queue ordering uses `created_at` ascending for jobs waiting to be printed.

### Frontend behaviour
- **SRS-UI-01:** Route access is based on the current session and role, but API checks remain authoritative.
- **SRS-UI-02:** After login, the user sees the correct dashboard for their role.
- **SRS-UI-03:** Successful create/update/cancel operations refresh the displayed data.
- **SRS-UI-04:** The UI shows loading, empty, error and success feedback.
- **SRS-UI-05:** Refreshing a protected page should restore a still-valid session or send the user back to login if the token is absent/expired.

## 4. Non-functional requirements
- **NFR-01 Usability:** Main actions should be understandable to a first-time user.
- **NFR-02 Maintainability:** Use simple JavaScript functions and clearly named files; avoid premature abstraction.
- **NFR-03 Security:** Secrets stay on the server, authorization is enforced by the API, and password hashes are never returned.
- **NFR-04 Reliability:** Failed database/API calls show a useful user-facing error and do not appear as successful operations.
- **NFR-05 Responsiveness:** Layout should remain usable on a typical mobile screen and laptop screen.
- **NFR-06 Accessibility:** Inputs have labels; buttons are keyboard reachable; contrast is readable; status has text labels.
- **NFR-07 Performance:** Lists should be small and paginated only if actual test data makes that necessary; do not add a pagination framework pre-emptively.

## 5. Assumptions and constraints
- The first version serves one campus print shop.
- Users enter only a document label and metadata; they do not upload actual files.
- Staff accounts are provisioned manually for the demo.
- Queue estimate uses a simple fixed value and is not a service-level guarantee.
- Supabase PostgreSQL is used rather than MongoDB/Mongoose.
- Vercel hosts frontend and Express API as separate projects, and Supabase hosts the database.

## 6. Error response contract
All API errors use this structure:

```json
{
  "success": false,
  "message": "A clear, safe explanation for the user."
}
```

Field-validation errors may additionally include `errors`, an object mapping field names to concise messages. Do not return stack traces or raw SQL/database errors in production.


---

# 04 — UI/UX Specification

## Design principles
- Simple, readable, student-friendly interface.
- Use ordinary CSS; no large component library is required.
- One consistent layout, typography scale, spacing system and status style.
- Use labels such as “Queued” and “Ready for pickup” alongside colour.
- Avoid decorative features that do not help a user complete a task.

## Pages and routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Short explanation and sign-in/register entry points |
| `/register` | Public | Create a student account |
| `/login` | Public | Sign in |
| `/dashboard` | Student | Summary and list of the student's jobs |
| `/jobs/new` | Student | Submit a new print request |
| `/jobs/:id` | Owner or staff | View the job detail and permitted actions |
| `/staff/queue` | Staff only | Manage all print jobs and workflow statuses |
| `*` | Public | Not-found page with a link home |

Route guarding improves the user experience; it does not replace API authorisation.

## Shared components
- `Navbar`: app name, current page links, current user's name/role and logout.
- `StatusBadge`: text status label with a consistent visual style.
- `LoadingMessage`: shown while a request is in progress.
- `ErrorMessage`: explains what failed and, where appropriate, how to retry.
- `EmptyState`: shown when a list has no jobs.
- `ConfirmDialog` or a simple `window.confirm`: confirm cancellation. Use the simpler option first.
- `JobCard` or `JobRow`: displays document label, copies/pages, mode, status, date and action links.

Do not create dozens of components. Extract a component when it is reused or makes a page much easier to understand.

## Page details

### Home
- App title and a short explanation: “Submit a print request and track its progress.”
- Login and Register links.
- A small note that the app tracks jobs; the physical document is still handled by the print shop.

### Register
Fields: Full name, email, password, confirm password (frontend-only convenience). Show required-field messages. No role selector. On success, show confirmation and move to login or directly sign in only if that behaviour is implemented consistently.

### Login
Fields: Email and password. Show a general “Email or password is incorrect” message rather than revealing which account exists. A successful login routes students to `/dashboard` and staff to `/staff/queue`.

### Student dashboard
- Greeting and “New print request” primary button.
- Optional status summary counts for the user's jobs.
- Job list with status, document label, page/copy counts, creation time and estimated wait for queued jobs.
- Filter by status and search by document label are optional small enhancements after the base list works.
- Empty state: “You have no print requests yet.”

### New print request
Fields and rules:
- Document label (required, max 120 characters).
- Number of pages (integer 1–500).
- Number of copies (integer 1–20).
- Print mode: Black and white (`mono`, default) or Colour (`color`).
- Sides: Single-sided (`single`, default) or Double-sided (`double`).
- Optional note (max 300 characters).
- Submit and Cancel buttons.

Show a short instruction that this form tracks a request and does not upload the document. On successful creation, navigate to the job detail or dashboard and show a success message.

### Job detail
Show request details, current status, created/updated time and a status timeline or simple sequence. Students see Edit and Cancel only when status is `queued`. Staff sees status action appropriate to the current status. Hide inappropriate buttons in the UI, but enforce the same rules in the API.

### Staff queue
- Queue table/list sorted oldest first.
- Filter dropdown: All active, Queued, Printing, Ready for pickup, Completed, Cancelled.
- Display student name/email only as needed for shop operation; do not expose password or private account information.
- Show job label, pages, copies, print mode, sides, submitted time and current status.
- Each row shows only the next valid action (e.g., “Start printing”, “Mark ready”, “Mark completed”).
- Confirm before marking a job completed if desired, but do not add a complex modal library.

### Not found and error states
- Not-found page offers a link home.
- API failures show a plain language message and a Retry button where it makes sense.
- If a session expires, clear the token and return to login with a short explanation.

## Responsive behaviour
On narrow screens, stack form fields vertically and turn wide tables into cards or allow a controlled horizontal scroll. Keep buttons large enough to tap. Test at approximately 375px, 768px and 1366px widths.

## Visual direction
Use a clean campus utility style: neutral background, one primary accent colour, clear headings, subtle borders and restrained shadows. The UX should look finished, but the team should write the CSS themselves rather than introducing a large UI framework.


---

# 05 — Architecture and Technology Decisions

## 1. Architecture overview

```text
Student / Shop Staff browser
          |
          | HTTPS: JSON requests + Bearer token
          v
React + Vite frontend (Vercel project: client/)
          |
          | VITE_API_BASE_URL
          v
Express REST API (Vercel project: server/)
  - routes
  - input validation
  - JWT authentication
  - role and ownership checks
  - Supabase JavaScript client
          |
          | Supabase Data API (server-side secret key)
          v
Supabase PostgreSQL
  - users
  - print_jobs
```

The frontend never accesses the Supabase secret key. The Express API is the only application component that reads and writes database rows.

## 2. Selected technologies

| Area | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Matches the React topics in the course and is straightforward to run locally. |
| Language | JavaScript | Beginner-friendly and avoids TypeScript setup overhead for this project. |
| Styling | CSS | Keeps styling visible and easy to explain. |
| Routing | React Router | Supports separate pages without full page reloads. |
| Backend | Node.js + Express | Demonstrates routing, middleware and REST API concepts. |
| Database | Supabase PostgreSQL | Hosted relational database requested by the project owner. |
| Data access | `@supabase/supabase-js` in backend only | Avoids managing raw SQL connections in each controller while keeping the API explicit. |
| Password hashing | `bcryptjs` | Stores a password hash instead of a plain-text password. |
| Token | `jsonwebtoken` | Allows protected API requests using a signed token. |
| Hosting | Vercel | One Vercel project for the frontend and one for the Express API. |

## 3. Why two Vercel projects?
The repository is kept as a simple monorepo with `client/` and `server/` folders. Configure one Vercel project with root directory `client`, and a second with root directory `server`. The frontend receives `VITE_API_BASE_URL`; the server receives the database key, token secret and allowed frontend origin. This keeps dependencies and environment variables separated.

Vercel documents that an Express application can be deployed as a Vercel Function. Its serverless execution model is different from a continuously running local Node process. Avoid in-memory storage for jobs or sessions: persistent information belongs in Supabase. Official guide: https://vercel.com/docs/frameworks/backend/express

## 4. Request lifecycle
1. User presses an action in React.
2. A small helper in `client/src/api/api.js` sends a `fetch()` request.
3. For protected requests, the helper attaches the token in `Authorization: Bearer ...`.
4. Express parses JSON and runs the relevant middleware.
5. The API validates fields and checks the user role/ownership.
6. The API calls Supabase and checks both returned `error` and `data`.
7. Express sends a JSON success or error response.
8. React updates the relevant state or shows an error message.

## 5. Suggested folder layout

```text
printqueue/
  README.md
  docs/
  database/
    schema.sql
    promote-staff-example.sql
  client/
    package.json
    .env.example
    index.html
    src/
      main.jsx
      App.jsx
      api/
        api.js
      components/
        Navbar.jsx
        StatusBadge.jsx
        JobCard.jsx
        LoadingMessage.jsx
        ErrorMessage.jsx
      context/
        AuthContext.jsx
      pages/
        Home.jsx
        Register.jsx
        Login.jsx
        Dashboard.jsx
        NewJob.jsx
        JobDetails.jsx
        StaffQueue.jsx
        NotFound.jsx
      styles/
        global.css
  server/
    package.json
    .env.example
    index.js
    src/
      config/
        supabase.js
      middleware/
        authMiddleware.js
        errorMiddleware.js
      routes/
        authRoutes.js
        jobRoutes.js
      controllers/
        authController.js
        jobController.js
      utils/
        validation.js
```

This is a guide, not a demand to create every file before coding. If a file is initially too small, it can stay in the route/controller where it is most understandable. Do not add repositories, service layers, dependency-injection systems, Redux, TypeScript, or microservices.

## 6. Important design decisions
- Keep business rules in the backend, not only in React.
- Do not trust `user_id`, `role`, or `status` received in a create-job request.
- A Vercel deployment must not rely on a local JSON file or in-memory array for persistent data.
- The current architecture uses custom app JWTs, not Supabase Auth. The database secret key is used only by Express. This is chosen to demonstrate the syllabus's JWT/bcrypt concepts; for a larger real-world product, consider using a mature managed auth system instead of maintaining custom authentication.
- `supabase-js` with a server secret can bypass database RLS. Therefore, never expose that key and perform strict authorisation checks in every API handler. RLS remains enabled and no public table policies are created for this architecture.

## 7. Decisions intentionally not made
- No state-management library; use React state and a small AuthContext.
- No ORM; the supplied Supabase client is enough.
- No file storage.
- No WebSockets/real-time subscription for version 1; refresh data after a successful action and offer a manual Refresh button.
- No Docker, microservices, GraphQL or cloud-native extras.


---

# 06 — Database Design

## Database choice
Use Supabase's hosted PostgreSQL database. PostgreSQL is relational: tables have columns, primary keys and foreign keys. This differs from the MongoDB/Mongoose data model described in the original FSD-I lab syllabus. The requested Supabase option is documented here as a deliberate substitution.

## Entity relationship overview

```text
users (1) ---------------- (many) print_jobs
users.id                    print_jobs.user_id
```

A user may create many print jobs. Each job has exactly one owner. Staff accounts are rows in `users` whose role is `staff`; they do not need a separate staff table.

## Table: `users`

| Column | Type | Rules / purpose |
|---|---|---|
| `id` | UUID | Primary key; generated by PostgreSQL |
| `full_name` | VARCHAR(100) | Required display name |
| `email` | VARCHAR(255) | Required, unique, normalised lowercase |
| `password_hash` | TEXT | Required bcrypt hash; never returned to client |
| `role` | TEXT | `student` or `staff`; default `student` |
| `created_at` | TIMESTAMPTZ | Defaults to current time |

## Table: `print_jobs`

| Column | Type | Rules / purpose |
|---|---|---|
| `id` | UUID | Primary key; generated by PostgreSQL |
| `user_id` | UUID | Required foreign key to `users.id`; job owner |
| `document_name` | VARCHAR(120) | Required label for the document; no file is uploaded |
| `pages` | INTEGER | 1–500 |
| `copies` | INTEGER | 1–20; defaults to 1 in the UI |
| `print_mode` | TEXT | `mono` or `color` |
| `sides` | TEXT | `single` or `double` |
| `notes` | VARCHAR(300) | Optional note |
| `status` | TEXT | `queued`, `printing`, `ready_for_pickup`, `completed`, or `cancelled` |
| `created_at` | TIMESTAMPTZ | Defaults to current time; queue ordering uses this |
| `updated_at` | TIMESTAMPTZ | Set by backend on edits and status changes |

## Constraints and indexes
- Email is unique.
- `pages` and `copies` have database `CHECK` constraints as a second line of defence.
- Enum-like columns use `CHECK` constraints.
- Add indexes on `print_jobs(user_id)` and `print_jobs(status, created_at)` for the primary lookups.
- Enable Row Level Security (RLS) on both tables.
- Revoke table privileges from `anon` and `authenticated` for this design because browser clients do not access these tables directly. Keep access on the backend only. The backend secret key can bypass RLS, so API authorisation is critical.

## Data rules
1. The backend chooses `user_id` from the verified token.
2. The backend chooses initial status `queued`.
3. Public registration always assigns role `student`.
4. Student queries always filter by the authenticated user's ID.
5. Staff-only operations verify `role === 'staff'` on the server.
6. Student updates are allowed only for their own queued jobs.
7. For any update, the backend sets `updated_at` to the current time.

## Creating the database
Open Supabase Dashboard → SQL Editor, review `database/schema.sql`, and run it once on the intended project. Use the `public` schema as written. Inspect the two tables in Table Editor afterwards.

## Provisioning a staff account
Register a normal account through PrintQueue first. Then run `database/promote-staff-example.sql` after replacing the sample email with the account's email. Never add a public role selector or allow a student to change their own role.

## Example data
For the demo, create jobs through the application UI after registering a test student. This exercises the real create flow and avoids seeding jobs with missing or fake user accounts.


---

# 07 — REST API Contract

Base path: `/api`  
Content type: `application/json`  
Protected endpoint header: `Authorization: Bearer <JWT>`

## Standard responses

Success:
```json
{ "success": true, "data": {} }
```

Error:
```json
{ "success": false, "message": "Readable error message" }
```

Validation errors may include:
```json
{ "success": false, "message": "Please check the form.", "errors": { "pages": "Pages must be between 1 and 500." } }
```

Do not return raw database errors, stack traces, password hashes or secrets.

## Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Returns `{ "success": true, "data": { "status": "ok" } }` |
| POST | `/api/auth/register` | Public | Create student account |
| POST | `/api/auth/login` | Public | Verify credentials and return token + safe user |
| GET | `/api/auth/me` | Signed-in user | Return current safe user |
| GET | `/api/jobs/my` | Student | List only the current student's jobs |
| POST | `/api/jobs` | Student | Create a queued job |
| GET | `/api/jobs/:id` | Owner or staff | Get one job if owner or staff |
| PATCH | `/api/jobs/:id` | Owner, queued job only | Edit job metadata |
| PATCH | `/api/jobs/:id/cancel` | Owner, queued job only | Cancel own queued job |
| GET | `/api/jobs/queue` | Staff | List all jobs for staff queue, oldest first |
| PATCH | `/api/jobs/:id/status` | Staff | Move job to the next allowed status |

## Registration
`POST /api/auth/register`

Request:
```json
{
  "fullName": "Aman Sharma",
  "email": "aman@example.com",
  "password": "ExamplePassword123"
}
```

Rules: all fields required; trimmed full name 2–100 chars; valid email; password at least 8 chars. Normalise email to lowercase. The server hashes the password and assigns role `student`. Duplicate email returns HTTP 409. Do not send back `password_hash`.

Success: HTTP 201 with `data.user` containing `id`, `fullName`, `email`, `role`.

## Login
`POST /api/auth/login`

Request:
```json
{ "email": "aman@example.com", "password": "ExamplePassword123" }
```

Success: HTTP 200 with `data.token` and `data.user`. Invalid credentials return HTTP 401 with a generic message such as “Email or password is incorrect.” JWT expiration is four hours. Sign the token using `JWT_SECRET` and include only minimal claims such as user `id` and role.

## Create a job
`POST /api/jobs`

Request:
```json
{
  "documentName": "DBMS assignment",
  "pages": 12,
  "copies": 1,
  "printMode": "mono",
  "sides": "double",
  "notes": "Please staple the pages"
}
```

Do not accept `user_id`, `status`, `role`, or timestamps from the client. The server sets owner from the verified token, status to `queued`, and timestamps in the database. Return HTTP 201 and the created job without sensitive user fields.

## List my jobs
`GET /api/jobs/my?status=queued&search=DBMS`

All query parameters are optional. `status` must be one of the allowed values. `search` matches a document label and is optional. The backend always filters results to the current user's ID. Return jobs newest-first for the student dashboard; staff queue ordering is handled separately.

## Get one job
`GET /api/jobs/:id`

Return 404 if the ID does not exist. If the job exists but belongs to another student, return 403 or 404 consistently; for a beginner project, 404 can avoid confirming that another user's job exists. Staff may read any job.

## Update job details
`PATCH /api/jobs/:id`

Allowed body fields: `documentName`, `pages`, `copies`, `printMode`, `sides`, `notes`. Do not allow `status`, `user_id`, `id`, `created_at` or role changes here. Only the owner may update, and only while status is `queued`. Update `updated_at`.

## Cancel job
`PATCH /api/jobs/:id/cancel`

No meaningful body is required. Only the owner may cancel a job whose status is `queued`. Server sets status `cancelled` and updates `updated_at`. Any other status returns HTTP 409.

## Staff queue
`GET /api/jobs/queue?status=queued`

Staff role required. Supported optional filter: `status`. Default view can show all active jobs, excluding completed and cancelled; provide a separate All filter if desired. Sort active waiting jobs by `created_at` ascending so the oldest queued job is first. Do not accept an arbitrary database column for sorting.

## Staff status update
`PATCH /api/jobs/:id/status`

Request:
```json
{ "status": "printing" }
```

Staff role required. Only allow the next step:
- `queued` → `printing`
- `printing` → `ready_for_pickup`
- `ready_for_pickup` → `completed`

If the requested transition is not valid, return HTTP 409. Update `updated_at`.

## HTTP status codes
- `200 OK`: successful read/update/login.
- `201 Created`: successful register/create.
- `400 Bad Request`: malformed or invalid input.
- `401 Unauthorized`: missing/invalid/expired token or invalid login.
- `403 Forbidden`: authenticated but not allowed to perform action.
- `404 Not Found`: record or route not found.
- `409 Conflict`: duplicate email or invalid workflow transition.
- `500 Internal Server Error`: unexpected server failure; keep details in server logs only.

## Implementation note
These are the contract requirements, not a requirement to copy every example verbatim. Keep request/response naming consistent across React and Express. Use a single `apiFetch()` helper on the frontend so token headers and JSON errors are handled in one obvious place.


---

# 08 — Security and Privacy Requirements

## 1. Authentication
- Hash every password with `bcryptjs` before storing it.
- Never store or log plaintext passwords.
- Use a strong random `JWT_SECRET` in each environment. Do not reuse example text as a real secret.
- Set token expiry (four hours for this academic MVP).
- Verify every protected request server-side.
- Keep only the user ID and a minimal role claim in the token. The backend should re-check that the user exists and, for role-sensitive operations, may retrieve the current role from the database so a changed role does not persist until the old token expires.
- On logout, remove the token from the browser session.

## 2. Frontend token handling
For the beginner MVP, keep the JWT in `sessionStorage` so a tab refresh works but the session does not persist indefinitely after the browser session ends. This does not make the token immune to cross-site scripting. Keep the UI simple, do not inject untrusted HTML, and do not treat frontend route guards as security boundaries. For a real public-facing service, prefer a carefully configured HttpOnly, Secure, SameSite cookie design after learning the additional CSRF and cookie requirements.

## 3. Authorization rules
- Public registration always creates a student.
- Students may list only their own jobs.
- Students may edit/cancel only their own queued jobs.
- Students cannot call staff queue or status update endpoints.
- Staff access is checked in Express middleware/controller code on every staff endpoint.
- `user_id`, `role`, `status`, timestamps and owner details are server-controlled fields.
- Do not rely on hiding a button in React to enforce a rule.

## 4. Supabase key safety
Use these backend environment variables:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

Current Supabase guidance recommends publishable keys for browser code and secret keys for backend components. Secret keys bypass Row Level Security and must never be shipped to the browser, committed to Git, pasted into a public issue, or included in a screenshot. See: https://supabase.com/docs/guides/getting-started/api-keys

This architecture deliberately sends all database calls through Express. Keep RLS enabled on `users` and `print_jobs`, and do not create public `anon`/`authenticated` table policies for these tables. The server key bypasses RLS, so the API's ownership and role checks are mandatory. RLS is not a substitute for those checks in this design.

## 5. Environment variables
- Put local secrets in `server/.env`, excluded by `.gitignore`.
- The frontend may contain only `VITE_API_BASE_URL`, which is a public URL and not a secret.
- Anything prefixed with `VITE_` is bundled into browser code. Never name a secret `VITE_SUPABASE_SECRET_KEY`.
- Set production values in Vercel Project Settings → Environment Variables.
- After changing environment variables in Vercel, redeploy so the deployment receives the new values.

## 6. Input and error safety
- Validate all client data again in Express.
- Limit text lengths and numeric ranges.
- Restrict enum values to the documented allowed values.
- Use parameterised Supabase client filters rather than constructing raw SQL strings from user input.
- Do not return `password_hash` in any response.
- Do not display database error objects or stack traces in the browser.
- Do not log passwords, JWTs, full secret values or sensitive student notes.

## 7. CORS and transport
- Configure CORS to allow only the intended frontend URL in production (set by `FRONTEND_ORIGIN`).
- For local development, allow the local Vite origin.
- Use HTTPS in deployed environments; Vercel deployment URLs provide HTTPS.

## 8. Privacy
- Store only name, email, password hash, print metadata and status timestamps needed for the project.
- Do not store the actual document file.
- Avoid asking for student ID, phone number or personal details unless the project requirements change.
- Use fake/demo accounts for classroom presentations.
- Provide a way to delete test jobs through the UI or Supabase Table Editor before a public demo if needed.

## 9. Student project limitation
This is a learning project, not a security-audited production print service. Do not use real sensitive documents or re-used passwords for the demonstration. A production version would need a fuller threat model, rate limiting, password reset process, stronger session design, monitoring and privacy review.


---

# 09 — Test Plan and Acceptance Checklist

## How to test
Test manually after each milestone. Use a local test student, a second student, and a staff account. Postman or the VS Code REST Client can be used to test API endpoints independently of the React UI.

## Authentication tests

| ID | Action | Expected result |
|---|---|---|
| T-01 | Register with valid name, email, password | Account created with role `student` |
| T-02 | Register same email again | HTTP 409; no duplicate user |
| T-03 | Register with missing/invalid email | Clear validation message; no account created |
| T-04 | Register with weak/short password | Clear validation message |
| T-05 | Login with correct credentials | Token and safe user are returned |
| T-06 | Login with incorrect password | HTTP 401 generic message |
| T-07 | Call a protected endpoint without token | HTTP 401 |
| T-08 | Call a protected endpoint with expired/invalid token | HTTP 401 |
| T-09 | Logout and refresh a protected page | Session is cleared and login is required |

## Job tests

| ID | Action | Expected result |
|---|---|---|
| T-10 | Create job with valid fields | Job created with owner from token and status `queued` |
| T-11 | Create job with pages 0 or 501 | Rejected by server validation |
| T-12 | Create job with copies 0 or 21 | Rejected by server validation |
| T-13 | Submit invalid status/user_id in request | Ignored or rejected; server-controlled values stay safe |
| T-14 | Student loads their job list | Only that student's jobs appear |
| T-15 | Student A requests Student B's job ID | Access denied or 404; no job data disclosed |
| T-16 | Owner edits a queued job | Update succeeds and `updated_at` changes |
| T-17 | Owner edits a printing job | HTTP 409/403; no edit occurs |
| T-18 | Owner cancels queued job | Status becomes `cancelled` |
| T-19 | Owner cancels printing job | Rejected; status unchanged |
| T-20 | Student calls staff queue | HTTP 403 |
| T-21 | Student attempts status update | HTTP 403 |
| T-22 | Staff moves queued → printing | Update succeeds |
| T-23 | Staff attempts queued → completed | HTTP 409; invalid transition blocked |
| T-24 | Staff moves printing → ready → completed | Both allowed transitions succeed |

## UI tests

| ID | Action | Expected result |
|---|---|---|
| T-25 | Open dashboard while jobs are loading | Loading state appears |
| T-26 | Open dashboard with no jobs | Friendly empty state appears |
| T-27 | Force API to fail / disconnect internet | Error message appears; app does not pretend the action succeeded |
| T-28 | Create job successfully | List/details refresh and confirmation appears |
| T-29 | Try to cancel a queued job | Confirmation is shown, then the status updates |
| T-30 | Navigate directly to `/staff/queue` as student | Frontend redirects, and API still returns 403 if called directly |
| T-31 | Open unknown URL | Not-found page appears |
| T-32 | Use pages at 375px and 1366px widths | Forms and job list remain usable |

## Deployment tests
- Open frontend deployment and register a demo user.
- Submit a job; confirm row appears in Supabase Table Editor.
- Promote a second demo account to staff and verify staff queue.
- Verify browser JavaScript bundle/source does not contain the Supabase secret key or JWT signing secret.
- Check Vercel function logs for errors without exposing credentials.
- Verify the production CORS origin is the frontend deployment URL.

## Release acceptance checklist
- [ ] All Must requirements from the PRD work.
- [ ] Database constraints reject invalid values.
- [ ] Ownership and staff permissions tested through the API.
- [ ] No secrets committed to the repository.
- [ ] Loading, empty, success and error states are present.
- [ ] README steps work on a clean machine.
- [ ] Deployed frontend and API both work.
- [ ] Demo data does not contain real private documents or credentials.


---

# 10 — Local Setup and Vercel + Supabase Deployment

## A. Accounts and tools
You will need Node.js (use a current LTS release), npm, a GitHub repository, a Supabase account, and a Vercel account. Start with local development before deploying.

Official references:
- Vercel Express guide: https://vercel.com/docs/frameworks/backend/express
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Supabase API keys and secret-key guidance: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase JavaScript client install: https://supabase.com/docs/reference/javascript/installing

## B. Create the database
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `database/schema.sql` once.
4. Verify `users` and `print_jobs` exist in Table Editor.
5. Keep RLS enabled. For this architecture, do not add public table policies because the browser does not query the tables directly.
6. In Settings → API Keys, create/use a **secret key** for the backend. Supabase is moving away from legacy `service_role` keys; use the current secret-key option where available. Never expose it to the browser.

## C. Create the frontend
If the `client/` folder is still empty, create the React app first:
```bash
cd client
npm create vite@latest . -- --template react
npm install
npm install react-router-dom
npm run dev
```
If Vite asks questions, select the React JavaScript template (not TypeScript). Keep the CSS plain. If the React app already exists, run `npm install` and `npm run dev` inside `client/` instead.

`client/.env.example` documents the only frontend environment variable:
```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```
Copy it to `client/.env` locally. The actual API base should end with `/api` so a call can use paths such as `/auth/login` or `/jobs/my` without duplicating the prefix.

## D. Create the backend
If the `server/` folder is still empty, initialise and install the small set of packages:
```bash
cd server
npm init -y
npm install express cors dotenv @supabase/supabase-js bcryptjs jsonwebtoken
npm install --save-dev nodemon
```
Then add these scripts to `server/package.json` (keep any dependencies already created by npm):
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```
The backend's `index.js` should export the Express app for Vercel and listen on a local port when run directly. Start it with `npm run dev`. The local API base is `http://localhost:5000/api`. If the backend app already exists, run `npm install` and `npm run dev` inside `server/`.

Copy `server/.env.example` to `server/.env` and fill in real local values:
```dotenv
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
```
Do not copy real keys into this documentation or commit your `.env` files.

Suggested backend packages: `express`, `cors`, `dotenv`, `@supabase/supabase-js`, `bcryptjs`, `jsonwebtoken`. Use `nodemon` as a development dependency if desired. The app should run on a local port only in local development; on Vercel it is exported as an Express app/function. See the official Vercel Express guide for its current entry-point conventions.

## E. Test locally before deployment
1. Run Supabase SQL.
2. Start the backend and verify `GET http://localhost:5000/api/health`.
3. Start the frontend and visit `http://localhost:5173`.
4. Register a student and log in.
5. Create a job and verify it in Supabase.
6. Register a second demo account and promote it to staff using `database/promote-staff-example.sql` with that account's email.
7. Test the staff queue and status workflow.
8. Run the test plan before publishing.

## F. Push to GitHub
Commit source code and documentation, not environment files. Add `.env`, `.env.*` (with a clear exception only if you deliberately commit `.env.example`), `node_modules/`, and build output to `.gitignore`. Check the staged file list before committing.

## G. Deploy the backend to Vercel
1. In Vercel, add a project and import the repository.
2. Set **Root Directory** to `server/`.
3. Confirm the project uses Node.js and that the package manager/build behaviour matches the backend `package.json`.
4. Add environment variables for Production (and Preview/Development if needed):
   - `NODE_ENV=production`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `JWT_SECRET`
   - `FRONTEND_ORIGIN` (update after creating the frontend deployment)
5. Deploy.
6. Open `https://YOUR-API-PROJECT.vercel.app/api/health` and verify the health response.
7. If deployment fails, inspect build and function logs. Confirm the Express entry point is supported by the current Vercel guide and that secrets are set in the right Vercel project/environment.

## H. Deploy the frontend to Vercel
1. Add a second Vercel project using the same repository.
2. Set **Root Directory** to `client/` and select Vite if prompted.
3. Add `VITE_API_BASE_URL=https://YOUR-API-PROJECT.vercel.app/api`.
4. Deploy the frontend.
5. Copy the deployed frontend origin, e.g. `https://YOUR-FRONTEND-PROJECT.vercel.app`, into the backend's `FRONTEND_ORIGIN` setting.
6. Redeploy the backend after changing environment variables.
7. If direct visits to nested React Router routes return 404, configure the SPA fallback in `client/vercel.json` as appropriate for the current Vercel routing behaviour:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## I. Deployment verification
- Visit frontend over HTTPS.
- Register/login, create job, view job, cancel a queued job.
- Verify staff role and transition rules.
- Verify CORS only allows the configured frontend origin (plus local origin in development, not production).
- Search browser source/network responses to make sure the Supabase secret is never sent to the browser.
- Check Vercel logs and Supabase tables.

## J. Common issues

| Symptom | Check |
|---|---|
| Browser shows CORS error | Exact frontend URL in `FRONTEND_ORIGIN`; backend redeployed after changes |
| API returns 500 | Server logs, Supabase URL/key, SQL schema, and returned Supabase `error` handling |
| Register returns duplicate | Email already exists; use another test email or handle HTTP 409 |
| API returns 401 | Bearer header, token expiry, `JWT_SECRET` consistency across deployments |
| Table access denied | Confirm backend uses secret key and table/schema names match; never solve this by exposing a secret in the frontend |
| Refreshing nested page returns 404 | Check the Vercel SPA rewrite configuration |
| Env change seems ignored | Redeploy; Vercel environment changes affect new deployments |

## Hosting architecture note
The Express app on Vercel runs as a function rather than a server process that should keep local data in memory. Use Supabase for all persistent data. Do not use `express.static()` to serve the React build in the backend deployment; the frontend is a separate Vercel project.


---

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


---

# 12 — Beginner-Friendly Code Guidelines

These guidelines are requirements, not optional style suggestions. The purpose is that the student can explain each important file during a practical examination.

## General
- Use JavaScript, not TypeScript.
- Prefer straightforward `if` statements, small functions and clear variable names.
- Prefer `async/await` with `try/catch` over complicated promise chains.
- Write comments for the reason behind non-obvious logic, not for every line.
- Do not copy large blocks of code that the student cannot explain.
- Keep files focused but avoid splitting every small function into its own file.
- Use clear names such as `createJob`, `getMyJobs`, `verifyToken` and `requireStaff`.

## React
- Use functional components and hooks (`useState`, `useEffect`, `useContext`).
- Use React Router for routes.
- Use props for passing data to child components.
- Use `.map()` with a stable key when rendering lists.
- Use normal `fetch()` through one small helper rather than adding a data-fetching library.
- Use controlled form inputs.
- Keep shared authentication state in one small `AuthContext`; keep page-specific state inside the page.
- Do not introduce Redux, Zustand, React Query, custom hook libraries, form libraries or a design system for this scope.
- Avoid `useMemo` and `useCallback` unless there is a demonstrated need.

## Express and backend
- Use a few obvious route files: auth routes and job routes.
- Use middleware for token verification and staff checks.
- Validate input before database operations.
- Keep a controller focused on one route/action.
- Always check errors returned by Supabase and handle missing data deliberately.
- Put `user_id`, status defaults and role decisions on the server.
- Keep an error handler and return clear JSON responses.
- Do not store jobs in an in-memory array or local file.

## Database
- Use the supplied SQL schema; avoid changing field names without updating all documents and code.
- Use UUID IDs and foreign keys.
- Use database constraints as a second line of validation.
- Use the Supabase JavaScript client from the backend only.
- Do not create ad hoc tables for every screen.

## Styling
- Use one global stylesheet plus a small number of page/component rules if needed.
- Use CSS classes and responsive flexbox/grid.
- Avoid large UI frameworks or animation libraries.

## Errors
- On the frontend, show a readable message and keep the form state where possible.
- On the backend, log a safe technical message and return a safe user-facing response.
- Never show stack traces or secret values.

## Quality gate for each feature
1. Explain the feature in one sentence.
2. Identify the React page/component, API endpoint and database table it touches.
3. Implement the smallest working version.
4. Test valid input.
5. Test invalid input and an unauthorised user.
6. Remove unnecessary code and confirm naming is consistent.

## Avoid “enhanced” code
No microservices, custom caching, event buses, repository abstractions, dependency injection containers, generic CRUD frameworks, WebSockets, complicated retry systems, AI features or speculative performance optimisation. The app is successful when it is reliable, complete and understandable—not when it has the most files or libraries.


---

# 13 — Demo Script and Viva Preparation

## Suggested 4–6 minute demonstration

1. **Introduce the problem (30 seconds):** Students often revisit a print shop to ask whether their job is ready. PrintQueue makes requests and statuses visible.
2. **Register/log in as a student (30 seconds):** Explain that registration creates a student role and password is hashed before storage.
3. **Create a job (45 seconds):** Submit an assignment, page count, copies, print mode and sides.
4. **Show the dashboard (30 seconds):** Explain how React fetches job data from the Express API.
5. **Show the staff workflow (60 seconds):** Sign in with a staff account. Move a job from queued to printing, ready for pickup, and completed.
6. **Show security behaviour (30 seconds):** Explain that a student cannot call staff endpoints or edit another student's job. Optionally demonstrate a 403 using Postman.
7. **Show database (30 seconds):** Open Supabase Table Editor and explain `users`, `print_jobs`, primary key and foreign key.
8. **Explain deployment (30 seconds):** Frontend and Express API are separate Vercel projects; Supabase hosts PostgreSQL.

## Likely viva questions and simple answers

**1. What is PrintQueue?**  
A full-stack website that lets students submit print requests and track their status while shop staff manage a shared queue.

**2. What is full-stack development?**  
Building the frontend users see, the backend that applies business rules, and the database that stores persistent information.

**3. Why React?**  
React lets us build the UI from reusable components and update it when state or fetched data changes.

**4. What are props and state?**  
Props pass data from a parent component to a child. State stores data that can change and cause the component to re-render.

**5. What does `useEffect` do here?**  
It can load jobs or the current user when a page is opened or when a relevant dependency changes.

**6. What is a REST API?**  
A set of HTTP endpoints used by the frontend to request or change server data. For example, POST creates a print job and GET lists jobs.

**7. Why use Express?**  
It provides routes and middleware for the API, input validation, authentication and permission checks.

**8. What is CRUD?**  
Create, Read, Update and Delete. PrintQueue creates jobs, reads job lists/details, updates queued job details/status, and permits cancellation according to the rules.

**9. What is middleware?**  
A function that runs during a request before the final route handler, for example verifying a JWT or allowing only staff users.

**10. Why bcrypt?**  
It hashes passwords with a salt so the application does not store the original password.

**11. What is JWT?**  
A signed token that the client sends with protected requests. The server verifies it to identify the user. It must have an expiry and be kept secret from other users.

**12. What is a primary key?**  
A column or set of columns that uniquely identifies a row. Here, each user and print job has a UUID primary key.

**13. What is a foreign key?**  
A database rule linking one table to another. `print_jobs.user_id` references `users.id` to show who owns a job.

**14. Why Supabase?**  
It provides hosted PostgreSQL and a JavaScript client so the project can use a managed database without maintaining a database server.

**15. Why Vercel?**  
It deploys the frontend and can run the Express application as a serverless function, with environment variables managed in project settings.

**16. Is Supabase PostgreSQL the same as MongoDB?**  
No. PostgreSQL is a relational SQL database; MongoDB is a document database. This project deliberately uses PostgreSQL, so it does not demonstrate Mongoose-specific operations.

**17. Why not let React talk directly to the database with the secret key?**  
Anything sent to the browser can be inspected. The Supabase secret key has elevated privileges, so only the server may hold it.

**18. How do you prevent students from changing other people's jobs?**  
The API gets the current user ID from the verified token and checks ownership before returning or changing a record. Hiding buttons in React is not enough.

**19. How is waiting time calculated?**  
For a queued job, the app counts earlier queued jobs and multiplies by an assumed five minutes. It is only an estimate.

**20. What would you improve in a future version?**  
After the core workflow is stable, possible improvements include email notifications, more accurate waiting estimates, a better session design, or a shop dashboard report. These are not required for version 1.

## Important viva honesty
Do not claim the app physically sends files to a printer, sends real-time notifications, or uses MongoDB. Those functions are outside the defined scope.


---

# 14 — FSD-I Syllabus Mapping and Stack Trade-offs

This mapping is based on the supplied FULLSTACK DEVELOPMENT – I semester-5 course plan. That plan describes React components/hooks/router, Node.js/Express API and middleware, MongoDB/Mongoose CRUD, React-backend integration, JWT/bcrypt and deployment.

| Syllabus topic | PrintQueue evidence | Notes |
|---|---|---|
| React components and JSX | Navbar, forms, job cards, dashboards | Component reuse and props |
| Props and `.map()` | Render job list and queue items | Each item uses a stable unique key |
| `useState` | Controlled forms, filters, job status display | State changes update UI |
| `useEffect` | Load current user and jobs | Show loading/error states |
| React Router / SPA | Login, register, dashboard, job detail, staff queue | Protected frontend routes plus server authorisation |
| Node.js environment | Express app runs on Node.js | Local dev and Vercel runtime |
| Express routing | Auth and job endpoints | REST-style routes |
| Middleware | JSON, CORS, token authentication, staff checks, error handler | Input validation can be a middleware or clear controller function |
| CRUD | Create/read/update/cancel print jobs | Delete is represented as a controlled cancel state rather than hard deletion, preserving history |
| MongoDB/Mongoose schema CRUD | Supabase PostgreSQL tables and SQL constraints | **Substituted database**; not Mongoose |
| React + backend integration | `fetch()` to Express API | Explicit request/response JSON |
| JWT + bcrypt | Custom JWT auth and bcrypt password hashing | Implements the course concept |
| Deployment | Vercel frontend + Vercel Express API + Supabase DB | Environment variables and production testing |

## Material deviation from syllabus
The course plan's database experiment asks students to use MongoDB and Mongoose. The user requested Supabase for the database. Supabase's primary database is PostgreSQL, so this implementation uses relational SQL tables and the Supabase JavaScript client. It will not show Mongoose schemas, Mongoose CRUD methods or `.populate()`.

If the instructor grades the specified MongoDB/Mongoose tools as mandatory, replace Supabase with MongoDB Atlas + Mongoose or ask whether the alternative database is permitted. Do not describe Supabase as MongoDB during a demonstration.

## Why keep Express if using Supabase?
The API is retained so the project can demonstrate backend routes, middleware, input validation, server-side role/ownership checks and custom JWT/bcrypt authentication. Supabase is used as the database provider rather than allowing the browser to perform all data operations directly.


---

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
