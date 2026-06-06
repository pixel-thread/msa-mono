// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { prisma } from '@src/shared/lib/prisma';
import { NotFoundError, ConflictError, ForbiddenError } from '@src/shared/errors';
import { PAGE_SIZE } from '@src/shared/constants';
import { buildPagination } from '@src/shared/utils/build-pagination';
import { hasHighRoleAccess } from '@src/shared/utils';
import { generateUserContributions } from '@src/features/contributions/services/contribution.service';

// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole, ContributionStatus } from '@prisma/client';

// ---- Interfaces --------------------------------------------------------------

/** Parameters for subscribing a user to a plan. */
interface SubscribeInput {
  planId: string;
  userId: string;
  associationId: string;
}

/** Parameters for changing a user's subscription plan (upgrade or downgrade). */
interface ChangePlanInput {
  planId: string;
  userId: string;
}

/** Parameters for waiving a subscription. */
interface WaiveInput {
  subscriptionId: string;
  reason: string;
  userId: string;
  associationId: string;
}

/** Parameters for retrieving subscription payments. */
interface GetSubscriptionPaymentsInput {
  subscriptionId: string;
  userId: string;
  role: UserRole[];
  associationId: string;
  page: number;
}

// ---- subscribe ---------------------------------------------------------------

/**
 * Subscribe a user to a plan.
 *
 * Fetches the active plan version, checks for an existing active subscription
 * (conflict if one exists), then upserts the subscription and creates an
 * initial billing-history record for the upcoming period.
 */
export async function subscribe({ planId, userId, associationId }: SubscribeInput) {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: {
      id: planId,
      associationId,
      isActive: true,
    },
    include: {
      versions: {
        where: { effectiveTo: null },
        take: 1,
      },
    },
  });

  if (!plan || plan.versions.length === 0) {
    throw new NotFoundError('Plan not found or has no active version');
  }

  const activeVersion = plan.versions[0];

  const existing = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existing && existing.status === 'ACTIVE') {
    throw new ConflictError('User already has an active subscription');
  }

  const startDate = new Date();

  const endDate = new Date();

  if (activeVersion.billingCycle === 'YEARLY') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: {
      planId: plan.id,
      planVersionId: activeVersion.id,
      status: 'ACTIVE',
      startDate,
      endDate,
      waivedAt: null,
      waivedReason: null,
      waivedBy: null,
    },
    create: {
      userId,
      planId: plan.id,
      planVersionId: activeVersion.id,
      status: 'ACTIVE',
      startDate,
      endDate,
    },
  });

  await prisma.subscriptionBillingHistory.create({
    data: {
      subscriptionId: subscription.id,
      planVersionId: activeVersion.id,
      amountCharged: activeVersion.amount,
      status: 'PENDING',
      periodStart: startDate,
      periodEnd: endDate,
      dueDate: startDate,
    },
  });

  return subscription;
}

// ---- changePlan --------------------------------------------------------------

/**
 * Change a user's subscription to a different plan (upgrade or downgrade).
 *
 * Contribution period handling:
 *   - Months up to and including the current month keep the OLD plan's rate
 *   - Months after the current month get the NEW plan's rate
 *   - Only DUE/PENDING periods are updated; PAID/PARTIAL/WAIVED/OVERDUE are never touched
 *
 * Steps:
 *  1. Validate subscription is active, find target plan version
 *  2. Backfill: generate missing periods up to current month at OLD rate
 *  3. Switch: update both planId and planVersionId
 *  4. Rewrite: update existing future DUE/PENDING periods to NEW rate
 *  5. Forward-fill: generate any missing future periods at NEW rate
 *  6. Create billing history record
 */
