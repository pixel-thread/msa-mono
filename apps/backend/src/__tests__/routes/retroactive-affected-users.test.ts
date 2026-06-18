import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import type { Express } from 'express';
import bcrypt from 'bcryptjs';

import { prisma } from '@lib/prisma';
import { createAssociation, cleanupByPrefix } from '../helpers/factories';
import { signAccessToken } from '../helpers/auth';

const PREFIX = `test-retro-affected-${Date.now()}`;
const FAKE_UUID = '00000000-0000-4000-8000-000000000001';

describe('POST /api/v1/contributions/retroactive/affected-users', () => {
  let app: Express;
  let token: string;
  let associationId: string;

  beforeAll(async () => {
    const mod = await import('@src/index');
    app = mod.default;
    const association = await createAssociation({ slug: `${PREFIX}-assoc` });
    associationId = association.id;
    const hashedPassword = await bcrypt.hash('ValidPass1!', 4);
    const user = await prisma.user.create({
      data: {
        email: `${PREFIX}@test.com`,
        password: hashedPassword,
        role: ['FINANCE'],
        associationId,
        firstName: 'Test',
        name: `Test User ${PREFIX}`,
        mobile: '9999999999',
        designation: 'Member',
        status: 'ACTIVE',
      },
    });
    token = await signAccessToken(user.id);
  });

  afterAll(async () => {
    await cleanupByPrefix(PREFIX);
  });

  it('should reject when neither planVersionId nor date range is provided → 400', async () => {
    const res = await request(app)
      .post('/api/v1/contributions/retroactive/affected-users')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('should reject when only startDate is provided without endDate → 400', async () => {
    const res = await request(app)
      .post('/api/v1/contributions/retroactive/affected-users')
      .set('Authorization', `Bearer ${token}`)
      .send({ startDate: '2026-01-01' });
    expect(res.status).toBe(400);
  });

  it('should reject when only endDate is provided without startDate → 400', async () => {
    const res = await request(app)
      .post('/api/v1/contributions/retroactive/affected-users')
      .set('Authorization', `Bearer ${token}`)
      .send({ endDate: '2026-06-01' });
    expect(res.status).toBe(400);
  });

  it('should reject non-FINANCE role → 403', async () => {
    const hashedPassword = await bcrypt.hash('ValidPass1!', 4);
    const member = await prisma.user.create({
      data: {
        email: `${PREFIX}-member@test.com`,
        password: hashedPassword,
        role: ['MEMBER'],
        associationId,
        firstName: 'Test',
        name: `Test Member ${PREFIX}`,
        mobile: '9999999999',
        designation: 'Member',
        status: 'ACTIVE',
      },
    });
    const memberToken = await signAccessToken(member.id);

    const res = await request(app)
      .post('/api/v1/contributions/retroactive/affected-users')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ planVersionId: FAKE_UUID });
    expect(res.status).toBe(403);
  });

  it('should return paginated results when querying by planVersionId', async () => {
    const res = await request(app)
      .post('/api/v1/contributions/retroactive/affected-users')
      .set('Authorization', `Bearer ${token}`)
      .send({ planVersionId: FAKE_UUID });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('hasMore');
  });

  it('should return paginated results when querying by date range', async () => {
    const res = await request(app)
      .post('/api/v1/contributions/retroactive/affected-users')
      .set('Authorization', `Bearer ${token}`)
      .send({ startDate: '2026-01-01', endDate: '2026-06-01' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('should accept page query parameter', async () => {
    const res = await request(app)
      .post('/api/v1/contributions/retroactive/affected-users?page=2')
      .set('Authorization', `Bearer ${token}`)
      .send({ planVersionId: FAKE_UUID });

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
  });
});
