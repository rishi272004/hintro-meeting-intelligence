import { prisma } from '../config/database';

async function main() {
  try {
    const logs = await prisma.reminderLog.findMany({
      take: 50,
      orderBy: { sentAt: 'desc' },
      include: {
        actionItem: { select: { id: true, task: true, assignee: true } },
      },
    });

    console.log(JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to fetch reminder logs', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
