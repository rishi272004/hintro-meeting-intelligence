# SUBMISSION

Candidate: Rishi Mathur

## Repository
- GitHub: https://github.com/rishi272004/hintro-meeting-intelligence (branch: main)

## Deployed App
- URL: https://hintro-backend-8lq3.onrender.com

## API Docs
- Swagger UI: https://hintro-backend-8lq3.onrender.com/api-docs

## Demo Credentials
- Email: demo@hintro.com
- Password: TestPassword123

## How to verify (steps for grader)
1. Health
```bash
curl -sS https://hintro-backend-8lq3.onrender.com/health
```
Expect JSON {"status":"UP"}

2. Login
```bash
curl -sS -X POST https://hintro-backend-8lq3.onrender.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"demo@hintro.com","password":"TestPassword123"}'
```
3. Create meeting (use returned token)
4. Analyze meeting
```bash
curl -sS -X POST https://hintro-backend-8lq3.onrender.com/api/meetings/MEETING_ID/analyze -H "Authorization: Bearer <TOKEN>"
```
Expect structured JSON with `summary`, `actionItems`, `decisions`, `followUpSuggestions` and `citations` referencing transcript timestamps.

5. Reminders
- Run `npx tsx src/scripts/run-reminders.ts` (or check `reminder_logs` in DB).
- Verify emails in Resend dashboard for `RESEND_FROM_EMAIL`.

## Included docs
- README.md (setup, run, deploy)
- DEPLOY.md (step-by-step Render instructions)
- DECISIONS.md
- AI_APPROACH.md
- TESTING.md
- CHANGELOG.md
- CHECKLIST.md

## Notes and disclaimers
- Do not store secrets in the repo. All secrets are set in Render environment variables.
- Some optional infrastructure items (Docker, CI/CD, Redis, rate-limiting) are not included but can be added upon request.

