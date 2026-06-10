import request from 'supertest';

const meetings = new Map<string, any>();
const actionItems = new Map<string, any>();
const meetingUuid = '11111111-1111-4111-8111-111111111111';

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
  actionItem: {
    create: jest.fn(async ({ data }: any) => {
      const id = `action-${actionItems.size + 1}`;
      const item = {
        id,
        ...data,
        dueDate: data.dueDate ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      actionItems.set(id, item);
      return item;
    }),
    findFirst: jest.fn(async ({ where }: any) => {
      return (
        Array.from(actionItems.values()).find((item) => item.id === where.id && item.userId === where.userId) ?? null
      );
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const item = actionItems.get(where.id);
      const updated = { ...item, ...data, updatedAt: new Date() };
      actionItems.set(where.id, updated);
      return updated;
    }),
    count: jest.fn(async ({ where }: any) => {
      return Array.from(actionItems.values()).filter((item) => {
        if (where.userId && item.userId !== where.userId) return false;
        if (where.status && item.status !== where.status) return false;
        if (where.assignee && !item.assignee.toLowerCase().includes(where.assignee.contains.toLowerCase())) return false;
        if (where.meetingId && item.meetingId !== where.meetingId) return false;
        return true;
      }).length;
    }),
    findMany: jest.fn(async ({ where, skip, take }: any) => {
      return Array.from(actionItems.values())
        .filter((item) => {
          if (where.userId && item.userId !== where.userId) return false;
          if (where.status && item.status !== where.status) return false;
          if (where.assignee && !item.assignee.toLowerCase().includes(where.assignee.contains.toLowerCase())) return false;
          if (where.meetingId && item.meetingId !== where.meetingId) return false;
          if (where.dueDate?.lt && !(item.dueDate && item.dueDate < where.dueDate.lt)) return false;
          return true;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(skip ?? 0, (skip ?? 0) + (take ?? actionItems.size));
    }),
  },
};

jest.mock('../../src/config/database', () => ({ prisma: mockPrisma }));
jest.mock('bcryptjs', () => ({ hash: jest.fn(async () => 'hashed-password'), compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mock-jwt-token'), verify: jest.fn(() => ({ userId: 'user-1', email: 'test@example.com' })) }));

import { createApp } from '../../src/app';

const app = createApp();
let authToken = 'mock-jwt-token';
let meetingId = meetingUuid;
let actionItemId = '';

beforeEach(() => {
  meetings.clear();
  actionItems.clear();
  meetings.set(meetingId, {
    id: meetingId,
    title: 'Test Meeting',
    participants: ['test@example.com'],
    meetingDate: new Date('2026-05-20T10:00:00Z'),
    userId: 'user-1',
    transcript: [{ timestamp: '00:10', speaker: 'Alice', text: 'Please submit the report by Friday.' }],
  });
});

describe('Action Items', () => {
  it('creates an action item', async () => {
    const res = await request(app)
      .post('/api/action-items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        task: 'Submit the report',
        assignee: 'alice@example.com',
        dueDate: '2026-05-24T10:00:00Z',
        meetingId,
        citations: [{ timestamp: '00:10' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
    actionItemId = res.body.data.id;
  });

  it('updates status to IN_PROGRESS', async () => {
    const created = await request(app)
      .post('/api/action-items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        task: 'Submit the report',
        assignee: 'alice@example.com',
        dueDate: '2026-05-24T10:00:00Z',
        meetingId,
        citations: [{ timestamp: '00:10' }],
      });

    const res = await request(app)
      .patch(`/api/action-items/${created.body.data.id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('lists action items filtered by status', async () => {
    await request(app)
      .post('/api/action-items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        task: 'Submit the report',
        assignee: 'alice@example.com',
        dueDate: '2026-05-24T10:00:00Z',
        meetingId,
        citations: [{ timestamp: '00:10' }],
      });

    const res = await request(app)
      .get('/api/action-items?status=PENDING')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.actionItems.every((item: any) => item.status === 'PENDING')).toBe(true);
  });

  it('returns overdue items', async () => {
    await request(app)
      .post('/api/action-items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        task: 'Submit the report',
        assignee: 'alice@example.com',
        dueDate: '2020-05-24T10:00:00Z',
        meetingId,
        citations: [{ timestamp: '00:10' }],
      });

    const res = await request(app).get('/api/action-items/overdue').set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.actionItems)).toBe(true);
  });

  it('rejects invalid statuses', async () => {
    const created = await request(app)
      .post('/api/action-items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        task: 'Submit the report',
        assignee: 'alice@example.com',
        dueDate: '2026-05-24T10:00:00Z',
        meetingId,
        citations: [{ timestamp: '00:10' }],
      });

    const res = await request(app)
      .patch(`/api/action-items/${created.body.data.id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(422);
  });
});
