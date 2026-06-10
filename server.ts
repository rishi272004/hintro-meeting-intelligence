import { connectDatabase, disconnectDatabase } from './src/config/database';
import { env } from './src/config/env';
import { logger } from './src/config/logger';
import { startReminderScheduler } from './src/modules/reminders/reminder.scheduler';
import { createApp } from './src/app';

async function main() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(parseInt(env.PORT, 10), () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`API docs: http://localhost:${env.PORT}/api-docs`);
    logger.info(`Health: http://localhost:${env.PORT}/health`);
  });

  if (env.NODE_ENV !== 'test') {
    startReminderScheduler();
  }

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.error('Fatal startup error', { error });
  process.exit(1);
});
