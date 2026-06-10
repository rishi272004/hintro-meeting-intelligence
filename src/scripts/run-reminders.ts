import { ReminderService } from '../modules/reminders/reminder.service';

(async function run() {
  try {
    const svc = new ReminderService();
    await svc.processOverdueReminders();
    console.log('Reminder job completed');
    process.exit(0);
  } catch (err: any) {
    console.error('Reminder job failed', err);
    process.exit(1);
  }
})();
