import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Chainable thenable mock for drizzle queries
function createMockQuery(result: any = []) {
  const query: any = () => {};
  query.then = (resolve: any) => Promise.resolve(result).then(resolve);
  query.catch = (reject: any) => Promise.resolve(result).catch(reject);
  query.select = () => query;
  query.from = () => query;
  query.insert = () => query;
  query.update = () => query;
  query.delete = () => query;
  query.where = () => query;
  query.orderBy = () => query;
  query.limit = () => query;
  query.returning = () => query;
  query.values = () => query;
  query.set = () => query;
  return query;
}

vi.mock('../lib/db', () => ({ db: createMockQuery([]) }));

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { communityRoutes } from '../server/routes/community';

let app: ReturnType<typeof Fastify>;

beforeAll(async () => {
  app = Fastify({ logger: false });
  await app.register(cors, { origin: true });
  await app.register(communityRoutes, { prefix: '/api/community' });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Community API routes', () => {
  it('GET /api/community returns ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/community?limit=5' });
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/community/leaderboard returns period', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/community/leaderboard?period=month' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload).period).toBe('month');
  });

  it('GET /api/community/:id/comments returns empty', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/community/00000000-0000-0000-0000-000000000000/comments' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload).ok).toBe(true);
  });

  it('POST /api/community rejects missing fields', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/community', payload: { name: 'Test' } });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/community/:id/feedback requires userId', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/community/x/feedback', payload: { value: 'up' } });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/community/:id/comments requires content', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/community/x/comments', payload: { userId: 'u1' } });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/community supports all query params', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/community?sort=copied&category=backend&author=x&search=test&limit=10' });
    expect(res.statusCode).toBe(200);
  });
});