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