export async function changePlan({ planId, userId }: ChangePlanInput) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { planVersion: true },
  });

  if (!subscription) {
    throw new NotFoundError('No active subscription found');
  }

  if (subscription.status !== 'ACTIVE') {
    throw new ConflictError('Subscription is not active');
  }

  const latestVersion = await prisma.subscriptionPlanVersion.findFirst({
    where: {
      planId,
      effectiveTo: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestVersion) {
    throw new NotFoundError('No active version found for this plan');
  }

  if (subscription.planVersionId === latestVersion.id) {
    throw new ConflictError('Already on the latest version');
  }

  // ── Step 2: Backfill at OLD rate ──────────────────────────────────────
  // Generate any missing ContributionPeriods up to the current month.
  // planVersionId still points to the old plan, so these get the old amount.
  // Already-existing periods are skipped (Task 1 change).
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  await generateUserContributions(userId, currentYear, currentMonth);

  // ── Step 3: Switch plan ───────────────────────────────────────────────
  const startDate = new Date();
  const endDate = new Date();
  if (latestVersion.billingCycle === 'YEARLY') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      planId,
      planVersionId: latestVersion.id,
      startDate,
      endDate,
    },
    include: {
      plan: true,
      planVersion: true,
    },
  });

  // ── Step 4: Rewrite existing future periods to NEW rate ───────────────
  // Find all ContributionPeriods from NEXT month onward that are still
  // unpaid (DUE or PENDING) and update them to the new plan's amount.
  // PAID, PARTIAL, WAIVED, and OVERDUE periods are never touched.
  const newAmount = latestVersion.amount;

  // Update future periods in the CURRENT year (months after currentMonth)
  if (currentMonth < 12) {
    await prisma.contributionPeriod.updateMany({
      where: {
        userId,
        year: currentYear,
        month: { gt: currentMonth },
        status: { in: [ContributionStatus.DUE, ContributionStatus.PENDING] },
      },
      data: {
        expectedAmount: newAmount,
        dueAmount: newAmount,
      },
    });
  }

  // Update future periods in SUBSEQUENT years (all months)
  await prisma.contributionPeriod.updateMany({
    where: {
      userId,
      year: { gt: currentYear },
      status: { in: [ContributionStatus.DUE, ContributionStatus.PENDING] },
    },
    data: {
      expectedAmount: newAmount,
      dueAmount: newAmount,
    },
  });

  // ── Step 5: Forward-fill missing future periods at NEW rate ───────────
  // Generate any future periods that don't exist yet. Now that
  // planVersionId points to the new plan, generateUserContributions will
  // create them at the new rate. Generate for the full remaining year.
  await generateUserContributions(userId, currentYear, 12);

  // If we're near year-end, also generate for next year's first month
  if (currentMonth === 12) {
    await generateUserContributions(userId, currentYear + 1, 1);
  }

  // ── Step 6: Billing history ───────────────────────────────────────────
  await prisma.subscriptionBillingHistory.create({
    data: {
      subscriptionId: subscription.id,
      planVersionId: latestVersion.id,
      amountCharged: latestVersion.amount,
      status: 'PENDING',
      periodStart: startDate,
      periodEnd: endDate,
      dueDate: startDate,
    },
  });

  return updated;
}

// Keep the old name as an alias for backward compatibility
export const upgradeSubscription = changePlan;

// ---- waiveSubscription -------------------------------------------------------

/**
 * Waive a subscription, marking it as WAIVED with a reason.
 *
 * Ensures the subscription belongs to the caller's association before updating.
 */
export async function waiveSubscription({
  subscriptionId,
  reason,
  userId,
  associationId,
}: WaiveInput) {
  const updated = await prisma.subscription.update({
    where: {
      id: subscriptionId,
      user: {
        associationId,
      },
    },
    data: {
      status: 'WAIVED',
      waivedAt: new Date(),
      waivedReason: reason,
      waivedBy: userId,
    },
  });

  if (!updated) throw new NotFoundError('Subscription not found in this association');

  return updated;
}

// ---- getMyActiveSubscription -------------------------------------------------

/**
 * Retrieve the current user's active subscription.
 *
 * Returns the subscription with status 'ACTIVE', including its plan and planVersion,
 * or null if the user has no active subscription.
 */
export async function getMyActiveSubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
      planVersion: true,
    },
  });

  return subscription;
}

// ---- getMySubscription -------------------------------------------------------

/**
 * Retrieve the current user's subscriptions with pagination.
 *
 * Returns a flat list of the user's subscriptions ordered by creation date,
 * along with pagination metadata.
 */
export async function getMySubscription(userId: string, page: number) {
  const [subscriptions, total] = await prisma.$transaction([
    prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
        planVersion: true,
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.subscription.count({
      where: { userId },
    }),
  ]);

  return {
    data: subscriptions,
    meta: buildPagination(total, page),
  };
}

// ---- getSubscriptionPayments -------------------------------------------------

/**
 * Retrieve paginated payments for a subscription, with authorization checks.
 *
 * Only the subscription owner or users with high-role access may view payments.
 */
export async function getSubscriptionPayments({
  subscriptionId,
  userId,
  role,
  associationId,
  page,
}: GetSubscriptionPaymentsInput) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new ForbiddenError('Subscription not found');
  }

  if (subscription.userId !== userId && !hasHighRoleAccess(role)) {
    throw new ForbiddenError('Not authorized to view these payments');
  }

  const [data, total] = await prisma.$transaction([
    prisma.paymentTransaction.findMany({
      where: {
        userId: subscription.userId,
        associationId,
      },
      orderBy: { paymentDate: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.paymentTransaction.count({
      where: {
        userId: subscription.userId,
        associationId,
      },
    }),
  ]);

  return {
    data,
    meta: buildPagination(total, page),
  };
}
