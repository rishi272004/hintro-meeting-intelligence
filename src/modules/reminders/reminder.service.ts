import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { sendReminderEmail } from '../../integrations/resend.integration';

export class ReminderService {
  async processOverdueReminders(): Promise<void> {
    const traceId = `scheduler-${Date.now()}`;
    logger.info('Reminder scheduler running', { traceId });

    const overdueItems = await prisma.actionItem.findMany({
      where: {
        status: { not: 'COMPLETED' },
        dueDate: { lt: new Date(), not: null },
      },
      include: {
        meeting: { select: { title: true } },
        user: { select: { email: true, name: true } },
      },
    });

    logger.info('Found overdue action items', { traceId, count: overdueItems.length });

    for (const item of overdueItems) {
      const recentReminder = await prisma.reminderLog.findFirst({
        where: {
          actionItemId: item.id,
          sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          success: true,
        },
      });

      if (recentReminder) {
        logger.debug('Skipping reminder already sent within 24h', {
          traceId,
          actionItemId: item.id,
        });
        continue;
      }

      const result = await sendReminderEmail({
        to: item.user.email,
        task: item.task,
        assignee: item.assignee,
        dueDate: item.dueDate,
        meetingTitle: item.meeting.title,
        actionItemId: item.id,
      });

      await prisma.reminderLog.create({
        data: {
          actionItemId: item.id,
          channel: 'email',
          recipient: item.user.email,
          success: result.success,
          errorMessage: result.error,
        },
      });
    }

    logger.info('Reminder scheduler completed', { traceId, processed: overdueItems.length });
  }
}
