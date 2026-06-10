import cron from 'node-cron';
import { logger } from '../../config/logger';
import { ReminderService } from './reminder.service';

const reminderService = new ReminderService();

export function startReminderScheduler(): void {
  cron.schedule('0 * * * *', async () => {
    try {
      await reminderService.processOverdueReminders();
    } catch (error) {
      logger.error('Reminder scheduler encountered an error', { error });
    }
  });

  logger.info('Reminder scheduler started (runs every hour)');
}
