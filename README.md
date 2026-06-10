# Hintro Meeting Intelligence Service

AI-powered backend service for meeting management, transcript analysis, action item tracking, and automated reminders.

## Tech Stack

- Node.js 20 + TypeScript
- Express.js
- PostgreSQL + Prisma ORM
- Groq LLaMA 3.3 70B
- JWT bearer authentication
- node-cron scheduler
- Resend email integration
- Zod validation
- Winston logging

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Groq API key
- Resend API key

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
copy .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### 3. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed optional demo data

```bash
npm run db:seed
```

### 5. Run the service

```bash
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port |
| `NODE_ENV` | No | Runtime mode |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `JWT_EXPIRES_IN` | No | Token expiry |
| `GROQ_API_KEY` | Yes | Groq API key |
| `GROQ_MODEL` | No | Groq model name |
| `RESEND_API_KEY` | Yes | Resend API key |
| `RESEND_FROM_EMAIL` | Yes | Verified sender email |
| `APP_URL` | No | App base URL |

## API Usage Examples

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"securepass123"}'
```

### Create Meeting

```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sprint Planning",
    "participants": ["alice@example.com","bob@example.com"],
    "meetingDate": "2026-05-20T10:00:00Z",
    "transcript": [
      {"timestamp":"00:10","speaker":"John","text":"We should launch next Friday."},
      {"timestamp":"00:20","speaker":"Alice","text":"I will prepare release notes."}
    ]
  }'
```

### Analyze Meeting

```bash
curl -X POST http://localhost:3000/api/meetings/MEETING_ID/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API Docs

- Swagger UI: `GET /api-docs`
- Health: `GET /health`
- Evaluation: `GET /api/evaluation`

## Deployment

Suggested Render flow:
1. Push to a public GitHub repository
2. Create a Render Web Service
3. Add a Render PostgreSQL database
4. Set environment variables in Render
5. Build command: `npm ci && npm run build && npx prisma migrate deploy && npx prisma generate`
6. Start command: `node dist/server.js`

### Live Deployment

The project is deployed at: https://hintro-backend-8lq3.onrender.com

Quick smoke-test (PowerShell):
```powershell
$APP='https://hintro-backend-8lq3.onrender.com'
$res = Invoke-RestMethod -Method POST -Uri $APP/api/auth/login -ContentType 'application/json' -Body '{"email":"demo@hintro.com","password":"TestPassword123"}'
$token = $res.data.token
Invoke-RestMethod -Method POST -Uri $APP/api/meetings -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"title":"Smoke","participants":["a@b.com"],"meetingDate":"2026-05-20T10:00:00Z","transcript":[{"timestamp":"00:10","speaker":"John","text":"This is test transcript"}]}'
```

## Testing

```bash
npm test
npm run test:coverage
```

## Manual Updates You Should Make

- Replace `your-email@example.com` in `src/app.ts` with your real email.
- Replace `https://your-app.onrender.com` in `src/app.ts` with your live deployment URL.
- Update `repositoryUrl` if you use a different GitHub repository.
