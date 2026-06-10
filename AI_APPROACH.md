# AI_APPROACH

This document explains prompt design, grounding/citation strategy, hallucination prevention, output validation, and known limitations.

Prompt Design
- The prompt funnels the meeting transcript into a structured instruction that asks the model to produce a JSON object with fields: `summary`, `actionItems`, `decisions`, `followUpSuggestions`.
- Each item must include `citations` that reference transcript timestamps (format `MM:SS` or `MM:SS` depending on transcript schema).
- Temperature is set low (`0.1`) to favor deterministic outputs.

Citation Strategy
- The prompt explicitly instructs the model to only use text from the transcript and to attach at least one citation per generated insight.
- After receiving the model output, the server validates that every citation timestamp exists in the stored transcript; citations referencing missing timestamps are discarded.

Hallucination Prevention
- Lower temperature and explicit instructions reduce creative/hallucinatory outputs.
- The server enforces schema validation (Zod) and rejects any AI output that fails to match the expected JSON structure.
- If validation fails, the request returns `AI_PARSE_ERROR` (502) and the client may retry.

Output Validation & Persistence
- We use `response_format: { type: 'json_object' }` from Groq SDK to encourage JSON outputs.
- The service parses the returned content and runs `analysisResultSchema.safeParse()` (Zod) to guarantee field types and presence.
- Only validated outputs are persisted to `meetingAnalysis` and action items; otherwise, an error is logged.

Known Limitations
- The model can still return unexpected JSON or slightly malformed responses; parsing and schema validation handle most cases but may require manual retries.
- Grounding is prompt-enforced; if the transcript lacks context, the model cannot invent missing factual details.
- Large transcripts may hit token limits; currently `max_tokens` is set to 2000 — for longer transcripts chunking or streaming would be needed.

Future Improvements
- Use a retrieval-augmented approach (RAG) to ground content by explicitly passing only the most relevant transcript segments.
- Add automatic chunking and multi-turn summarization for very long meetings.
- Persist provider diagnostic logs for auditing model outputs over time.