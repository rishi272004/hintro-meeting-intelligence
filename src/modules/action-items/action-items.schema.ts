import { z } from 'zod';

export const createActionItemSchema = z.object({
  task: z.string().min(1, 'Task description is required'),
  assignee: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().datetime('Invalid ISO date').optional(),
  meetingId: z.string().uuid('Invalid meeting ID'),
  citations: z.array(z.object({ timestamp: z.string() })).default([]),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
});

export const listActionItemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  assignee: z.string().optional(),
  meetingId: z.string().uuid().optional(),
});

export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListActionItemsQuery = z.infer<typeof listActionItemsQuerySchema>;
