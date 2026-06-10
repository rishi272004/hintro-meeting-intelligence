import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('TestPassword123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@hintro.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@hintro.com',
      passwordHash,
    },
  });

  const meeting = await prisma.meeting.create({
    data: {
      title: 'Q2 Sprint Planning',
      participants: ['alice@example.com', 'bob@example.com'],
      meetingDate: new Date('2026-05-20T10:00:00Z'),
      userId: user.id,
      transcript: {
        create: [
          { timestamp: '00:10', speaker: 'John', text: 'We should launch the product next Friday.' },
          { timestamp: '00:20', speaker: 'Alice', text: 'I will prepare the release notes by Thursday.' },
          { timestamp: '00:35', speaker: 'Bob', text: 'I need to update the staging environment first.' },
          { timestamp: '00:50', speaker: 'John', text: 'Agreed. We will go with a staged rollout to 10% of users first.' },
        ],
      },
    },
  });

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);

  await prisma.actionItem.create({
    data: {
      task: 'Prepare release notes',
      assignee: 'alice@example.com',
      dueDate: pastDate,
      status: 'PENDING',
      citations: [{ timestamp: '00:20' }],
      meetingId: meeting.id,
      userId: user.id,
    },
  });

  console.log('Seed completed. Demo user: demo@hintro.com / TestPassword123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
