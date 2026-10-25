# 10 — Local Setup and Vercel + Supabase Deployment

## A. Accounts and tools
You will need Node.js (use a current LTS release), npm, a GitHub repository, a Supabase account, and a Vercel account. Start with local development before deploying.

Official references:
- Vercel Express guide: https://vercel.com/docs/frameworks/backend/express
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Supabase API keys and secret-key guidance: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase JavaScript client install: https://supabase.com/docs/reference/javascript/installing

## B. Create the database
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `database/schema.sql` once.
4. Verify `users` and `print_jobs` exist in Table Editor.
5. Keep RLS enabled. For this architecture, do not add public table policies because the browser does not query the tables directly.
6. In Settings → API Keys, create/use a **secret key** for the backend. Supabase is moving away from legacy `service_role` keys; use the current secret-key option where available. Never expose it to the browser.

## C. Create the frontend
If the `client/` folder is still empty, create the React app first:
```bash
cd client
npm create vite@latest . -- --template react
npm install
npm install react-router-dom
npm run dev
```
If Vite asks questions, select the React JavaScript template (not TypeScript). Keep the CSS plain. If the React app already exists, run `npm install` and `npm run dev` inside `client/` instead.

`client/.env.example` documents the only frontend environment variable:
```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```
Copy it to `client/.env` locally. The actual API base should end with `/api` so a call can use paths such as `/auth/login` or `/jobs/my` without duplicating the prefix.

## D. Create the backend
If the `server/` folder is still empty, initialise and install the small set of packages:
```bash
cd server
npm init -y
npm install express cors dotenv @supabase/supabase-js bcryptjs jsonwebtoken
npm install --save-dev nodemon
```
Then add these scripts to `server/package.json` (keep any dependencies already created by npm):
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```
The backend's `index.js` should export the Express app for Vercel and listen on a local port when run directly. Start it with `npm run dev`. The local API base is `http://localhost:5000/api`. If the backend app already exists, run `npm install` and `npm run dev` inside `server/`.

Copy `server/.env.example` to `server/.env` and fill in real local values:
```dotenv
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
```
Do not copy real keys into this documentation or commit your `.env` files.

Suggested backend packages: `express`, `cors`, `dotenv`, `@supabase/supabase-js`, `bcryptjs`, `jsonwebtoken`. Use `nodemon` as a development dependency if desired. The app should run on a local port only in local development; on Vercel it is exported as an Express app/function. See the official Vercel Express guide for its current entry-point conventions.

## E. Test locally before deployment
1. Run Supabase SQL.
2. Start the backend and verify `GET http://localhost:5000/api/health`.
3. Start the frontend and visit `http://localhost:5173`.
4. Register a student and log in.
5. Create a job and verify it in Supabase.
6. Register a second demo account and promote it to staff using `database/promote-staff-example.sql` with that account's email.
7. Test the staff queue and status workflow.
8. Run the test plan before publishing.

## F. Push to GitHub
Commit source code and documentation, not environment files. Add `.env`, `.env.*` (with a clear exception only if you deliberately commit `.env.example`), `node_modules/`, and build output to `.gitignore`. Check the staged file list before committing.

## G. Deploy the backend to Vercel
1. In Vercel, add a project and import the repository.
2. Set **Root Directory** to `server/`.
3. Confirm the project uses Node.js and that the package manager/build behaviour matches the backend `package.json`.
4. Add environment variables for Production (and Preview/Development if needed):
   - `NODE_ENV=production`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `JWT_SECRET`
   - `FRONTEND_ORIGIN` (update after creating the frontend deployment)
5. Deploy.
6. Open `https://YOUR-API-PROJECT.vercel.app/api/health` and verify the health response.
7. If deployment fails, inspect build and function logs. Confirm the Express entry point is supported by the current Vercel guide and that secrets are set in the right Vercel project/environment.

## H. Deploy the frontend to Vercel
1. Add a second Vercel project using the same repository.
2. Set **Root Directory** to `client/` and select Vite if prompted.
3. Add `VITE_API_BASE_URL=https://YOUR-API-PROJECT.vercel.app/api`.
4. Deploy the frontend.
5. Copy the deployed frontend origin, e.g. `https://YOUR-FRONTEND-PROJECT.vercel.app`, into the backend's `FRONTEND_ORIGIN` setting.
6. Redeploy the backend after changing environment variables.
7. If direct visits to nested React Router routes return 404, configure the SPA fallback in `client/vercel.json` as appropriate for the current Vercel routing behaviour:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## I. Deployment verification
- Visit frontend over HTTPS.
- Register/login, create job, view job, cancel a queued job.
- Verify staff role and transition rules.
- Verify CORS only allows the configured frontend origin (plus local origin in development, not production).
- Search browser source/network responses to make sure the Supabase secret is never sent to the browser.
- Check Vercel logs and Supabase tables.

## J. Common issues

| Symptom | Check |
|---|---|
| Browser shows CORS error | Exact frontend URL in `FRONTEND_ORIGIN`; backend redeployed after changes |
| API returns 500 | Server logs, Supabase URL/key, SQL schema, and returned Supabase `error` handling |
| Register returns duplicate | Email already exists; use another test email or handle HTTP 409 |
| API returns 401 | Bearer header, token expiry, `JWT_SECRET` consistency across deployments |
| Table access denied | Confirm backend uses secret key and table/schema names match; never solve this by exposing a secret in the frontend |
| Refreshing nested page returns 404 | Check the Vercel SPA rewrite configuration |
| Env change seems ignored | Redeploy; Vercel environment changes affect new deployments |

## Hosting architecture note
The Express app on Vercel runs as a function rather than a server process that should keep local data in memory. Use Supabase for all persistent data. Do not use `express.static()` to serve the React build in the backend deployment; the frontend is a separate Vercel project.
