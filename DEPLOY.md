Deploying to Render (recommended)

This document lists the exact steps used to deploy the Hintro Meeting Intelligence backend to Render and the one-time commands to run post-deploy.

Prerequisites
- A GitHub repo with this project pushed (branch: `main`)
- A Render account
- A Render PostgreSQL database (Managed Postgres)
- The following secrets available: `GROQ_API_KEY`, `GROQ_MODEL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `JWT_SECRET`

Render Web Service setup
1. Create a new Web Service on Render and connect your GitHub repository.
2. Select branch `main`.
3. Root directory: leave blank (project root).
4. Build Command (recommended):

```bash
npm ci --include=dev && npm run build && npx prisma migrate deploy && npx prisma generate
```

5. Start Command:

```bash
node dist/server.js
```

6. Environment variables (set these under *Environment* in the service settings):
- `NODE_ENV=production`
- `DATABASE_URL` — Render Postgres connection string
- `JWT_SECRET` — long random secret
- `JWT_EXPIRES_IN` — e.g. `7d` or `3600`
- `APP_URL` — your Render service URL (e.g., https://hintro-backend-8lq3.onrender.com)
- `GROQ_API_KEY` — Groq API key
- `GROQ_MODEL` — e.g. `llama-3.3-70b-versatile` (must not be empty)
- `RESEND_API_KEY` — Resend API key
- `RESEND_FROM_EMAIL` — verified sender email
- (Optional) `NPM_CONFIG_PRODUCTION=false` if you prefer `npm ci` without `--include=dev`

Post-deploy, one-time (Render Shell or local with `DATABASE_URL` set to Render DB)

Open Service → Shell (or set `DATABASE_URL` locally to the Render Postgres) and run:

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

Health check and smoke test (replace `<APP_URL>` with `APP_URL` value)

```bash
curl -I <APP_URL>/health
# or
curl -sS -X POST "<APP_URL>/api/auth/login" -H "Content-Type: application/json" -d '{"email":"demo@hintro.com","password":"TestPassword123"}'

# Example smoke flow (PowerShell):
$APP='<APP_URL>'
$res = Invoke-RestMethod -Method POST -Uri $APP/api/auth/login -ContentType 'application/json' -Body '{"email":"demo@hintro.com","password":"TestPassword123"}'
$token = $res.data.token
Invoke-RestMethod -Method POST -Uri $APP/api/meetings -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"title":"Smoke","participants":["a@b.com"],"meetingDate":"2026-05-20T10:00:00Z","transcript":[{"timestamp":"00:10","speaker":"John","text":"This is test transcript"}]}'
```

Reminders verification

Run the reminders job and list logs:

```bash
npx tsx src/scripts/run-reminders.ts
npx tsx src/scripts/list-reminders.ts
```

Troubleshooting tips
- If `npx prisma migrate deploy` fails: confirm `DATABASE_URL` points to Render Postgres and the DB is accessible.
- If AI calls fail with `model_not_found`: check `GROQ_MODEL` is set and non-empty.
- If emails do not appear: verify `RESEND_API_KEY` and that `RESEND_FROM_EMAIL` is verified in Resend.

Notes
- Do not commit secrets to the repo. Use Render Environment to store secrets.
- If Render build fails due to missing dev dependencies, use the recommended build command above to include dev deps only during build.

---

If you want, I can commit a small `README` update with the live `APP_URL` and a short usage example for the deployed service. Let me know and I'll patch `README.md` next.
