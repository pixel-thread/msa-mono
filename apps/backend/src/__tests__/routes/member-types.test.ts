import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import type { Express } from 'express';

describe('Member Types Routes — auth', () => {
  let app: Express;

  beforeAll(async () => {
    const mod = await import('@src/index');
    app = mod.default;
  });

  it('should not succeed on GET /api/v1/member-types without token', async () => {
    const res = await request(app).get('/api/v1/member-types');
    expect(res.status).toBe(401);
  });

  it('should not succeed on GET /api/v1/member-types/:id without token', async () => {
    const res = await request(app).get('/api/v1/member-types/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(401);
  });

  it('should not succeed on POST /api/v1/member-types without token', async () => {
    const res = await request(app).post('/api/v1/member-types').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('should not succeed on PATCH /api/v1/member-types/:id without token', async () => {
    const res = await request(app)
      .patch('/api/v1/member-types/00000000-0000-0000-0000-000000000000')
      .send({ name: 'Updated' });
    expect(res.status).toBe(401);
  });

  it('should not succeed on DELETE /api/v1/member-types/:id without token', async () => {
    const res = await request(app).delete(
      '/api/v1/member-types/00000000-0000-0000-0000-000000000000',
    );
    expect(res.status).toBe(401);
  });
});
