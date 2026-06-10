# DECISIONS

This document summarizes major technical decisions, rationale, alternatives considered, and trade-offs.

1. Database: PostgreSQL + Prisma
- Why: Reliable relational model for meetings, transcripts, action items; Prisma provides type-safe client and migrations.
- Alternatives: MongoDB (flexible schema) — rejected because structured relations and transactions were useful for action-item updates and joins.
- Trade-offs: Slight schema rigidity but improved query correctness and referential integrity.

2. Authentication: JWT bearer tokens
- Why: Stateless, easy to integrate with REST APIs and render deployments; simple to seed demo user for smoke tests.
- Alternatives: Session-based (server state) — would require server-side session storage and additional infra.
- Trade-offs: Requires secure JWT_SECRET management and token expiry considerations.

3. AI Provider: Groq (LLaMA family)
- Why: Chosen for ease of integration and available `response_format` JSON parsing support in the SDK.
- Alternatives: OpenAI / Claude / Gemini — equally valid, swapable via env configuration.
- Trade-offs: Provider-specific model names and quotas; code abstracts provider calls to a single service layer.

4. Citation & Grounding Strategy
- Why: All generated insights must reference transcript timestamps; enforced via prompt design plus JSON schema validation (Zod).
- Alternatives: Post-hoc grounding (search-based) — more complex.
- Trade-offs: Reliant on prompt precision; validation prevents hallucinated outputs being persisted.

5. Reminder Integration: Resend (email)
- Why: Simple, reliable email provider with generous free tier and an SDK; used directly by scheduled job.
- Alternatives: SendGrid, SMTP — similar trade-offs.
- Trade-offs: Requires verified sender; reminder job writes a `reminder_logs` entry for observability.

6. Scheduler: node-cron (simple hourly job + manual runner)
- Why: Lightweight, easy to run within the Node process for this assignment.
- Alternatives: External job scheduler (AWS EventBridge, Render cron) — better for scale but out of scope.
- Trade-offs: Process must stay running; for production, move to a dedicated worker or scheduled platform.

7. Validation & Error Handling
- Chosen: Zod for request and AI-response validation; centralized error handling middleware to return consistent error responses and trace IDs.
- Trade-offs: Slight runtime overhead but significant safety against malformed inputs and AI responses.

8. Logging & Tracing
- Chosen: Winston for structured JSON logs in production; traceId propagated through requests and included in logs and responses for traceability.
- Trade-offs: Keeps logs queryable; requires downstream log aggregator for deeper analysis.

9. Deployment: Render
- Why: Fast, supports managed Postgres, easy GitHub integration for CI-like deploys.
- Alternatives: Railway, Fly.io, Vercel — all viable.

10. Tests
- Tests written with Jest + Supertest for API routes. Tests are excluded from production build but present in repository for evaluation and local verification.

---

If you want any decision expanded (diagrams or deeper justification), I can add more details.