import { NextFunction, Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response.util';
import { MeetingsService } from './meetings.service';

const meetingsService = new MeetingsService();

export async function createMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meeting = await meetingsService.createMeeting(req.body, req.user!.userId);
    sendSuccess({ res, data: meeting, statusCode: 201 });
  } catch (error) {
    next(error as Error);
  }
}

export async function getMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meeting = await meetingsService.getMeetingById(req.params.id as string, req.user!.userId);
    sendSuccess({ res, data: meeting });
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

export async function listMeetings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await meetingsService.listMeetings(req.query as any, req.user!.userId);
    sendSuccess({ res, data: result });
  } catch (error) {
    next(error as Error);
  }
}
