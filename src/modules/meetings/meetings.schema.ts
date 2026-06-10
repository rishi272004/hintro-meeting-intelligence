import { z } from 'zod';

export const transcriptEntrySchema = z.object({
  timestamp: z.string().regex(/^\d{2}:\d{2}$/, 'Timestamp must be in MM:SS format'),
  speaker: z.string().min(1, 'Speaker name required'),
  text: z.string().min(1, 'Transcript text required'),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, 'Meeting title is required').max(255),
  participants: z
    .array(z.string().email('Each participant must be a valid email'))
    .min(1, 'At least one participant required'),
  meetingDate: z.string().datetime('Invalid ISO date format'),
  transcript: z.array(transcriptEntrySchema).min(1, 'Transcript must have at least one entry'),
});

export const listMeetingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type ListMeetingsQuery = z.infer<typeof listMeetingsQuerySchema>;
