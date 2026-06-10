import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { sendError } from '../utils/response.util';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      sendError({
        res,
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        statusCode: 422,
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    (req as any)[part] = result.data;
    next();
  };
}
