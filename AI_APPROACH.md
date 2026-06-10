# AI Approach

## Prompt Design
The analysis prompt is strict and transcript-only. It instructs the model to:
- only use explicitly stated information
- return empty arrays when evidence is missing
- include citations for every generated item
- avoid inventing attendees, decisions, or outcomes

The transcript is rendered in a `[timestamp] speaker: text` format so the model has a stable structure to reference.

## Citation Strategy
- Every transcript entry has a timestamp stored in the database.
- The model is instructed to cite those exact timestamps.
- After generation, timestamps are checked against the real transcript timestamps.
- Citations not present in the transcript are removed.

## Hallucination Prevention
1. Low temperature generation
2. JSON-only response format
3. Strong negative instructions in the prompt
4. Validation of the returned JSON shape
5. Filtering invalid citations against known transcript timestamps

## Output Validation Strategy
The service:
1. Parses the model output as JSON.
2. Validates the overall structure.
3. Filters citations that do not exist in the source transcript.
4. Drops insights that no longer have valid citations.

## Known Limitations
- Very short transcripts may not produce many insights.
- The model can still over-summarize if the transcript is ambiguous.
- The current implementation does not chunk long transcripts.
- Reminder generation is based on the due date and action item status only.
