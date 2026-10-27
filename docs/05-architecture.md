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

## 5. Storage architecture

The application uses a private Supabase Storage bucket named `printqueue-documents` for PDF files.

- **Bucket privacy:** The bucket must remain private. No broad policies allowing anonymous access.
- **Upload workflow:** 
  1. Frontend calls `POST /jobs/upload-url` with the PDF file metadata.
  2. Backend authenticates the student, validates PDF type (PDF only) and size (max 10 MB).
  3. Backend generates a unique storage path: `<user-id>/<random-unique-id>.pdf`
  4. Backend generates a Supabase signed upload URL using the backend-only secret key.
  5. Backend returns the signed URL and storage path to the frontend.
  6. Frontend uploads the PDF directly to Supabase Storage using the signed URL.
  7. After upload succeeds, frontend submits the print job creation API.
- **Download workflow:**
  1. Staff dashboard displays the filename and a Download PDF action.
  2. Staff clicks Download, triggering `GET /jobs/:id/download-url`.
  3. Backend authenticates the requester and requires staff role.
  4. Backend looks up the job from PostgreSQL and obtains the storage path from the database.
  5. Backend generates a short-lived signed download URL (120 second expiry) using the backend-only secret key.
  6. Backend returns the temporary URL to the frontend.
  7. Frontend navigates to the signed URL to download the PDF.
- **Frontend never receives the backend secret/service-role key.** The frontend uses only the project URL and a public/publishable key to initialize the Supabase client for direct uploads.
- **Vercel deployment note:** The Express backend on Vercel generates signed URLs using `SUPABASE_SECRET_KEY` from environment variables. The frontend on Vercel uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the direct upload client.

The frontend never accesses the Supabase secret key. All signed URL generation happens in the Express API.

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
