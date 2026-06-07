import { ContributionStatus, Prisma } from '@prisma/client';

export async function createAllocations(
  tx: Prisma.TransactionClient,
  paymentTransactionId: string,
  userId: string,
  amount: number,
): Promise<{ allocatedAmount: number; remainingAmount: number }> {
  const outstanding = await tx.contributionPeriod.findMany({
    where: {
      userId,
      status: {
        in: [
          ContributionStatus.DUE,
          ContributionStatus.PARTIAL,
          ContributionStatus.OVERDUE,
        ],
      },
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  let remaining = amount;
  let totalAllocated = 0;

  for (const period of outstanding) {
    if (remaining <= 0) break;

    const dueAmount = Number(period.dueAmount);
    const allocatedAmount = Math.min(remaining, dueAmount);
    const newPaidAmount = Number(period.paidAmount) + allocatedAmount;
    const newDueAmount = dueAmount - allocatedAmount;

    await tx.paymentAllocation.create({
      data: {
        paymentTransactionId,
        contributionPeriodId: period.id,
        allocatedAmount,
      },
    });

    await tx.contributionPeriod.update({
      where: { id: period.id },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: Math.max(newDueAmount, 0),
        status:
          newDueAmount <= 0
            ? ContributionStatus.PAID
            : ContributionStatus.PARTIAL,
      },
    });

    remaining -= allocatedAmount;
    totalAllocated += allocatedAmount;
  }

  return { allocatedAmount: totalAllocated, remainingAmount: remaining };
}
