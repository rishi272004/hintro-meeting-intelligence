import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendError, sendSuccess } from '../../utils/response.util';

const authService = new AuthService();

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.register(req.body);
    sendSuccess({ res, data: result, statusCode: 201 });
  } catch (error) {
    const err = error as { code?: string; message?: string; status?: number };
    if (err.code === 'EMAIL_EXISTS') {
      sendError({
        res,
        code: err.code,
        message: err.message || 'Email already registered',
        statusCode: err.status || 409,
      });
      return;
    }

    next(error as Error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    sendSuccess({ res, data: result });
  } catch (error) {
    const err = error as { code?: string; message?: string; status?: number };
    if (err.code === 'INVALID_CREDENTIALS') {
      sendError({
        res,
        code: err.code,
        message: err.message || 'Invalid credentials',
        statusCode: err.status || 401,
      });
      return;
    }

    next(error as Error);
  }
}
