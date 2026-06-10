# Testing

## Test Scenarios Executed

### Authentication
- Register with valid data
- Reject invalid email and missing fields
- Reject duplicate email registration
- Login with valid credentials
- Reject invalid credentials

### Meetings
- Create a meeting with transcript data
- Retrieve a meeting by ID
- List meetings with pagination
- Reject missing auth tokens
- Reject malformed transcript timestamps

### Action Items
- Create action items
- Update status to IN_PROGRESS
- Filter by status
- Retrieve overdue action items
- Reject invalid status values

### AI Analysis
- Analyze a meeting transcript
- Verify citations are grounded in the transcript
- Reject meetings without transcripts

## Edge Cases Considered
- Empty transcript arrays
- Invalid timestamps
- Duplicate AI-created action items
- Action items with no due date
- Overdue items already completed
- Reminder deduplication within 24 hours

## Limitations Discovered
- Live Groq and Resend calls are not exercised in unit tests.
- Prisma queries are mocked in tests so they can run without a real database.
- Full end-to-end deployment checks still require a configured PostgreSQL database.
