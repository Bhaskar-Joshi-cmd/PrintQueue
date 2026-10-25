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
