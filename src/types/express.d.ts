import type { AuthTokenPayload } from '../middleware/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
