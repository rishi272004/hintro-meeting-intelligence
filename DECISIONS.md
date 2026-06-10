# Technical Decisions

## 1. Database - PostgreSQL + Prisma ORM
**Chosen:** PostgreSQL with Prisma ORM  
**Why:** The data is relational: users own meetings, meetings own transcripts and action items, and reminder logs need an audit trail. Prisma keeps the schema type-safe and makes queries easy to maintain.  
**Alternatives considered:** SQLite, MongoDB  
**Trade-offs:** Requires a database service, but gives stronger data modeling and future scalability.

## 2. Authentication - JWT Bearer Tokens
**Chosen:** JWT-based auth  
**Why:** It is stateless, simple to implement, and well suited to protected REST endpoints.  
**Alternatives considered:** Session auth, API keys  
**Trade-offs:** JWTs are harder to revoke immediately, but that is acceptable for this scope.

## 3. AI Provider - Groq
**Chosen:** Groq with LLaMA 3.3 70B  
**Why:** It supports fast inference and structured JSON output for analysis workflows.  
**Alternatives considered:** OpenAI, Gemini, Claude, OpenRouter  
**Trade-offs:** External rate limits and API dependency, but the prompt/validation layer reduces output risk.

## 4. External Integration - Resend Email
**Chosen:** Resend  
**Why:** It is a real third-party integration with a simple API and works cleanly in the reminder workflow.  
**Alternatives considered:** Slack, Discord, Telegram, Notion, Google Calendar  
**Trade-offs:** Requires a verified sender domain for production.

## 5. Validation - Zod
**Chosen:** Zod  
**Why:** It gives runtime validation and TypeScript inference from the same schema definitions.  
**Alternatives considered:** Joi, class-validator, express-validator  
**Trade-offs:** Slightly more schema code, but better type safety and readability.

## 6. Scheduler - node-cron
**Chosen:** node-cron  
**Why:** Lightweight and enough for an hourly reminder job without extra infrastructure.  
**Alternatives considered:** BullMQ, Agenda, cloud schedulers  
**Trade-offs:** Runs in-process, so it is simpler but less durable than a job queue.

## 7. Response and Trace Design
**Chosen:** Unified success/error responses with trace IDs everywhere  
**Why:** This keeps logs, client errors, and debugging aligned across the API.  
**Trade-offs:** Slightly more response wrapping, but far better observability.
