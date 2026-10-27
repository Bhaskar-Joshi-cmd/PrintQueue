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
- **PDF file:**
  - Accept PDF files only.
  - Maximum file size 10 MB.
  - Display selected filename and file size.
  - Show validation error for invalid files.
  - Prevent submission when PDF is missing.
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
