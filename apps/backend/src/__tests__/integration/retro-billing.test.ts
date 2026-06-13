import { prisma } from '@lib/prisma';
import { ContributionStatus, Status, UserStatus } from '@prisma/client';
import { updatePlan } from '@feature/plans/services/plan.service';

/**
 * Helper: create test association, user, plan, plan version,
 * and contribution periods for retro-billing tests.
 */
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
      name: `Test Assoc ${Date.now()}`,
      slug: `test-assoc-${Date.now()}`,
    },
  });

  const user = await prisma.user.create({
    data: {
      associationId: association.id,
      email: `user-${Date.now()}@test.com`,
      name: 'Test User',
      status: UserStatus.ACTIVE,
      dateOfJoiningAssociation: opts.memberJoinDate,
    },
  });

  const plan = await prisma.plan.create({
    data: {
      associationId: association.id,
      name: `Plan ${Date.now()}`,
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

  // Create contribution periods
  for (const c of opts.contributions) {
    const dueDate = new Date(c.year, c.month, 0); // last day of month
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

describe('Retroactive Billing on Plan Price Change', () => {
  describe('Price Increase: ₹100 → ₹150', () => {
    it('should set PARTIAL status when member paid ₹100 but new price is ₹150', async () => {
      const { association, user, plan } = await setupTestData({
        memberJoinDate: new Date('2026-01-01'),
        planAmount: 100,
        effectiveFrom: new Date('2026-01-01'),
        contributions: [
          { year: 2026, month: 3, paidAmount: 100, status: ContributionStatus.PAID },
          { year: 2026, month: 4, paidAmount: 0, status: ContributionStatus.DUE },
          { year: 2026, month: 5, paidAmount: 0, status: ContributionStatus.DUE },
        ],
      });

      // Act: update plan price to ₹150, effective from March
      await updatePlan(association.id, plan.id, {
        amount: 150,
        effectiveFrom: new Date('2026-03-01'),
      });

      // Assert: March should be PARTIAL (paid 100, due 50)
      const march = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 3 } },
      });
      expect(march).toBeTruthy();
      expect(Number(march!.expectedAmount)).toBe(150);
      expect(Number(march!.paidAmount)).toBe(100);
      expect(Number(march!.dueAmount)).toBe(50);
      expect(march!.status).toBe(ContributionStatus.PARTIAL);

      // Assert: April and May should be DUE with new amount
      const april = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 4 } },
      });
      expect(Number(april!.expectedAmount)).toBe(150);
      expect(Number(april!.dueAmount)).toBe(150);
    });
  });

  describe('Member Join Date Boundary', () => {
    it('should NOT retro-adjust periods before member join date', async () => {
      const { association, user, plan } = await setupTestData({
        memberJoinDate: new Date('2026-02-15'), // Joined in Feb
        planAmount: 100,
        effectiveFrom: new Date('2026-01-01'),
        contributions: [
          // No Jan contribution (member joined Feb)
          { year: 2026, month: 2, paidAmount: 100, status: ContributionStatus.PAID },
          { year: 2026, month: 3, paidAmount: 0, status: ContributionStatus.DUE },
        ],
      });

      // Act: update plan price to ₹150, effective from Jan
      await updatePlan(association.id, plan.id, {
        amount: 150,
        effectiveFrom: new Date('2026-01-01'),
      });

      // Assert: Feb should be PARTIAL (joined Feb, so it IS adjusted)
      const feb = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 2 } },
      });
      expect(Number(feb!.expectedAmount)).toBe(150);
      expect(Number(feb!.paidAmount)).toBe(100);
      expect(Number(feb!.dueAmount)).toBe(50);
      expect(feb!.status).toBe(ContributionStatus.PARTIAL);

      // Assert: No Jan contribution was created or adjusted
      const jan = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 1 } },
      });
      expect(jan).toBeNull();
    });
  });

  describe('WAIVED Period Protection', () => {
    it('should never modify WAIVED contribution periods', async () => {
      const { association, user, plan } = await setupTestData({
        memberJoinDate: new Date('2026-01-01'),
        planAmount: 100,
        effectiveFrom: new Date('2026-01-01'),
        contributions: [
          { year: 2026, month: 3, paidAmount: 0, status: ContributionStatus.WAIVED },
          { year: 2026, month: 4, paidAmount: 0, status: ContributionStatus.DUE },
        ],
      });

      // Manually set waived fields
      const waivedPeriod = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 3 } },
      });
      await prisma.contributionPeriod.update({
        where: { id: waivedPeriod!.id },
        data: { dueAmount: 0, waivedAt: new Date(), waivedReason: 'Hardship' },
      });

      // Act: update plan price to ₹150
      await updatePlan(association.id, plan.id, {
        amount: 150,
        effectiveFrom: new Date('2026-03-01'),
      });

      // Assert: WAIVED period is untouched
      const march = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 3 } },
      });
      expect(march!.status).toBe(ContributionStatus.WAIVED);
      expect(Number(march!.expectedAmount)).toBe(100); // Unchanged!
      expect(Number(march!.dueAmount)).toBe(0);

      // Assert: Non-waived periods ARE adjusted
      const april = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 4 } },
      });
      expect(Number(april!.expectedAmount)).toBe(150);
    });
  });

  describe('Price Decrease: ₹150 → ₹100, Surplus Carry-Forward', () => {
    it('should carry surplus from overpaid period to next outstanding period', async () => {
      const { association, user, plan } = await setupTestData({
        memberJoinDate: new Date('2026-01-01'),
        planAmount: 150,
        effectiveFrom: new Date('2026-01-01'),
        contributions: [
          { year: 2026, month: 3, paidAmount: 150, status: ContributionStatus.PAID },
          { year: 2026, month: 4, paidAmount: 0, status: ContributionStatus.DUE },
          { year: 2026, month: 5, paidAmount: 0, status: ContributionStatus.DUE },
        ],
      });

      // Act: decrease plan price to ₹100, effective from March
      await updatePlan(association.id, plan.id, {
        amount: 100,
        effectiveFrom: new Date('2026-03-01'),
      });

      // Assert: March is PAID (paid 150, expected 100, surplus = 50)
      const march = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 3 } },
      });
      expect(Number(march!.expectedAmount)).toBe(100);
      expect(Number(march!.paidAmount)).toBe(100); // capped at expected
      expect(Number(march!.dueAmount)).toBe(0);
      expect(march!.status).toBe(ContributionStatus.PAID);

      // Assert: April gets ₹50 surplus carried forward → PARTIAL
      const april = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 4 } },
      });
      expect(Number(april!.expectedAmount)).toBe(100);
      expect(Number(april!.paidAmount)).toBe(50); // surplus from March
      expect(Number(april!.dueAmount)).toBe(50);
      expect(april!.status).toBe(ContributionStatus.PARTIAL);

      // Assert: May untouched (no surplus left)
      const may = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 5 } },
      });
      expect(Number(may!.expectedAmount)).toBe(100);
      expect(Number(may!.paidAmount)).toBe(0);
      expect(Number(may!.dueAmount)).toBe(100);
    });
  });

  describe('PENDING Status Preservation', () => {
    it('should keep PENDING status for future months while updating amounts', async () => {
      const { association, user, plan } = await setupTestData({
        memberJoinDate: new Date('2026-01-01'),
        planAmount: 100,
        effectiveFrom: new Date('2026-01-01'),
        contributions: [
          { year: 2026, month: 3, paidAmount: 0, status: ContributionStatus.DUE },
          { year: 2026, month: 12, paidAmount: 0, status: ContributionStatus.PENDING },
        ],
      });

      // Act: update price to ₹150
      await updatePlan(association.id, plan.id, {
        amount: 150,
        effectiveFrom: new Date('2026-03-01'),
        effectiveTo: new Date('2026-12-31'),
      });

      // Assert: December keeps PENDING status with new amounts
      const dec = await prisma.contributionPeriod.findUnique({
        where: { userId_year_month: { userId: user.id, year: 2026, month: 12 } },
      });
      expect(Number(dec!.expectedAmount)).toBe(150);
      expect(Number(dec!.dueAmount)).toBe(150);
      expect(dec!.status).toBe(ContributionStatus.PENDING);
    });
  });

  describe('No effectiveTo Provided', () => {
    it('should default retro window to end of current month when effectiveTo is omitted', async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { association, user, plan } = await setupTestData({
        memberJoinDate: new Date('2026-01-01'),
        planAmount: 100,
        effectiveFrom: new Date('2026-01-01'),
        contributions: [
          { year: currentYear, month: currentMonth, paidAmount: 0, status: ContributionStatus.DUE },
        ],
      });

      // Act: update price without specifying effectiveTo
      await updatePlan(association.id, plan.id, {
        amount: 200,
        effectiveFrom: new Date('2026-01-01'),
        // effectiveTo intentionally omitted
      });

      // Assert: current month period was adjusted
      const current = await prisma.contributionPeriod.findUnique({
        where: {
          userId_year_month: {
            userId: user.id,
            year: currentYear,
            month: currentMonth,
          },
        },
      });
      expect(Number(current!.expectedAmount)).toBe(200);
      expect(Number(current!.dueAmount)).toBe(200);
    });
  });
});
