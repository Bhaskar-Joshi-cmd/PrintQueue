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
