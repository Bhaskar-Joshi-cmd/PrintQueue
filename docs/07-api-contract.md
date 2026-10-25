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
