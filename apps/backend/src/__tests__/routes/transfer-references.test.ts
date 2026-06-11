import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import type { Express } from 'express';
import request from 'supertest';

import {
  createAssociation,
  createUser,
  createAccount,
  cleanupByPrefix,
} from '../helpers/factories';
import { signAccessToken } from '../helpers/auth';

const PREFIX = `test-trf-ref-${Date.now()}`;

describe('POST /api/v1/payments/transfer — with references', () => {
  let app: Express;
  let token: string;
  let associationId: string;
  let sourceAccountId: string;
  let destinationAccountId: string;

  beforeAll(async () => {
    const mod = await import('@src/index');
    app = mod.default;

    const association = await createAssociation({ slug: `${PREFIX}-assoc` });
    associationId = association.id;

    const financeUser = await createUser({
      email: `${PREFIX}-finance@test.com`,
      role: ['FINANCE'],
      associationId,
    });
    token = await signAccessToken(financeUser.id);

    sourceAccountId = (
      await createAccount({
        associationId,
        code: `${PREFIX}-SRC`,
        name: 'Test Source',
        type: 'ASSET',
      })
    ).id;

    destinationAccountId = (
      await createAccount({
        associationId,
        code: `${PREFIX}-DST`,
        name: 'Test Destination',
        type: 'ASSET',
      })
    ).id;
  });

  afterAll(async () => {
    await cleanupByPrefix(PREFIX);
  });

  it('should create a transfer with text references', async () => {
    const res = await request(app)
      .post('/api/v1/payments/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fromAccountId: sourceAccountId,
        toAccountId: destinationAccountId,
        amount: 1000,
        remark: 'Test transfer with references',
        references: [
          { reference: 'CHQ-12345', remarks: 'Cheque from ABC Corp' },
          { reference: 'INV-2024-001', remarks: 'Invoice reference' },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.references).toHaveLength(2);
    expect(res.body.data.references[0].type).toBe('TEXT');
    expect(res.body.data.references[0].reference).toBe('CHQ-12345');
    expect(res.body.data.references[1].reference).toBe('INV-2024-001');
  });

  it('should create a transfer without references (backward compat)', async () => {
    const res = await request(app)
      .post('/api/v1/payments/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fromAccountId: sourceAccountId,
        toAccountId: destinationAccountId,
        amount: 500,
        remark: 'Test transfer without references',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.references).toHaveLength(0);
  });

  it('should reject more than 10 references', async () => {
    const references = Array.from({ length: 11 }, (_, i) => ({
      reference: `REF-${i}`,
    }));

    const res = await request(app)
      .post('/api/v1/payments/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fromAccountId: sourceAccountId,
        toAccountId: destinationAccountId,
        amount: 100,
        remark: 'Test transfer with too many references',
        references,
      });

    expect(res.status).toBe(400);
  });

  it('should reject references with empty strings', async () => {
    const res = await request(app)
      .post('/api/v1/payments/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fromAccountId: sourceAccountId,
        toAccountId: destinationAccountId,
        amount: 100,
        remark: 'Test transfer with invalid reference',
        references: [{ reference: '' }],
      });

    expect(res.status).toBe(400);
  });

  it('should reject references exceeding 500 characters', async () => {
    const res = await request(app)
      .post('/api/v1/payments/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fromAccountId: sourceAccountId,
        toAccountId: destinationAccountId,
        amount: 100,
        remark: 'Test transfer with too long reference',
        references: [{ reference: 'X'.repeat(501) }],
      });

    expect(res.status).toBe(400);
  });
});
