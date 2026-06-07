import { prisma } from '@lib/prisma';
import {
  ContributionStatus,
  Prisma,
  UserStatus,
  PaymentStatus,
  ApprovalStatus,
  Currency,
  PaymentGateway,
  PaymentMethod,
} from '@prisma/client';
import { JournalLine, recordWaiver } from '@feature/ledger/services/accounting.service';
import { ContributionSummary } from '@feature/contributions/types';
import { BadRequestError, NotFoundError } from '@errors';
import { createAllocations } from '@services/allocate-contributions';

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Allocate a payment amount across outstanding contribution periods using
 * FIFO (oldest debt first).
 *
 * For each period:
 *   - If remaining >= dueAmount → fully paid
 *   - If remaining > 0 but < dueAmount → partially paid
 *   - If remaining == 0 → stop
 */

export async function allocatePaymentToContributions(
  tx: Prisma.TransactionClient,
  paymentTransactionId: string,
  userId: string,
  totalAmount: number,
  ids: string[],
  actorId?: string,
) {
  const outstanding = await tx.contributionPeriod.findMany({
    where: { id: { in: ids }, userId },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  const user = await tx.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const descriptionMonths = outstanding
    .map((p) => `${p.year}-${String(p.month).padStart(2, '0')}`)
    .join(', ');

  const description = `Contribution payment for ${user.name} (${user.email}) covering periods: ${descriptionMonths}`;

  const payment = await tx.paymentTransaction.findUnique({ where: { id: paymentTransactionId } });

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Use the shared allocation engine
  const { allocatedAmount } = await createAllocations(
    tx,
    paymentTransactionId,
    userId,
    totalAmount,
    ids,
  );

  // Phase 2: Update payment transaction once after all allocations
  await tx.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.COMPLETED,
      verifiedById: actorId,
      notes: description,
      paidAt: payment.paidAt ?? new Date(),
    },
  });

  // Phase 3: Create one consolidated ledger entry for the entire payment
  if (paymentTransactionId) {
    const existing = await tx.ledgerEntry.findFirst({
      where: { paymentTransactionId },
    });

    if (existing) {
      return tx.ledgerEntry.findUnique({
        where: { id: existing.id },
        include: { lines: true },
      }) as unknown as any;
    }
  }

  if (allocatedAmount > 0 && outstanding.length > 0) {
    const isCash = payment.method === 'CASH';
    const associationId = outstanding[0].associationId;
    const debitCode = isCash ? '1200' : '1000';

    const lines: JournalLine[] = [
      { accountCode: debitCode, isDebit: true, amount: allocatedAmount },
      { accountCode: '4000', isDebit: false, amount: allocatedAmount },
    ];

    const resolvedLines = await Promise.all(
      lines.map(async (line) => {
        const account = await tx.account.findFirst({
          where: { associationId, code: line.accountCode, isActive: true },
        });
        if (!account) throw new NotFoundError(`Account not found: ${line.accountCode}`);
        return {
          accountId: account.id,
          isDebit: line.isDebit,
          amount: line.amount,
          associationId,
        };
      }),
    );

    await tx.ledgerEntry.create({
      data: {
        paymentTransactionId: paymentTransactionId ?? null,
        description,
        approvalStatus: ApprovalStatus.APPROVED,
        createdById: actorId || '',
        approvedById: userId ?? 'system',
        lines: { create: resolvedLines },
      },
      include: { lines: true },
    });
  }

  return allocatedAmount;
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

export async function generateUserContributions(
  userId: string,
  year: number,
  numberOfMonth: number,
): Promise<number> {
  const monthsToGenerate = Math.min(Math.max(numberOfMonth, 1), 12);

  let totalProcessed = 0;

  for (let month = 1; month <= monthsToGenerate; month++) {
    const generateDate = new Date(year, month - 1, 1);
    const dueDate = new Date(year, month, 0);

    const activeMembers = await prisma.user.findMany({
      where: {
        id: userId,
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

    if (activeMembers.length === 0) continue;

    for (const member of activeMembers) {
      if (!member.subscription?.planVersion) continue;
      if (!member.dateOfJoiningAssociation) continue;

      const memberJoinedMonth =
        member.dateOfJoiningAssociation.getFullYear() * 12 +
        member.dateOfJoiningAssociation.getMonth();

      const targetMonth = year * 12 + (month - 1);

      const subscriptionStartDate = member.subscription.planVersion.effectiveFrom;

      const subscriptionMonth =
        subscriptionStartDate.getFullYear() * 12 + subscriptionStartDate.getMonth();

      if (targetMonth < subscriptionMonth) {
        continue; // skip months before subscription started
      }

      if (memberJoinedMonth > targetMonth) continue;

      const expectedAmount = member.subscription.planVersion.amount;

      const contributionData = {
        associationId: member.associationId,
        userId: member.id,
        year,
        month,
        expectedAmount,
        paidAmount: 0,
        dueAmount: expectedAmount,
        status: ContributionStatus.DUE,
        dueDate,
      };

      const existingContribution = await prisma.contributionPeriod.findUnique({
        where: {
          userId_year_month: {
            userId: member.id,
            year,
            month,
          },
        },
      });

      if (existingContribution) {
        continue;
      }

      await prisma.contributionPeriod.create({
        data: contributionData,
      });

      totalProcessed++;
    }
  }

  return totalProcessed;
}
/**
 * Mark all DUE contributions whose dueDate has passed as OVERDUE.
 */
export async function markOverdueContributions(
  associationId: string,
  userId?: string,
): Promise<number> {
  const now = new Date();
  const filter = {
    associationId,
    ...(userId && { userId }),
  };

  return await prisma.$transaction(async (tx) => {
    const presentPeriods = await tx.contributionPeriod.updateMany({
      where: {
        ...filter,
        status: ContributionStatus.DUE,
        dueDate: { lte: now },
      },
      data: {
        status: ContributionStatus.OVERDUE,
      },
    });

    const futurePeriods = await tx.contributionPeriod.updateMany({
      where: {
        ...filter,
        status: ContributionStatus.DUE,
        dueDate: { gte: now },
      },
      data: { status: ContributionStatus.PENDING },
    });

    await tx.contributionPeriod.updateMany({
      where: {
        ...filter,
        status: ContributionStatus.PENDING,
        dueDate: { lte: now },
      },
      data: { status: ContributionStatus.DUE },
    });

    await tx.contributionPeriod.updateMany({
      where: {
        ...filter,
        status: ContributionStatus.PARTIAL,
        dueDate: { lte: now },
      },
      data: { status: ContributionStatus.DUE },
    });

    return presentPeriods.count + futurePeriods.count;
  });
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
    where: {
      userId,
      status: {
        in: [ContributionStatus.DUE, ContributionStatus.PARTIAL, ContributionStatus.OVERDUE],
      },
    },
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
      throw new NotFoundError('Contribution period not found');
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

export async function recordContributionPayment(
  userId: string,
  associationId: string,
  amount: number,
  paymentMethod: PaymentMethod,
  contributionPeriodIds: string[],
  paidAt: Date,
  createdById: string,
) {
  if (contributionPeriodIds.length === 0) {
    throw new BadRequestError('No contribution periods selected');
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.paymentTransaction.create({
      data: {
        userId,
        associationId,
        amount,
        currency: Currency.INR,
        gateway: PaymentGateway.MANUAL,
        status: PaymentStatus.PENDING,
        method: paymentMethod,
        paidAt,
        createdById,
      },
    });

    await allocatePaymentToContributions(
      tx,
      payment.id,
      userId,
      amount,
      contributionPeriodIds,
      createdById,
    );

    return payment;
  });
}
