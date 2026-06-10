import { NextFunction, Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response.util';
import { ActionItemsService } from './action-items.service';

const service = new ActionItemsService();

export async function createActionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.createActionItem(req.body, req.user!.userId);
    sendSuccess({ res, data: item, statusCode: 201 });
  } catch (error) {
    const err = error as { code?: string; message?: string; status?: number };
    if (err.code === 'NOT_FOUND') {
      sendError({
        res,
        code: err.code,
        message: err.message || 'Meeting not found',
        statusCode: err.status || 404,
      });
      return;
    }

    next(error as Error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await service.updateStatus(req.params.id as string, req.body, req.user!.userId);
    sendSuccess({ res, data: item });
  } catch (error) {
    const err = error as { code?: string; message?: string; status?: number };
    if (err.code === 'NOT_FOUND') {
      sendError({
        res,
        code: err.code,
        message: err.message || 'Action item not found',
        statusCode: err.status || 404,
      });
      return;
    }

    next(error as Error);
  }
}

export async function listActionItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.listActionItems(req.query as any, req.user!.userId);
    sendSuccess({ res, data: result });
  } catch (error) {
    next(error as Error);
  }
}

export async function getOverdueItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await service.getOverdueItems(req.user!.userId);
    sendSuccess({ res, data: { actionItems: items, total: items.length } });
  } catch (error) {
    next(error as Error);
  }
}
