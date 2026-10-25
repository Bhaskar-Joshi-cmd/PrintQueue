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
