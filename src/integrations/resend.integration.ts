import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../config/logger';

const resend = new Resend(env.RESEND_API_KEY);

export interface ReminderEmailData {
  to: string;
  task: string;
  assignee: string;
  dueDate: Date | null;
  meetingTitle: string;
  actionItemId: string;
}

export async function sendReminderEmail(
  data: ReminderEmailData
): Promise<{ success: boolean; error?: string }> {
  const dueDateStr = data.dueDate
    ? new Date(data.dueDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No due date set';

  try {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: data.to,
      subject: `Overdue Action Item: ${data.task}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e53e3e;">Action Item Overdue</h2>
          <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 16px; margin: 16px 0;">
            <p><strong>Task:</strong> ${data.task}</p>
            <p><strong>Assigned To:</strong> ${data.assignee}</p>
            <p><strong>Due Date:</strong> ${dueDateStr}</p>
            <p><strong>Meeting:</strong> ${data.meetingTitle}</p>
          </div>
          <p>This action item from your meeting is overdue. Please update its status or complete it as soon as possible.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0;" />
          <p style="color: #718096; font-size: 12px;">Sent by Hintro Meeting Intelligence</p>
        </div>
      `,
    });

    logger.info('Reminder email sent', { actionItemId: data.actionItemId, to: data.to });
    return { success: true };
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to send reminder email', {
      actionItemId: data.actionItemId,
      to: data.to,
      error: err.message,
    });
    return { success: false, error: err.message };
  }
}
