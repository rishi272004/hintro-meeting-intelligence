import { Response } from 'express';

interface SuccessResponseOptions<T> {
  res: Response;
  data: T;
  statusCode?: number;
}

interface ErrorResponseOptions {
  res: Response;
  code: string;
  message: string;
  statusCode?: number;
  details?: unknown;
}

export function sendSuccess<T>({ res, data, statusCode = 200 }: SuccessResponseOptions<T>): void {
  res.status(statusCode).json({
    traceId: res.locals.traceId,
    success: true,
    data,
  });
}

export function sendError({ res, code, message, statusCode = 400, details }: ErrorResponseOptions): void {
  res.status(statusCode).json({
    traceId: res.locals.traceId,
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}
