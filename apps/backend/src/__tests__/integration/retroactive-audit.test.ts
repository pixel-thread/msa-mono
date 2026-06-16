import { prisma } from '@lib/prisma';
import { ContributionStatus, Status, UserStatus } from '@prisma/client';
import { updatePlan } from '@feature/plans/services/plan.service';

async function setupTestData(opts: {
  memberJoinDate: Date;
  planAmount: number;
  effectiveFrom: Date;
  contributions: Array<{
    year: number;
    month: number;
    paidAmount: number;
    status: ContributionStatus;
  }>;
}) {
  const association = await prisma.association.create({
    data: {
      name: `Audit Test Assoc ${Date.now()}`,
      slug: `audit-test-assoc-${Date.now()}`,
    },
  });

  const user = await prisma.user.create({
    data: {
      associationId: association.id,
      email: `audit-user-${Date.now()}@test.com`,
      firstName: 'Audit',
      name: 'Audit Test User',
      status: UserStatus.ACTIVE,
      dateOfJoiningAssociation: opts.memberJoinDate,
    },
  });

  const plan = await prisma.plan.create({
    data: {
      associationId: association.id,
      name: `Audit Plan ${Date.now()}`,
      isDefault: true,
      versions: {
        create: {
          amount: opts.planAmount,
          effectiveFrom: opts.effectiveFrom,
          status: Status.ACTIVE,
        },
      },
    },
    include: { versions: true },
  });

  for (const c of opts.contributions) {
    const dueDate = new Date(c.year, c.month, 0);
    await prisma.contributionPeriod.create({
      data: {
        associationId: association.id,
        userId: user.id,
        year: c.year,
        month: c.month,
        expectedAmount: opts.planAmount,
        paidAmount: c.paidAmount,
        dueAmount: opts.planAmount - c.paidAmount,
        status: c.status,
        dueDate,
      },
    });
  }

  return { association, user, plan, planVersion: plan.versions[0] };
}

