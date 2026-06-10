import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { setupSwagger } from './docs/swagger';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { traceMiddleware } from './middleware/trace.middleware';
import { env } from './config/env';
import { actionItemsRouter } from './modules/action-items/action-items.router';
import { analysisRouter } from './modules/analysis/analysis.router';
import { authRouter } from './modules/auth/auth.router';
import { meetingsRouter } from './modules/meetings/meetings.router';
import { sendSuccess } from './utils/response.util';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] }));
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));
  app.use(traceMiddleware);

  setupSwagger(app);

  app.get('/health', (req, res) => {
    sendSuccess({
      res,
      data: { status: 'UP', timestamp: new Date().toISOString() },
    });
  });

  app.get('/api/evaluation', (req, res) => {
    sendSuccess({
      res,
      data: {
        candidateName: 'Rishi Mathur',
        email: 'rishimathur2004@gmail.com',
        repositoryUrl: 'https://github.com/rishi272004/hintro-meeting-intelligence',
        deployedUrl: env.APP_URL || 'https://your-app.onrender.com',
        externalIntegration: 'Resend Email API',
        features: [
          'JWT Authentication (register/login)',
          'Meeting Management with transcript storage',
          'AI Analysis via Groq (LLaMA)',
          'Transcript-grounded citations with validation',
          'Action Item extraction + CRUD',
          'Overdue detection (dueDate < now)',
          'Scheduled reminders (node-cron) and Resend email integration',
          'Reminder audit logs (ReminderLog)',
          'Structured logging with Winston and trace IDs',
          'Input validation with Zod',
          'Prisma ORM + PostgreSQL',
          'OpenAPI/Swagger documentation',
        ],
      },
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/meetings', meetingsRouter);
  app.use('/api/meetings', analysisRouter);
  app.use('/api/action-items', actionItemsRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
