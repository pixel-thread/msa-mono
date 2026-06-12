import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import type { Express } from 'express';

import { createAssociation, createUser, cleanupByPrefix } from '../helpers/factories';
import { signAccessToken } from '../helpers/auth';
import { prisma } from '@lib';
import { generateUserContributions } from '@feature/contributions/services/contribution.service';
import { ContributionStatus } from '@prisma/client';

const PREFIX = `test-plan-change-${Date.now()}`;

describe('Plan change (upgrade/downgrade) → ContributionPeriod handling', () => {
  let app: Express;
  let association: Awaited<ReturnType<typeof createAssociation>>;

  // Plan A: ₹500/month (the "lower" plan)
  let planA: {
    id: string;
    versions: { id: string; amount: number }[];
  };

  // Plan B: ₹1000/month (the "higher" plan)
  let planB: {
    id: string;
    versions: { id: string; amount: number }[];
  };

  beforeAll(async () => {
    const mod = await import('@src/index');
    app = mod.default;

    association = await createAssociation({ slug: `${PREFIX}-assoc` });

    // Create Plan A (₹500) — the cheaper plan
    planA = (await prisma.subscriptionPlan.create({
      data: {
        name: `${PREFIX}-plan-a`,
        associationId: association.id,
        isDefault: false,
        versions: {
          create: {
            amount: 500,
            billingCycle: 'MONTHLY',
            features: {},
          },
        },
      },
      include: { versions: true },
    })) as typeof planA;

    // Create Plan B (₹1000) — the more expensive plan
    planB = (await prisma.subscriptionPlan.create({
      data: {
        name: `${PREFIX}-plan-b`,
        associationId: association.id,
        isDefault: false,
        versions: {
          create: {
            amount: 1000,
            billingCycle: 'MONTHLY',
            features: {},
          },
        },
      },
      include: { versions: true },
    })) as typeof planB;
  });

  afterAll(async () => {
    // Clean up in dependency order
    const assocIds = [association.id];
    await prisma.subscriptionBillingHistory.deleteMany({
      where: { subscription: { user: { associationId: { in: assocIds } } } },
    });
    await prisma.contributionPeriod.deleteMany({
      where: { user: { associationId: { in: assocIds } } },
    });
    await prisma.subscription.deleteMany({
      where: { user: { associationId: { in: assocIds } } },
    });
    await prisma.subscriptionPlanVersion.deleteMany({
      where: { plan: { associationId: { in: assocIds } } },
    });
    await prisma.subscriptionPlan.deleteMany({
      where: { associationId: { in: assocIds } },
    });
    await cleanupByPrefix(PREFIX);
  });

  // ── Helper: create a test user subscribed to a given plan ────────────
  async function createSubscribedUser(emailSuffix: string, planId: string) {
    const user = await createUser({
      email: `${PREFIX}-${emailSuffix}@test.com`,
      password: 'TestPass1!',
      role: ['MEMBER'],
      associationId: association.id,
    });

    // Set a past joining date so contribution generation doesn't skip them
    await prisma.user.update({
      where: { id: user.id },
      data: { dateOfJoiningAssociation: new Date('2024-01-01') },
    });

    const token = await signAccessToken(user.id);

    // Subscribe to the given plan via the API
    await request(app)
      .post('/api/v1/subscriptions/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId })
      .expect(201);

    return { user, token };
  }

  // ── Helper: read a ContributionPeriod ────────────────────────────────
  async function getContribution(userId: string, year: number, month: number) {
    return prisma.contributionPeriod.findUnique({
      where: {
        userId_year_month: { userId, year, month },
      },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // UPGRADE TESTS
  // ════════════════════════════════════════════════════════════════════════

  describe('POST /api/v1/subscriptions/upgrade', () => {
    it('should preserve existing contribution for the current month after upgrade', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan A (₹500) and generate current month
      const { user, token } = await createSubscribedUser('up-preserve', planA.id);
      await generateUserContributions(user.id, currentYear, currentMonth);

      // Verify ₹500
      const before = await getContribution(user.id, currentYear, currentMonth);
      expect(before).not.toBeNull();
      expect(Number(before!.expectedAmount)).toBe(500);

      // Upgrade to Plan B (₹1000)
      await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planB.id })
        .expect(200);

      // Current month must still be ₹500
      const after = await getContribution(user.id, currentYear, currentMonth);
      expect(Number(after!.expectedAmount)).toBe(500);
      expect(Number(after!.dueAmount)).toBe(500);
    });

    it('should backfill current month at old rate when no contributions exist yet', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan A — do NOT generate contributions
      const { user, token } = await createSubscribedUser('up-backfill', planA.id);

      // No contribution yet
      expect(await getContribution(user.id, currentYear, currentMonth)).toBeNull();

      // Upgrade to Plan B (₹1000)
      await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planB.id })
        .expect(200);

      // Current month should be backfilled at ₹500 (old rate)
      const period = await getContribution(user.id, currentYear, currentMonth);
      expect(period).not.toBeNull();
      expect(Number(period!.expectedAmount)).toBe(500);
    });

    it('should update already-generated future periods to the new rate after upgrade', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan A (₹500) and generate ALL 12 months
      const { user, token } = await createSubscribedUser('up-rewrite', planA.id);
      await generateUserContributions(user.id, currentYear, 12);

      // Verify a future month exists at ₹500
      if (currentMonth < 12) {
        const futureMonth = currentMonth + 1;
        const beforeFuture = await getContribution(user.id, currentYear, futureMonth);
        expect(beforeFuture).not.toBeNull();
        expect(Number(beforeFuture!.expectedAmount)).toBe(500);
      }

      // Upgrade to Plan B (₹1000)
      await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planB.id })
        .expect(200);

      // Current month must still be ₹500
      const currentPeriod = await getContribution(user.id, currentYear, currentMonth);
      expect(Number(currentPeriod!.expectedAmount)).toBe(500);

      // ALL future months should now be ₹1000
      for (let m = currentMonth + 1; m <= 12; m++) {
        const futurePeriod = await getContribution(user.id, currentYear, m);
        expect(futurePeriod).not.toBeNull();
        expect(Number(futurePeriod!.expectedAmount)).toBe(1000);
        expect(Number(futurePeriod!.dueAmount)).toBe(1000);
      }
    });

    it('should reject upgrading to the same plan version', async () => {
      const { token } = await createSubscribedUser('up-same', planA.id);

      const res = await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planA.id })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/latest version/i);
    });

    it('should update both planId and planVersionId after upgrade', async () => {
      const { user, token } = await createSubscribedUser('up-planid', planA.id);

      // Verify initially Plan A
      const before = await prisma.subscription.findUnique({ where: { userId: user.id } });
      expect(before!.planId).toBe(planA.id);
      expect(before!.planVersionId).toBe(planA.versions[0].id);

      // Upgrade to Plan B
      await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planB.id })
        .expect(200);

      // Both should now point to Plan B
      const after = await prisma.subscription.findUnique({ where: { userId: user.id } });
      expect(after!.planId).toBe(planB.id);
      expect(after!.planVersionId).toBe(planB.versions[0].id);
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // DOWNGRADE TESTS
  // ════════════════════════════════════════════════════════════════════════

  describe('POST /api/v1/subscriptions/downgrade', () => {
    it('should preserve current month and update future periods on downgrade', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan B (₹1000) and generate ALL 12 months
      const { user, token } = await createSubscribedUser('down-rewrite', planB.id);
      await generateUserContributions(user.id, currentYear, 12);

      // Verify current month at ₹1000
      const beforeCurrent = await getContribution(user.id, currentYear, currentMonth);
      expect(Number(beforeCurrent!.expectedAmount)).toBe(1000);

      // Downgrade to Plan A (₹500)
      await request(app)
        .post('/api/v1/subscriptions/downgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planA.id })
        .expect(200);

      // Current month must still be ₹1000
      const afterCurrent = await getContribution(user.id, currentYear, currentMonth);
      expect(Number(afterCurrent!.expectedAmount)).toBe(1000);

      // ALL future months should now be ₹500
      for (let m = currentMonth + 1; m <= 12; m++) {
        const futurePeriod = await getContribution(user.id, currentYear, m);
        expect(futurePeriod).not.toBeNull();
        expect(Number(futurePeriod!.expectedAmount)).toBe(500);
        expect(Number(futurePeriod!.dueAmount)).toBe(500);
      }

      // Subscription should now point to Plan A
      const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
      expect(sub!.planId).toBe(planA.id);
      expect(sub!.planVersionId).toBe(planA.versions[0].id);
    });

    it('should backfill current month at old rate and create future at new rate on downgrade', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan B (₹1000) — do NOT generate contributions
      const { user, token } = await createSubscribedUser('down-backfill', planB.id);

      // Downgrade to Plan A (₹500)
      await request(app)
        .post('/api/v1/subscriptions/downgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planA.id })
        .expect(200);

      // Current month backfilled at ₹1000 (old rate)
      const currentPeriod = await getContribution(user.id, currentYear, currentMonth);
      expect(currentPeriod).not.toBeNull();
      expect(Number(currentPeriod!.expectedAmount)).toBe(1000);

      // Future months created at ₹500 (new rate)
      if (currentMonth < 12) {
        const nextPeriod = await getContribution(user.id, currentYear, currentMonth + 1);
        expect(nextPeriod).not.toBeNull();
        expect(Number(nextPeriod!.expectedAmount)).toBe(500);
      }
    });

    it('should reject downgrading to the same plan version', async () => {
      const { token } = await createSubscribedUser('down-same', planB.id);

      const res = await request(app)
        .post('/api/v1/subscriptions/downgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planB.id })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/latest version/i);
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // SAFETY TESTS
  // ════════════════════════════════════════════════════════════════════════

  describe('Safety: PAID periods and re-generation', () => {
    it('should NOT update PAID periods when plan changes', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan A (₹500) and generate full year
      const { user, token } = await createSubscribedUser('safe-paid', planA.id);
      await generateUserContributions(user.id, currentYear, 12);

      // Manually mark a future month as PAID (simulating payment)
      if (currentMonth < 12) {
        const futureMonth = currentMonth + 1;
        await prisma.contributionPeriod.update({
          where: {
            userId_year_month: {
              userId: user.id,
              year: currentYear,
              month: futureMonth,
            },
          },
          data: {
            status: ContributionStatus.PAID,
            paidAmount: 500,
            dueAmount: 0,
          },
        });

        // Upgrade to Plan B (₹1000)
        await request(app)
          .post('/api/v1/subscriptions/upgrade')
          .set('Authorization', `Bearer ${token}`)
          .send({ planId: planB.id })
          .expect(200);

        // The PAID period must NOT be changed — still ₹500
        const paidPeriod = await getContribution(user.id, currentYear, futureMonth);
        expect(paidPeriod!.status).toBe(ContributionStatus.PAID);
        expect(Number(paidPeriod!.expectedAmount)).toBe(500);
        expect(Number(paidPeriod!.paidAmount)).toBe(500);

        // But the month AFTER the paid one should be ₹1000
        if (futureMonth < 12) {
          const unpaidFuture = await getContribution(user.id, currentYear, futureMonth + 1);
          expect(Number(unpaidFuture!.expectedAmount)).toBe(1000);
        }
      }
    });

    it('should not overwrite any amounts when contributions are re-generated after plan change', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan A (₹500) and generate current month
      const { user, token } = await createSubscribedUser('safe-regen', planA.id);
      await generateUserContributions(user.id, currentYear, currentMonth);

      // Upgrade to Plan B (₹1000)
      await request(app)
        .post('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: planB.id })
        .expect(200);

      // Current month at ₹500, future months at ₹1000
      expect(
        Number((await getContribution(user.id, currentYear, currentMonth))!.expectedAmount),
      ).toBe(500);

      // Re-run generation for full year (simulating cron job)
      await generateUserContributions(user.id, currentYear, 12);

      // Current month STILL ₹500 — not overwritten
      expect(
        Number((await getContribution(user.id, currentYear, currentMonth))!.expectedAmount),
      ).toBe(500);

      // Future months STILL ₹1000 — not overwritten
      for (let m = currentMonth + 1; m <= 12; m++) {
        const period = await getContribution(user.id, currentYear, m);
        expect(period).not.toBeNull();
        expect(Number(period!.expectedAmount)).toBe(1000);
      }
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // RETROACTIVE PLAN PRICE ADJUSTMENT TESTS
  // ════════════════════════════════════════════════════════════════════════

  describe('PATCH /api/subscriptions/plans/:planId (retroactive adjustment)', () => {
    it('should mark a PAID contribution as PARTIAL when amount increases retroactively', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan A (₹500)
      const { user, token } = await createSubscribedUser('retro-partial', planA.id);
      await generateUserContributions(user.id, currentYear, currentMonth);

      // Mark current month as PAID (fully paid ₹500)
      await prisma.contributionPeriod.update({
        where: {
          userId_year_month: { userId: user.id, year: currentYear, month: currentMonth },
        },
        data: {
          status: ContributionStatus.PAID,
          paidAmount: 500,
          dueAmount: 0,
        },
      });

      // Build a SUPER_ADMIN token to update the plan
      const admin = await createUser({
        email: `${PREFIX}-retro-admin@test.com`,
        password: 'TestPass1!',
        role: ['SUPER_ADMIN'],
        associationId: association.id,
      });
      const adminToken = await signAccessToken(admin.id);

      // Update Plan A amount to ₹700, effective from last month to next month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      await request(app)
        .patch(`/api/v1/subscriptions/plans/${planA.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 700,
          effectiveFrom: oneMonthAgo.toISOString(),
          effectiveTo: oneMonthFromNow.toISOString(),
        })
        .expect(200);

      // The current month should now be PARTIAL with ₹200 dueAmount
      const period = await getContribution(user.id, currentYear, currentMonth);
      expect(period).not.toBeNull();
      expect(Number(period!.expectedAmount)).toBe(700);
      expect(Number(period!.paidAmount)).toBe(500);
      expect(Number(period!.dueAmount)).toBe(200);
      expect(period!.status).toBe(ContributionStatus.PARTIAL);
    });

    it('should forward overpayment surplus to the next period when amount decreases', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Subscribe to Plan B (₹1000)
      const { user } = await createSubscribedUser('retro-surplus', planB.id);
      await generateUserContributions(user.id, currentYear, 12);

      // Mark current month as PAID (fully paid ₹1000)
      await prisma.contributionPeriod.update({
        where: {
          userId_year_month: { userId: user.id, year: currentYear, month: currentMonth },
        },
        data: {
          status: ContributionStatus.PAID,
          paidAmount: 1000,
          dueAmount: 0,
        },
      });

      const nextMonth = currentMonth < 12 ? currentMonth + 1 : 1;
      const nextYear = currentMonth < 12 ? currentYear : currentYear + 1;

      // Build a SUPER_ADMIN token
      const admin = await createUser({
        email: `${PREFIX}-retro-admin2@test.com`,
        password: 'TestPass1!',
        role: ['SUPER_ADMIN'],
        associationId: association.id,
      });
      const adminToken = await signAccessToken(admin.id);

      // Update Plan B amount to ₹600 with retroactive range
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      await request(app)
        .patch(`/api/v1/subscriptions/plans/${planB.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 600,
          effectiveFrom: oneMonthAgo.toISOString(),
          effectiveTo: oneMonthFromNow.toISOString(),
        })
        .expect(200);

      // Current month: expectedAmount=600, paidAmount=600 (surplus 400 forwarded)
      const currentPeriod = await getContribution(user.id, currentYear, currentMonth);
      expect(currentPeriod).not.toBeNull();
      expect(Number(currentPeriod!.expectedAmount)).toBe(600);
      expect(Number(currentPeriod!.paidAmount)).toBe(600);
      expect(currentPeriod!.status).toBe(ContributionStatus.PAID);

      // Next month should have received the ₹400 surplus
      // expectedAmount should also be 600 (same plan update range)
      const nextPeriod = await getContribution(user.id, nextYear, nextMonth);
      expect(nextPeriod).not.toBeNull();
      expect(Number(nextPeriod!.expectedAmount)).toBe(600);
      expect(Number(nextPeriod!.paidAmount)).toBe(400);
      expect(Number(nextPeriod!.dueAmount)).toBe(200);
      expect(nextPeriod!.status).toBe(ContributionStatus.PARTIAL);
    });

    it('should preserve existing PAID periods when no effectiveFrom/To provided', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Create a fresh plan (planA may have been modified by earlier retroactive tests)
      const freshPlan = await prisma.subscriptionPlan.create({
        data: {
          name: `${PREFIX}-retro-noop-plan`,
          associationId: association.id,
          isDefault: false,
          versions: {
            create: {
              amount: 500,
              billingCycle: 'MONTHLY',
              features: {},
            },
          },
        },
        include: { versions: true },
      });

      // Subscribe to the fresh plan (₹500)
      const { user } = await createSubscribedUser('retro-noop', freshPlan.id);
      await generateUserContributions(user.id, currentYear, currentMonth);

      // Mark as PAID
      await prisma.contributionPeriod.update({
        where: {
          userId_year_month: { userId: user.id, year: currentYear, month: currentMonth },
        },
        data: {
          status: ContributionStatus.PAID,
          paidAmount: 500,
          dueAmount: 0,
        },
      });

      const admin = await createUser({
        email: `${PREFIX}-retro-admin3@test.com`,
        password: 'TestPass1!',
        role: ['SUPER_ADMIN'],
        associationId: association.id,
      });
      const adminToken = await signAccessToken(admin.id);

      // Update amount WITHOUT effectiveFrom/To (no retroactive adjustment)
      await request(app)
        .patch(`/api/v1/subscriptions/plans/${freshPlan.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 900 })
        .expect(200);

      // The PAID period must NOT be changed
      const period = await getContribution(user.id, currentYear, currentMonth);
      expect(Number(period!.expectedAmount)).toBe(500);
      expect(period!.status).toBe(ContributionStatus.PAID);
    });
  });
});
