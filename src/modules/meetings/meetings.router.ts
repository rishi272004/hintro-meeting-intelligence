import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createMeetingSchema, listMeetingsQuerySchema } from './meetings.schema';
import { createMeeting, getMeeting, listMeetings } from './meetings.controller';

export const meetingsRouter = Router();

meetingsRouter.use(authMiddleware);

meetingsRouter.post('/', validate(createMeetingSchema), createMeeting);
meetingsRouter.get('/', validate(listMeetingsQuerySchema, 'query'), listMeetings);
meetingsRouter.get('/:id', getMeeting);
