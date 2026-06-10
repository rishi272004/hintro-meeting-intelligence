import request from 'supertest';

const meetings = new Map<string, any>();
const analysisRecords = new Map<string, any>();
const createdActionItems: any[] = [];
const mockGroqCreate = jest.fn();

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockGroqCreate,
      },
    },
  }));
});

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  meeting: {
    findFirst: jest.fn(async ({ where }: any) => {
      return (
        Array.from(meetings.values()).find((meeting) => meeting.id === where.id && meeting.userId === where.userId) ?? null
      );
    }),
  },
  meetingAnalysis: {
    upsert: jest.fn(async ({ create, update }: any) => {
      const record = analysisRecords.get(create.meetingId) ?? null;
      const saved =
        record ?? {
          id: `analysis-${analysisRecords.size + 1}`,
          meetingId: create.meetingId,
          summary: create.summary,
          decisions: create.decisions,
          followUpSuggestions: create.followUpSuggestions,
          rawPrompt: create.rawPrompt,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      const next = {
        ...saved,
        ...update,
        updatedAt: new Date(),
      };
      analysisRecords.set(create.meetingId, next);
      return next;
    }),
  },
  actionItem: {
    createMany: jest.fn(async ({ data }: any) => {
      createdActionItems.push(...data);
      return { count: data.length };
    }),
  },
};

jest.mock('../../src/config/database', () => ({ prisma: mockPrisma }));
jest.mock('bcryptjs', () => ({ hash: jest.fn(async () => 'hashed-password'), compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mock-jwt-token'), verify: jest.fn(() => ({ userId: 'user-1', email: 'test@example.com' })) }));

import { createApp } from '../../src/app';

const app = createApp();
let authToken = 'mock-jwt-token';
const meetingId = 'meeting-analysis-1';

beforeEach(() => {
  meetings.clear();
  analysisRecords.clear();
  createdActionItems.length = 0;
  jest.clearAllMocks();

  meetings.set(meetingId, {
    id: meetingId,
    title: 'Sprint Planning',
    participants: ['alice@example.com', 'bob@example.com'],
    meetingDate: new Date('2026-05-20T10:00:00Z'),
    userId: 'user-1',
    transcript: [
      { id: 't1', timestamp: '00:10', speaker: 'John', text: 'We should launch next Friday.' },
      { id: 't2', timestamp: '00:20', speaker: 'Alice', text: 'I will prepare release notes.' },
    ],
    analysis: null,
  });

  mockGroqCreate.mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            summary: [{ text: 'Team plans to launch next Friday.', citations: [{ timestamp: '00:10' }] }],
            actionItems: [{ task: 'Prepare release notes', assignee: 'Alice', citations: [{ timestamp: '00:20' }] }],
            decisions: [{ text: 'Launch next Friday.', citations: [{ timestamp: '00:10' }] }],
            followUpSuggestions: [{ text: 'Prepare launch materials.', citations: [{ timestamp: '00:20' }] }],
          }),
        },
      },
    ],
  });
});

describe('Analysis Route', () => {
  it('analyzes a meeting transcript and returns grounded output', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/analyze`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.generated.summary[0].citations[0].timestamp).toBe('00:10');
    expect(res.body.data.actionItemsCreated).toBe(1);
    expect(createdActionItems).toHaveLength(1);
  });

  it('rejects meetings with no transcript', async () => {
    meetings.set('empty-meeting', {
      id: 'empty-meeting',
      title: 'Empty Meeting',
      participants: [],
      meetingDate: new Date('2026-05-20T10:00:00Z'),
      userId: 'user-1',
      transcript: [],
      analysis: null,
    });

    const res = await request(app)
      .post('/api/meetings/empty-meeting/analyze')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('NO_TRANSCRIPT');
  });
});
