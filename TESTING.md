# TESTING

This document summarizes tests executed, how to run them locally, and known limitations.

How to run tests

```bash
npm ci
npm test
```

What is covered
- Unit tests for core services (auth, meetings, action-items).
- Integration tests for API endpoints using `supertest` (auth flow, meeting creation, analysis route mocked in tests).
- Schema validation tests to ensure AI output validation rejects malformed responses.

Manual smoke tests performed (deployed)
- Health endpoint: `GET /health` — returned UP.
- Auth: login with seeded demo user `demo@hintro.com` / `TestPassword123` — returned JWT.
- Meetings: `POST /api/meetings` — creates meeting with transcript and returns ID.
- AI analysis: `POST /api/meetings/:id/analyze` — returns `analysis` + `generated` structured output; persisted to `meetingAnalysis`.
- Reminders: ran `npx tsx src/scripts/run-reminders.ts` — emails sent and `reminder_logs` shows `success:true`.

Edge cases tested
- Empty transcript → `NO_TRANSCRIPT` (422)
- Missing meeting → `NOT_FOUND` (404)
- AI returns invalid JSON → `AI_PARSE_ERROR` (502)
- Invalid request payloads → Zod returns `VALIDATION_ERROR` with helpful message

Limitations
- Tests that exercise real provider calls (Groq/Resend) are not run in CI. They are executed manually in a deployed environment.
- No end-to-end browser tests or full integration tests running against Render in CI.

Suggested next steps for expanded testing
- Add integration tests that mock the Groq client responses for deterministic AI outputs.
- Add end-to-end tests for the reminders workflow using a test-only email sink or disposable inbox provider.
- Add CI workflow to run `npm test` on PRs.
