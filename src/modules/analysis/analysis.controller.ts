import { NextFunction, Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response.util';
import { AnalysisService } from './analysis.service';

const analysisService = new AnalysisService();

export async function analyzeMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await analysisService.analyzeMeeting(req.params.id as string, req.user!.userId);
    sendSuccess({ res, data: result });
  } catch (error) {
    const err = error as { code?: string; message?: string; status?: number };
    if (['NOT_FOUND', 'NO_TRANSCRIPT', 'AI_ERROR', 'AI_PARSE_ERROR'].includes(err.code || '')) {
      sendError({
        res,
        code: err.code || 'ANALYSIS_ERROR',
        message: err.message || 'Analysis failed',
        statusCode: err.status || 500,
      });
      return;
    }

    next(error as Error);
  }
}
