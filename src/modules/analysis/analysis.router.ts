import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { analyzeMeeting } from './analysis.controller';

export const analysisRouter = Router();

analysisRouter.use(authMiddleware);
analysisRouter.post('/:id/analyze', analyzeMeeting);
