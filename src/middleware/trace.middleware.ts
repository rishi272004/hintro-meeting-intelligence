import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';
import { generateTraceId } from '../utils/trace.util';

export function traceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || generateTraceId();
  res.locals.traceId = traceId;
  res.setHeader('x-trace-id', traceId);

  logger.info('Incoming request', {
    traceId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  const start = Date.now();
  res.on('finish', () => {
    logger.info('Request completed', {
      traceId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}
