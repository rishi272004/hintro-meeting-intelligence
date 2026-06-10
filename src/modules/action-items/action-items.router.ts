import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createActionItem, getOverdueItems, listActionItems, updateStatus } from './action-items.controller';
import { createActionItemSchema, listActionItemsQuerySchema, updateStatusSchema } from './action-items.schema';

export const actionItemsRouter = Router();

actionItemsRouter.use(authMiddleware);

actionItemsRouter.post('/', validate(createActionItemSchema), createActionItem);
actionItemsRouter.patch('/:id/status', validate(updateStatusSchema), updateStatus);
actionItemsRouter.get('/overdue', getOverdueItems);
actionItemsRouter.get('/', validate(listActionItemsQuerySchema, 'query'), listActionItems);
