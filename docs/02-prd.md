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
| | FR-16 | Student can upload a PDF file when creating a print job. | Must |
| | FR-17 | Staff can download the uploaded PDF for a job. | Must |
| | FR-18 | PDF files are limited to 10 MB and PDF type only. | Must |
| | FR-19 | Students can only access their own uploaded documents. | Must |
| | FR-20 | Students cannot access staff-only download functionality. | Must |

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
