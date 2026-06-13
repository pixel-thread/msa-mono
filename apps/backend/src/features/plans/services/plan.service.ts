// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { BadRequestError, NotFoundError } from '@errors';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import type { CreatePlanInput } from '@feature/plans/validators';
import { prisma } from '@lib/prisma';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { ContributionStatus, Status, type Prisma, type UserRole } from '@prisma/client';
import { hasHighRoleAccess } from '@utils/has-high-role';

/**
 * Return the last day of the current month at 23:59:59.999.
 * Used as the default upper bound for retroactive adjustments.
 */
function endOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

// ---- Interfaces --------------------------------------------------------------

/** Input for updating a subscription plan. */
interface UpdatePlanInput {
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  billingCycle?: 'MONTHLY' | 'YEARLY';
  features?: Record<string, unknown>;
  isActive?: boolean;
  memberTypeId?: string | null;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

// ---- getPlans ----------------------------------------------------------------

/**
 * Retrieve subscription plans for an association.
 *
 * High-role users see all plans. Regular users are scoped to their
 * member-type; if no plans match, the default plan is returned as fallback.
 */
export async function getPlans(
  associationId: string,
  user: { role: UserRole[]; memberTypeId?: string | null },
) {
  if (hasHighRoleAccess(user.role)) {
    const plans = await prisma.plan.findMany({
      where: { associationId },
      include: {
        memberType: true,
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan) => ({
      ...plan,
      activeVersion: plan.versions.find((v) => v.status === Status.ACTIVE) || null,
      versions: plan.versions,
    }));
  }

  const whereClause: Record<string, unknown> = {
    associationId,
    isActive: true,
  };

  if (user.memberTypeId) {
    whereClause.memberTypeId = user.memberTypeId;
  } else {
    whereClause.memberTypeId = null;
  }

  const plans = await prisma.plan.findMany({
    where: whereClause,
    include: {
      versions: {
        take: 1,
        orderBy: { amount: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (plans.length === 0) {
    const defaultPlan = await prisma.plan.findMany({
      where: {
        associationId,
        isDefault: true,
        isActive: true,
      },
      include: {
        versions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const plansWithActiveVersion = defaultPlan.map((plan) => ({
      ...plan,
      activeVersion: plan.versions[0] || null,
      versions: undefined,
    }));

    return plansWithActiveVersion[0] || null;
  }

  const plansWithActiveVersion = plans.map((plan) => ({
    ...plan,
    activeVersion: plan.versions[0] || null,
    versions: undefined,
  }));

  const sortedPlans = user.memberTypeId
    ? plansWithActiveVersion.sort(
        (a, b) => Number(a.activeVersion?.amount ?? 0) - Number(b.activeVersion?.amount ?? 0),
      )
    : plansWithActiveVersion;

  return user.memberTypeId ? sortedPlans[0] : sortedPlans[0] || null;
}

// ---- createPlan --------------------------------------------------------------

/**
 * Create a new subscription plan with an initial version.
 *
 * Validates name-uniqueness within the association, then in a transaction
 * unsets any existing default, creates the plan + first version, and sets
 * the new plan as default.
 */
export async function createPlan(associationId: string, body: CreatePlanInput) {
  const isPlanExistWithSameName = await prisma.plan.findFirst({
    where: {
      name: body.name,
      associationId,
    },
  });

  if (isPlanExistWithSameName) throw new BadRequestError('Plan with same name already exist');

  const plan = await prisma.$transaction(async (tx) => {
    await tx.plan.updateMany({
      where: { associationId },
      data: { isDefault: false },
    });

    return tx.plan.create({
      data: {
        name: body.name,
        description: body.description,
        isActive: body.isActive,
        isDefault: true,
        memberTypeId: body.memberTypeId,
        associationId,
        versions: {
          create: {
            amount: body.amount,
            currency: body.currency,
            billingCycle: body.billingCycle,
            effectiveFrom: body.effectiveFrom,
            effectiveTo: body.effectiveTo,
            description: body.description,
          },
        },
      },
      include: {
        versions: {
          where: { effectiveTo: null },
          take: 1,
        },
      },
    });
  });

  return plan;
}

// ---- setDefaultPlan ----------------------------------------------------------

/**
 * Set a plan as the default for an association.
 *
 * Ensures the plan exists within the association, then atomically clears
 * the existing default and sets the target plan as the new default.
 */
export async function setDefaultPlan(associationId: string, planId: string) {
  const plan = await prisma.plan.findFirst({
    where: { id: planId, associationId },
  });

  if (!plan) {
    throw new NotFoundError('Plan not found in this association');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.plan.updateMany({
      where: { associationId },
      data: { isDefault: false },
    });

    return tx.plan.update({
      where: { id: planId },
      data: { isDefault: true },
    });
  });

  return updated;
}

// ── Retroactive plan price adjustment ───────────────────────────────

/**
 * After a plan's price changes, retroactively adjust ContributionPeriods
 * within [effectiveFrom, effectiveTo] for ALL users on this plan.
 *
 * For each period:
 *   - If paidAmount > newExpectedAmount → surplus forwarded to next period
 *   - If paidAmount == newExpectedAmount → stays PAID
 *   - If 0 < paidAmount < newExpectedAmount → PARTIAL
 *   - If paidAmount == 0 → DUE or OVERDUE (based on dueDate)
 *
 * Surplus from overpaid periods is carried forward FIFO to the user's
 * next outstanding period(s) after the date range.
 */
async function retroactivelyAdjustContributionsForPlan(
  tx: Prisma.TransactionClient,
  planId: string,
  newAmount: Prisma.Decimal,
  effectiveFrom: Date,
  effectiveTo: Date,
): Promise<void> {
  const fromYear = effectiveFrom.getFullYear();
  const fromMonth = effectiveFrom.getMonth() + 1;
  const toYear = effectiveTo.getFullYear();
  const toMonth = effectiveTo.getMonth() + 1;

  // 1. Find users associated with this plan via member type
  const plan = await tx.plan.findUnique({
    where: { id: planId },
    select: { memberTypeId: true, associationId: true },
  });

  if (!plan) return;

  const users = await tx.user.findMany({
    where: {
      associationId: plan.associationId,
      status: 'ACTIVE',
      ...(plan.memberTypeId ? { memberTypeId: plan.memberTypeId } : {}),
    },
    select: { id: true, dateOfJoiningAssociation: true },
  });

  for (const { id: userId, dateOfJoiningAssociation } of users) {
    // Skip users without a join date — they haven't been onboarded
    if (!dateOfJoiningAssociation) continue;

    // Compute the effective start for this user — the later of:
    //   (a) the plan version's effectiveFrom
    //   (b) the member's dateOfJoiningAssociation
    // This ensures a member who joined in Feb is NOT retro-billed for Jan.
    const memberJoinYear = dateOfJoiningAssociation.getFullYear();
    const memberJoinMonth = dateOfJoiningAssociation.getMonth() + 1; // 1-indexed

    const userFromYear =
      memberJoinYear * 12 + memberJoinMonth > fromYear * 12 + fromMonth
        ? memberJoinYear
        : fromYear;
    const userFromMonth =
      memberJoinYear * 12 + memberJoinMonth > fromYear * 12 + fromMonth
        ? memberJoinMonth
        : fromMonth;

    // If the user joined after the retro window ends, skip entirely
    if (userFromYear * 12 + userFromMonth > toYear * 12 + toMonth) continue;

    // 2. Find contribution periods in the date range, sorted oldest first
    const periods = await tx.contributionPeriod.findMany({
      where: {
        userId,
        ...(userFromYear === toYear
          ? {
              year: userFromYear,
              month: { gte: userFromMonth, lte: toMonth },
            }
          : {
              OR: [
                { year: { gt: userFromYear, lt: toYear } },
                { year: userFromYear, month: { gte: userFromMonth } },
                { year: toYear, month: { lte: toMonth } },
              ],
            }),
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    const newExpected = Number(newAmount);
    const now = new Date();
    let surplus = 0;

    for (const period of periods) {
      // Never touch waived periods — they are intentionally set to 0
      if (period.status === ContributionStatus.WAIVED) continue;

      const paidAmount = Number(period.paidAmount);
      const totalPaid = paidAmount + surplus;

      if (totalPaid >= newExpected) {
        // Fully paid (or overpaid) — record surplus
        const excess = totalPaid - newExpected;

        await tx.contributionPeriod.update({
          where: { id: period.id },
          data: {
            expectedAmount: newAmount,
            paidAmount: newExpected,
            dueAmount: 0,
            status: ContributionStatus.PAID,
          },
        });

        surplus = excess;
      } else if (totalPaid > 0) {
        // Partially paid — no surplus to carry
        surplus = 0;

        await tx.contributionPeriod.update({
          where: { id: period.id },
          data: {
            expectedAmount: newAmount,
            paidAmount: totalPaid,
            dueAmount: newExpected - totalPaid,
            status: ContributionStatus.PARTIAL,
          },
        });
      } else {
        // Nothing paid — determine status by dueDate, but preserve PENDING
        surplus = 0;
        let newStatus: ContributionStatus;
        if (period.status === ContributionStatus.PENDING) {
          newStatus = ContributionStatus.PENDING;
        } else if (period.dueDate <= now) {
          newStatus = ContributionStatus.OVERDUE;
        } else {
          newStatus = ContributionStatus.DUE;
        }

        await tx.contributionPeriod.update({
          where: { id: period.id },
          data: {
            expectedAmount: newAmount,
            dueAmount: newExpected,
            status: newStatus,
          },
        });
      }
    }

    // 3. If surplus remains after the last period in range, forward-allocate
    //    If any surplus can't be allocated (no outstanding future periods),
    //    it stays on the last overpaid period as a visible credit.
    if (surplus > 0) {
      const unallocated = await allocateSurplusToNextPeriods(tx, userId, surplus, effectiveTo);
      if (unallocated > 0 && periods.length > 0) {
        const lastPeriod = periods[periods.length - 1];
        await tx.contributionPeriod.update({
          where: { id: lastPeriod.id },
          data: {
            paidAmount: { increment: unallocated },
          },
        });
      }
    }
  }
}

/**
 * Carry surplus (overpayment) forward to the user's next outstanding
 * ContributionPeriod(s) after `afterDate`, FIFO.
 */
async function allocateSurplusToNextPeriods(
  tx: Prisma.TransactionClient,
  userId: string,
  surplus: number,
  afterDate: Date,
): Promise<number> {
  const afterYear = afterDate.getFullYear();
  const afterMonth = afterDate.getMonth() + 1;

  const nextPeriods = await tx.contributionPeriod.findMany({
    where: {
      userId,
      status: {
        in: [
          ContributionStatus.DUE,
          ContributionStatus.PENDING,
          ContributionStatus.PARTIAL,
          ContributionStatus.OVERDUE,
        ],
      },
      OR: [{ year: { gt: afterYear } }, { year: afterYear, month: { gt: afterMonth } }],
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  let remaining = surplus;

  for (const period of nextPeriods) {
    if (remaining <= 0) break;

    const dueAmount = Number(period.dueAmount);
    const allocateToPeriod = Math.min(remaining, dueAmount);
    const newPaidAmount = Number(period.paidAmount) + allocateToPeriod;
    const newDueAmount = dueAmount - allocateToPeriod;

    await tx.contributionPeriod.update({
      where: { id: period.id },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: Math.max(newDueAmount, 0),
        status: newDueAmount <= 0 ? ContributionStatus.PAID : ContributionStatus.PARTIAL,
      },
    });

    remaining -= allocateToPeriod;
  }

  return remaining;
}

// ---- updatePlan --------------------------------------------------------------

/**
 * Update a subscription plan, creating a new version if price fields change.
 *
 * Price-related fields (amount, currency, billingCycle, features) trigger
 * a new version rather than mutating the existing one, preserving billing
 * history. Non-price metadata is updated in-place on the plan record.
 */
export async function updatePlan(associationId: string, planId: string, body: UpdatePlanInput) {
  const priceFields = ['amount', 'currency', 'billingCycle'] as const;
  const hasPriceChange = priceFields.some((field) => body[field] !== undefined);

  if (hasPriceChange) {
    const currentVersion = await prisma.planVersion.findFirst({
      where: { planId, effectiveTo: null },
    });

    if (!currentVersion) {
      throw new NotFoundError('No active version found for this plan');
    }

    const updatedPlan = await prisma.$transaction(async (tx) => {
      await tx.planVersion.update({
        where: { id: currentVersion.id },
        data: { effectiveTo: new Date(), status: Status.INACTIVE },
      });

      const newVersion = await tx.planVersion.create({
        data: {
          planId,
          amount: body.amount ?? currentVersion.amount,
          currency: body.currency ?? currentVersion.currency,
          billingCycle: body.billingCycle ?? currentVersion.billingCycle,
          description: body.description ?? currentVersion.description,
          effectiveFrom: body.effectiveFrom,
        },
      });

      const plan = await tx.plan.update({
        where: { id: planId, associationId, versions: { some: { status: Status.ACTIVE } } },
        data: {
          name: body.name,
          description: body.description,
          isActive: body.isActive,
          memberTypeId: body.memberTypeId,
        },
      });

      // ── Retroactive adjustment ──────────────────────────────────────
      // Trigger retro-adjustment whenever price changes AND effectiveFrom
      // is provided. effectiveTo defaults to end of current month.
      if (
        body.effectiveFrom &&
        body.amount !== undefined &&
        body.amount !== Number(currentVersion.amount)
      ) {
        const retroEnd = body.effectiveTo ?? endOfCurrentMonth();
        await retroactivelyAdjustContributionsForPlan(
          tx,
          planId,
          newVersion.amount,
          body.effectiveFrom,
          retroEnd,
        );
      }

      return { ...plan, activeVersion: newVersion };
    });

    return updatedPlan;
  }

  // Strip version-only fields that don't exist on Plan
  const { ...metadata } = body;
  const plan = await prisma.plan.update({
    where: { id: planId, associationId },
    data: metadata,
  });

  return plan;
}

// ---- softDeletePlan ----------------------------------------------------------

/**
 * Soft-delete a plan by setting it as inactive.
 *
 * This preserves the plan record and associated data while removing it
 * from active use.
 */
export async function softDeletePlan(associationId: string, planId: string) {
  const plan = await prisma.plan.update({
    where: { id: planId, associationId },
    data: { isActive: false },
  });

  return plan;
}

export async function getPlan(id: string, associationId: string) {
  const plan = await prisma.plan.findUnique({
    where: { id: id, associationId },
    include: { versions: { orderBy: { createdAt: 'desc' } } },
  });

  return {
    ...plan,
    activeVersion: plan?.versions[0],
  };
}