describe('Retroactive Adjustment Audit Trail', () => {
  it('should create a RetroactiveAdjustment record when plan price changes', async () => {
    const { association, plan } = await setupTestData({
      memberJoinDate: new Date('2026-01-01'),
      planAmount: 100,
      effectiveFrom: new Date('2026-01-01'),
      contributions: [
        { year: 2026, month: 3, paidAmount: 100, status: ContributionStatus.PAID },
        { year: 2026, month: 4, paidAmount: 0, status: ContributionStatus.DUE },
      ],
    });

    await updatePlan(association.id, plan.id, {
      amount: 150,
      effectiveFrom: new Date('2026-03-01'),
    });

    const adjustments = await prisma.retroactiveAdjustment.findMany({
      where: { associationId: association.id },
      include: { affectedUsers: true },
    });

    expect(adjustments).toHaveLength(1);
    expect(Number(adjustments[0].oldAmount)).toBe(100);
    expect(Number(adjustments[0].newAmount)).toBe(150);
    expect(adjustments[0].planId).toBe(plan.id);
  });

  it('should record affected users with before/after amounts', async () => {
    const { association, user, plan } = await setupTestData({
      memberJoinDate: new Date('2026-01-01'),
      planAmount: 100,
      effectiveFrom: new Date('2026-01-01'),
      contributions: [
        { year: 2026, month: 3, paidAmount: 100, status: ContributionStatus.PAID },
        { year: 2026, month: 4, paidAmount: 0, status: ContributionStatus.DUE },
      ],
    });

    await updatePlan(association.id, plan.id, {
      amount: 150,
      effectiveFrom: new Date('2026-03-01'),
    });

    const affectedUsersRaw = await prisma.retroactiveAffectedUser.findMany({
      where: {
        retroactiveAdjustment: { associationId: association.id },
      },
      include: { contributionPeriod: { select: { year: true, month: true } } },
    });
    const affectedUsers = affectedUsersRaw.sort(
      (a, b) =>
        a.contributionPeriod.year - b.contributionPeriod.year ||
        a.contributionPeriod.month - b.contributionPeriod.month,
    );

    expect(affectedUsers).toHaveLength(2);

    expect(Number(affectedUsers[0].previousExpectedAmount)).toBe(100);
    expect(Number(affectedUsers[0].newExpectedAmount)).toBe(150);
    expect(Number(affectedUsers[0].adjustmentAmount)).toBe(50);

    expect(Number(affectedUsers[1].previousExpectedAmount)).toBe(100);
    expect(Number(affectedUsers[1].newExpectedAmount)).toBe(150);
    expect(Number(affectedUsers[1].adjustmentAmount)).toBe(50);
  });

  it('should NOT create audit records when price does not change retroactively', async () => {
    const { association, plan } = await setupTestData({
      memberJoinDate: new Date('2026-01-01'),
      planAmount: 100,
      effectiveFrom: new Date('2026-01-01'),
      contributions: [
        { year: 2026, month: 3, paidAmount: 100, status: ContributionStatus.PAID },
      ],
    });

    await updatePlan(association.id, plan.id, {
      amount: 200,
    });

    const adjustments = await prisma.retroactiveAdjustment.count({
      where: { associationId: association.id },
    });
    expect(adjustments).toBe(0);
  });

  it('should skip WAIVED periods in audit trail', async () => {
    const { association, user, plan } = await setupTestData({
      memberJoinDate: new Date('2026-01-01'),
      planAmount: 100,
      effectiveFrom: new Date('2026-01-01'),
      contributions: [
        { year: 2026, month: 3, paidAmount: 0, status: ContributionStatus.WAIVED },
        { year: 2026, month: 4, paidAmount: 0, status: ContributionStatus.DUE },
      ],
    });

    const waivedPeriod = await prisma.contributionPeriod.findUnique({
      where: { userId_year_month: { userId: user.id, year: 2026, month: 3 } },
    });
    await prisma.contributionWaiver.create({
      data: {
        periodId: waivedPeriod!.id,
        waivedAt: new Date(),
        reason: 'Hardship',
      },
    });

    await updatePlan(association.id, plan.id, {
      amount: 150,
      effectiveFrom: new Date('2026-03-01'),
    });

    const affectedUsers = await prisma.retroactiveAffectedUser.findMany({
      where: {
        retroactiveAdjustment: { associationId: association.id },
      },
    });

    expect(affectedUsers).toHaveLength(1);
    expect(affectedUsers[0].contributionPeriodId).not.toBe(waivedPeriod!.id);
  });

  it('should support querying all adjustments for an association', async () => {
    const { association, plan } = await setupTestData({
      memberJoinDate: new Date('2026-01-01'),
      planAmount: 100,
      effectiveFrom: new Date('2026-01-01'),
      contributions: [
        { year: 2026, month: 3, paidAmount: 100, status: ContributionStatus.PAID },
      ],
    });

    await updatePlan(association.id, plan.id, {
      amount: 150,
      effectiveFrom: new Date('2026-03-01'),
    });

    const adjustments = await prisma.retroactiveAdjustment.findMany({
      where: { associationId: association.id },
      include: {
        _count: { select: { affectedUsers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(adjustments).toHaveLength(1);
    expect(adjustments[0]._count.affectedUsers).toBe(1);
  });

  it('should record adjustments for multiple users on the same plan', async () => {
    const association = await prisma.association.create({
      data: {
        name: `Multi-User Assoc ${Date.now()}`,
        slug: `multi-user-assoc-${Date.now()}`,
      },
    });

    const user1 = await prisma.user.create({
      data: {
        associationId: association.id,
        email: `multi-user-1-${Date.now()}@test.com`,
        firstName: 'User',
        name: 'User 1',
        status: UserStatus.ACTIVE,
        dateOfJoiningAssociation: new Date('2026-01-01'),
      },
    });

    const user2 = await prisma.user.create({
      data: {
        associationId: association.id,
        email: `multi-user-2-${Date.now()}@test.com`,
        firstName: 'User',
        name: 'User 2',
        status: UserStatus.ACTIVE,
        dateOfJoiningAssociation: new Date('2026-01-01'),
      },
    });

    const plan = await prisma.plan.create({
      data: {
        associationId: association.id,
        name: `Multi-Plan ${Date.now()}`,
        isDefault: true,
        versions: {
          create: {
            amount: 100,
            effectiveFrom: new Date('2026-01-01'),
            status: Status.ACTIVE,
          },
        },
      },
    });

    for (const user of [user1, user2]) {
      await prisma.contributionPeriod.create({
        data: {
          associationId: association.id,
          userId: user.id,
          year: 2026,
          month: 3,
          expectedAmount: 100,
          paidAmount: 0,
          dueAmount: 100,
          status: ContributionStatus.DUE,
          dueDate: new Date(2026, 3, 0),
        },
      });
    }

    await updatePlan(association.id, plan.id, {
      amount: 150,
      effectiveFrom: new Date('2026-03-01'),
    });

    const adjustments = await prisma.retroactiveAdjustment.findMany({
      where: { associationId: association.id },
      include: { affectedUsers: true },
    });

    expect(adjustments).toHaveLength(1);
    expect(adjustments[0].affectedUsers).toHaveLength(2);
  });
});
