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
