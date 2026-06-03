import { prisma } from '@src/shared/lib/prisma';
import { ContributionStatus, Prisma, UserStatus } from '@prisma/client';
import { recordWaiver } from '@src/features/ledger/services/accounting.service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContributionSummary {
  userId: string;
  totalExpected: number;
  totalPaid: number;
  totalDue: number;
  overdueMonths: number;
  paidMonths: number;
  partialMonths: number;
  waivedMonths: number;
}

export interface MonthlyContributionRow {
  year: number;
  month: number;
  expectedAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: ContributionStatus;
  dueDate: Date;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function applyCreditsToContributionPeriod(contributionPeriodId: string) {
  return prisma.$transaction(async (tx) => {
    const period = await tx.contributionPeriod.findUnique({
      where: {
        id: contributionPeriodId,
      },
    });

    if (!period) {
      return;
    }

    let remainingDue = Number(period.dueAmount);

    if (remainingDue <= 0) {
      return;
    }

    const credits = await tx.unallocatedPayment.findMany({
      where: {
        userId: period.userId,
        balanceAmount: { gt: 0 },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    let totalApplied = 0;

    for (const credit of credits) {
      if (remainingDue <= 0) {
        break;
      }

      const availableCredit = Number(credit.balanceAmount);

      if (availableCredit <= 0) {
        continue;
      }

      const allocation = Math.min(availableCredit, remainingDue);

      await tx.paymentAllocation.create({
        data: {
          paymentTransactionId: credit.paymentTransactionId!,
          contributionPeriodId: period.id,
          allocatedAmount: allocation,
        },
      });

      await tx.unallocatedPayment.update({
        where: {
          id: credit.id,
        },
        data: {
          consumedAmount: {
            increment: allocation,
          },
          balanceAmount: {
            decrement: allocation,
          },
        },
      });

      remainingDue -= allocation;
      totalApplied += allocation;
    }

    const newPaidAmount = Number(period.paidAmount) + totalApplied;

    await tx.contributionPeriod.update({
      where: {
        id: period.id,
      },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: remainingDue,

        status:
          remainingDue <= 0
            ? ContributionStatus.PAID
            : totalApplied > 0
              ? ContributionStatus.PARTIAL
              : ContributionStatus.DUE,
      },
    });
  });
}

/**
 * Generate contribution period rows for a given month/year for ALL active
 * members of an association who have an active subscription.
 *
 * This is idempotent — if a row already exists for (userId, year, month) it
 * will be skipped via `skipDuplicates`.
 *
 * Intended to be called by a monthly cron job.
 */
export async function generateMonthlyContributions(
  associationId: string,
  year: number,
  month: number,
): Promise<number> {
  const generateDate = new Date(year, month - 1, 1);

  const activeMembers = await prisma.user.findMany({
    where: {
      associationId,

      status: UserStatus.ACTIVE,

      subscription: {
        status: 'ACTIVE',
      },

      dateOfJoiningAssociation: {
        lte: generateDate,
      },
    },

    include: {
      subscription: {
        include: {
          plan: true,
          planVersion: true,
        },
      },
    },
  });

  if (activeMembers.length === 0) {
    return 0;
  }

  const dueDate = new Date(year, month, 0);

  const data = activeMembers
    .filter((m) => m.subscription?.planVersion)
    .map((member) => {
      if (!member.dateOfJoiningAssociation) {
        return null;
      }

      const memberJoinedMonth =
        member.dateOfJoiningAssociation.getFullYear() * 12 +
        member.dateOfJoiningAssociation.getMonth();

      const targetMonth = year * 12 + (month - 1);

      if (memberJoinedMonth > targetMonth) {
        return null;
      }

      const expectedAmount = member.subscription!.planVersion.amount;

      return {
        associationId,
        userId: member.id,

        year,
        month,

        expectedAmount,
        paidAmount: 0,
        dueAmount: expectedAmount,

        status: ContributionStatus.DUE,

        dueDate,
      };
    })
    .filter(Boolean);

  const result = await prisma.contributionPeriod.createMany({
    data: data as any[],
    skipDuplicates: true,
  });

  const periods = await prisma.contributionPeriod.findMany({
    where: {
      associationId,
      year,
      month,
    },
  });

  for (const period of periods) {
    await applyCreditsToContributionPeriod(period.id);
  }

  return result.count;
}
/**
 * Mark all DUE contributions whose dueDate has passed as OVERDUE.
 */
export async function markOverdueContributions(associationId: string): Promise<number> {
  const now = new Date();

  const result = await prisma.contributionPeriod.updateMany({
    where: {
      associationId,
      status: ContributionStatus.DUE,
      dueDate: { lt: now },
    },
    data: {
      status: ContributionStatus.OVERDUE,
    },
  });

  return result.count;
}

/**
 * Get all outstanding (DUE / PARTIAL / OVERDUE) contribution periods for a user,
 * ordered chronologically (oldest first — for FIFO allocation).
 */
export async function getOutstandingContributions(userId: string) {
  return prisma.contributionPeriod.findMany({
    where: {
      userId,
      status: {
        in: [ContributionStatus.DUE, ContributionStatus.PARTIAL, ContributionStatus.OVERDUE],
      },
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });
}

/**
 * Get a user's contribution summary (for member/finance reports).
 */
export async function getUserContributionSummary(userId: string): Promise<ContributionSummary> {
  const contributions = await prisma.contributionPeriod.findMany({
    where: { userId },
  });

  let totalExpected = 0;
  let totalPaid = 0;
  let totalDue = 0;
  let overdueMonths = 0;
  let paidMonths = 0;
  let partialMonths = 0;
  let waivedMonths = 0;

  for (const c of contributions) {
    totalExpected += Number(c.expectedAmount);
    totalPaid += Number(c.paidAmount);
    totalDue += Number(c.dueAmount);

    switch (c.status) {
      case ContributionStatus.OVERDUE:
        overdueMonths++;
        break;
      case ContributionStatus.PAID:
        paidMonths++;
        break;
      case ContributionStatus.PARTIAL:
        partialMonths++;
        break;
      case ContributionStatus.WAIVED:
        waivedMonths++;
        break;
    }
  }

  return {
    userId,
    totalExpected,
    totalPaid,
    totalDue,
    overdueMonths,
    paidMonths,
    partialMonths,
    waivedMonths,
  };
}

/**
 * Waive a contribution period (e.g. for hardship, honorary members, etc.).
 */
export async function waiveContribution(
  contributionPeriodId: string,
  reason: string,
  approvedById: string,
) {
  return prisma.$transaction(async (tx) => {
    const period = await tx.contributionPeriod.findUnique({
      where: { id: contributionPeriodId },
    });

    if (!period) {
      throw new Error('Contribution period not found');
    }

    const amount = Number(period.dueAmount);

    const updated = await tx.contributionPeriod.update({
      where: { id: contributionPeriodId },
      data: {
        status: ContributionStatus.WAIVED,
        dueAmount: 0,
        waivedAt: new Date(),
        waivedReason: reason,
      },
    });

    if (amount > 0) {
      await recordWaiver(tx, {
        associationId: period.associationId,
        amount,
        memberId: period.userId,
        period: `${period.year}-${period.month}`,
        approvedById,
      });
    }

    return updated;
  });
}

/**
 * Get contribution periods for a user in a date range (for member reports).
 */
export async function getUserContributions(
  userId: string,
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number,
) {
  return prisma.contributionPeriod.findMany({
    where: {
      userId,
      OR: [
        {
          year: { gt: fromYear, lt: toYear },
        },
        {
          year: fromYear,
          month: { gte: fromMonth },
        },
        {
          year: toYear,
          month: { lte: toMonth },
        },
      ],
    },
    include: {
      allocations: {
        include: {
          paymentTransaction: {
            select: {
              id: true,
              amount: true,
              method: true,
              gateway: true,
              status: true,
              paidAt: true,
              receiptNumber: true,
            },
          },
        },
      },
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });
}
