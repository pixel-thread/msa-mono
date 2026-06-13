import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import type { Express } from 'express';
import { createAssociation, createUser, cleanupByPrefix } from '../helpers/factories';
import { signAccessToken, getBearerHeader } from '../helpers/auth';
import { prisma } from '@lib';

const PREFIX = `csv-import-test-${Date.now()}`;

describe('POST /api/v1/admin/users/import-csv', () => {
  let app: Express;
  let association: { id: string };
  let adminUser: { id: string };
  let adminToken: string;

  beforeAll(async () => {
    const mod = await import('@src/index');
    app = mod.default;

    association = await createAssociation({ slug: `${PREFIX}-assoc` });
    adminUser = await createUser({
      email: `${PREFIX}-admin@test.com`,
      role: ['SECRETARY'],
      associationId: association.id,
    });
    adminToken = await signAccessToken(adminUser.id);
  });

  afterAll(async () => {
    await cleanupByPrefix(PREFIX);
  });

  it('should import users from a valid CSV', async () => {
    const csvContent = [
      'email,name,mobile,designation',
      `${PREFIX}-1@test.com,User One,9876543210,Engineer`,
      `${PREFIX}-2@test.com,User Two,9876543211,Manager`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .set(getBearerHeader(adminToken))
      .attach('file', Buffer.from(csvContent), 'users.csv');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.created).toBe(2);
    expect(res.body.data.skipped).toBe(0);
    expect(res.body.data.errors).toEqual([]);

    const users = await prisma.user.findMany({
      where: {
        associationId: association.id,
        email: { in: [`${PREFIX}-1@test.com`, `${PREFIX}-2@test.com`] },
      },
    });
    expect(users).toHaveLength(2);
    expect(users[0].password).toBeNull();
    expect(users[0].role).toEqual(['MEMBER']);
    expect(users[0].status).toBe('ACTIVE');
  });

  it('should skip duplicate emails and report them', async () => {
    await createUser({
      email: `${PREFIX}-existing@test.com`,
      role: ['MEMBER'],
      associationId: association.id,
    });

    const csvContent = [
      'email,name,mobile',
      `${PREFIX}-existing@test.com,Already Existing,9876543210`,
      `${PREFIX}-new@test.com,New User,9876543211`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .set(getBearerHeader(adminToken))
      .attach('file', Buffer.from(csvContent), 'users.csv');

    expect(res.status).toBe(201);
    expect(res.body.data.created).toBe(1);
    expect(res.body.data.skipped).toBe(1);
    expect(res.body.data.errors[0].reason).toBe('Email already exists');
  });

  it('should reject invalid rows with validation errors', async () => {
    const csvContent = [
      'email,name,mobile',
      `not-an-email,User One,9876543210`,
      `${PREFIX}-valid@test.com,,9876543210`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .set(getBearerHeader(adminToken))
      .attach('file', Buffer.from(csvContent), 'users.csv');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when no file is attached', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .set(getBearerHeader(adminToken));

    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const csvContent = [
      'email,name',
      `${PREFIX}-noauth@test.com,No Auth`,
    ].join('\n');

    const res = await request(app)
      .post('/api/v1/admin/users/import-csv')
      .attach('file', Buffer.from(csvContent), 'users.csv');

    expect(res.status).toBe(401);
  });
});
