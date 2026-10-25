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
