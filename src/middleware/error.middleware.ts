import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';
import { sendError } from '../utils/response.util';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  const traceId = res.locals.traceId || 'unknown';

  logger.error('Unhandled error', {
    traceId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (res.headersSent) {
    next(err);
    return;
  }

  sendError({
    res,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
}

export function notFoundMiddleware(req: Request, res: Response): void {
  sendError({
    res,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
}
