import request from 'supertest';

const meetings = new Map<string, any>();
const mockMeetingCreate = jest.fn(async ({ data }: any) => {
  const id = `meeting-${meetings.size + 1}`;
  const transcript = data.transcript.create.map((entry: any) => ({
    id: `transcript-${Math.random()}`,
    ...entry,
  }));
  const meeting = {
    id,
    title: data.title,
    participants: data.participants,
    meetingDate: new Date(data.meetingDate),
    userId: data.userId,
    transcript,
    analysis: null,
    actionItems: [],
    _count: { actionItems: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  meetings.set(id, meeting);
  return meeting;
});

const mockMeetingFindFirst = jest.fn(async ({ where }: any) => {
  return (
    Array.from(meetings.values()).find((meeting) => {
      if (where.id && meeting.id !== where.id) return false;
      if (where.userId && meeting.userId !== where.userId) return false;
      return true;
    }) ?? null
  );
});

const mockMeetingCount = jest.fn(async ({ where }: any) => {
  return Array.from(meetings.values()).filter((meeting) => {
    if (where.userId && meeting.userId !== where.userId) return false;
    if (where.OR) {
      return (
        meeting.title.toLowerCase().includes(where.OR[0].title.contains.toLowerCase()) ||
        meeting.participants.includes(where.OR[1].participants.has)
      );
    }
    return true;
  }).length;
});

const mockMeetingFindMany = jest.fn(async ({ where, skip, take }: any) => {
  return Array.from(meetings.values())
    .filter((meeting) => {
      if (where.userId && meeting.userId !== where.userId) return false;
      if (where.OR) {
        return (
          meeting.title.toLowerCase().includes(where.OR[0].title.contains.toLowerCase()) ||
          meeting.participants.includes(where.OR[1].participants.has)
        );
      }
      return true;
    })
    .sort((a, b) => b.meetingDate.getTime() - a.meetingDate.getTime())
    .slice(skip, skip + take);
});

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  meeting: {
    create: mockMeetingCreate,
    findFirst: mockMeetingFindFirst,
    count: mockMeetingCount,
    findMany: mockMeetingFindMany,
  },
};

jest.mock('../../src/config/database', () => ({ prisma: mockPrisma }));
jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mock-jwt-token'), verify: jest.fn(() => ({ userId: 'user-1', email: 'test@example.com' })) }));

import { createApp } from '../../src/app';

const app = createApp();
let authToken = 'mock-jwt-token';

const sampleMeeting = {
  title: 'Sprint Planning',
  participants: ['alice@example.com', 'bob@example.com'],
  meetingDate: '2026-05-20T10:00:00Z',
  transcript: [
    { timestamp: '00:10', speaker: 'John', text: 'We should launch next Friday.' },
    { timestamp: '00:20', speaker: 'Alice', text: 'I will prepare release notes.' },
    { timestamp: '00:35', speaker: 'Bob', text: 'Agreed. Let us proceed with the launch plan.' },
  ],
};

beforeEach(() => {
  meetings.clear();
  jest.clearAllMocks();
  meetings.set('seed-meeting', {
    id: 'seed-meeting',
    title: 'Seed Meeting',
    participants: ['alice@example.com'],
    meetingDate: new Date('2026-05-20T10:00:00Z'),
    userId: 'user-1',
    transcript: [],
    analysis: null,
    actionItems: [],
    _count: { actionItems: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

describe('Meetings Routes', () => {
  it('creates a meeting', async () => {
    const res = await request(app).post('/api/meetings').set('Authorization', `Bearer ${authToken}`).send(sampleMeeting);

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.traceId).toBeDefined();
  });

  it('returns a meeting by id', async () => {
    await request(app).post('/api/meetings').set('Authorization', `Bearer ${authToken}`).send(sampleMeeting);
    const created = Array.from(meetings.values())[0];

    const res = await request(app).get(`/api/meetings/${created.id}`).set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(created.id);
  });

  it('lists meetings with pagination', async () => {
    await request(app).post('/api/meetings').set('Authorization', `Bearer ${authToken}`).send(sampleMeeting);

    const res = await request(app).get('/api/meetings?page=1&limit=5').set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toBeDefined();
    expect(Array.isArray(res.body.data.meetings)).toBe(true);
  });

  it('rejects requests without auth', async () => {
    const res = await request(app).post('/api/meetings').send(sampleMeeting);

    expect(res.status).toBe(401);
  });

  it('rejects invalid transcript timestamps', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...sampleMeeting, transcript: [{ timestamp: 'invalid', speaker: 'Bob', text: 'Hi' }] });

    expect(res.status).toBe(422);
  });
});
