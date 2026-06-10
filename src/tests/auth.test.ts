import request from 'supertest';

const users = new Map<string, any>();
const mockUserFindUnique = jest.fn(async ({ where }: { where: { email: string } }) => {
  return users.get(where.email) ?? null;
});
const mockUserCreate = jest.fn(async ({ data, select }: any) => {
  const user = {
    id: `user-${users.size + 1}`,
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.set(user.email, user);
  return select
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      }
    : user;
});

const mockPrisma = {
  user: {
    findUnique: mockUserFindUnique,
    create: mockUserCreate,
  },
};

jest.mock('../../src/config/database', () => ({ prisma: mockPrisma }));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async () => 'hashed-password'),
  compare: jest.fn(async (password: string, hash: string) => password === 'TestPassword123' && hash === 'hashed-password'),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ userId: 'user-1', email: 'test@example.com' })),
}));

import { createApp } from '../../src/app';

const app = createApp();

describe('Auth Routes', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    users.clear();
  });

  it('registers a new user and returns a JWT', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('mock-jwt-token');
    expect(res.body.traceId).toBeDefined();
  });

  it('rejects invalid registration input', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 for duplicate email', async () => {
    users.set(testUser.email, {
      id: 'user-1',
      email: testUser.email,
      passwordHash: 'hashed-password',
      name: testUser.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('logs in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('mock-jwt-token');
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
