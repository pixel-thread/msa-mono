# Plan Change → ContributionPeriods Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure ContributionPeriods correctly reflect the right plan amount based on *when* the plan change happened. Months up to and including the change month keep the old rate; months after the change get the new rate — even if those future months were already generated at the old rate.

**Architecture:** Five coordinated changes:
1. Make `generateUserContributions` idempotent — skip existing periods instead of blindly overwriting them (prevents cron re-runs from corrupting data).
2. Refactor `upgradeSubscription` into a general `changePlan` service that handles both upgrades and downgrades: fix the `planId` bug, backfill current month at the old rate, switch the plan, then **update all existing future periods** to the new rate and generate any missing ones.
3. Add a `/downgrade` route that calls the same `changePlan` service.
4. Comprehensive integration tests covering the full scenario (Jan–Jun at Plan 1, Jul–Dec at Plan 2 after mid-year upgrade).

**Tech Stack:** TypeScript, Prisma, PostgreSQL, Express 5, Zod, Jest + supertest

**Spec reference:** `docs/superpowers/specs/2026-06-06-plan-change-contributions-design.md`

---

## How It Works — Example Flow

**User on ₹500 plan, contributions already generated for Jan–Dec, upgrades to ₹1000 on Jun 15:**

```
BEFORE upgrade:
  Jan ₹500  Feb ₹500  Mar ₹500  Apr ₹500  May ₹500  Jun ₹500  Jul ₹500  Aug ₹500 ... Dec ₹500

changePlan runs:
  1. Backfill:  Jan–Jun already exist → skipped (amounts locked)
  2. Switch:    planVersionId → ₹1000 plan, planId → new plan
  3. Rewrite:   Jul–Dec exist with status DUE/PENDING → updated to ₹1000

AFTER upgrade:
  Jan ₹500  Feb ₹500  Mar ₹500  Apr ₹500  May ₹500  Jun ₹500  Jul ₹1000  Aug ₹1000 ... Dec ₹1000
                                                        ↑ locked    ↑ updated
```

**Downgrade works identically** — same flow, just the amounts go in the opposite direction.

**Safety:** Only periods with status `DUE` or `PENDING` are updated. `PAID`, `PARTIAL`, `WAIVED`, and `OVERDUE` periods are never touched.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/features/contributions/services/contribution.service.ts` | Modify | Skip existing periods in `generateUserContributions` (lines 251-268) |
| `src/features/subscriptions/services/subscription.service.ts` | Modify | Refactor `upgradeSubscription` → `changePlan`: fix `planId` bug, backfill at old rate, switch plan, update future periods to new rate |
| `src/features/subscriptions/routes/upgrade.route.ts` | Modify | Call `changePlan` instead of `upgradeSubscription` |
| `src/features/subscriptions/routes/downgrade.route.ts` | Create | New route handler calling `changePlan` for downgrades |
| `src/features/subscriptions/routes/index.ts` | Modify | Register `/downgrade` route |
| `src/features/subscriptions/validators/index.ts` | Modify | Add `DowngradeSubscriptionSchema` |
| `src/__tests__/integration/subscriptions.plan-change.test.ts` | Create | Full integration tests |

---

## Pre-existing Bugs Fixed By This Plan

1. **`upgradeSubscription` doesn't update `planId`** — After switching plans, `subscription.planId` still points to the old plan while `planVersionId` points to the new plan's version. Fixed by updating both fields.
2. **`generateUserContributions` overwrites paid/partial periods** — Re-running generation resets `expectedAmount`, `dueAmount`, and `status` to `DUE` even for `PAID` or `PARTIAL` periods. Fixed by skipping existing periods.
3. **Future periods keep stale amounts after plan change** — If contributions for the full year were already generated, upgrading mid-year left future months at the old rate. Fixed by updating future `DUE`/`PENDING` periods to the new rate in `changePlan`.

---

### Task 1: Stop overwriting existing ContributionPeriods in `generateUserContributions`

**Files:**
- Modify: `src/features/contributions/services/contribution.service.ts:251-268`

**Context:** `generateUserContributions` iterates months 1..N for a given year. For each month, it creates or updates a `ContributionPeriod`. Currently, when a period already exists, it **updates** it — overwriting `expectedAmount`, `dueAmount`, and resetting `status` to `DUE`. This is wrong because:
- PAID or PARTIAL periods get their status reset (data corruption)
- Re-running after a plan change overwrites old periods with the new amount
- The cron job becomes non-idempotent

**Change:** Skip existing periods entirely. The `changePlan` function (Task 2) will handle updating future periods when a plan change occurs — `generateUserContributions` only creates new periods, never mutates existing ones.

- [ ] **Step 1: Read the current code to confirm the exact lines**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
sed -n '240,275p' src/features/contributions/services/contribution.service.ts
```

Expected: Shows the `existingContribution` check (line 241), the `update` block (lines 251-263), the `else` keyword (line 264), and the `create` block (lines 265-267).

- [ ] **Step 2: Replace the update-or-create block with skip-or-create**

In `src/features/contributions/services/contribution.service.ts`, change lines 251-268 from:

```typescript
      if (existingContribution) {
        await prisma.contributionPeriod.update({
          where: {
            id: existingContribution.id,
          },
          data: {
            associationId: contributionData.associationId,
            expectedAmount: contributionData.expectedAmount,
            dueAmount: contributionData.dueAmount,
            status: contributionData.status,
            dueDate: contributionData.dueDate,
          },
        });
      } else {
        await prisma.contributionPeriod.create({
          data: contributionData,
        });
      }
```

to:

```typescript
      if (existingContribution) {
        // Period already exists — skip it. Amounts are locked at creation
        // time by default. When a plan change occurs, the changePlan
        // service handles updating future periods explicitly.
        continue;
      }

      await prisma.contributionPeriod.create({
        data: contributionData,
      });
```

- [ ] **Step 3: Verify the change compiles**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No TypeScript errors related to the changed file.

- [ ] **Step 4: Commit**

```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
git add src/features/contributions/services/contribution.service.ts
git commit -m "fix: stop overwriting existing ContributionPeriods on re-generation

Existing ContributionPeriods are now skipped (not updated) when
generateUserContributions runs again. This prevents cron re-runs from
corrupting PAID/PARTIAL period statuses and makes the function
idempotent. Future period amount updates after plan changes are
handled by the changePlan service instead."
```

---

### Task 2: Refactor `upgradeSubscription` into `changePlan` with backfill + future-period update logic

**Files:**
- Modify: `src/features/subscriptions/services/subscription.service.ts:1-204`

**Context:** The current `upgradeSubscription` function has three problems:
1. Only updates `planVersionId` but not `planId` (stale reference)
2. Doesn't consider ContributionPeriods at all
3. Doesn't update already-generated future periods to the new rate

**Change:** Rename to `changePlan`. The new flow:
1. Validate subscription is active, find the target plan version
2. **Backfill:** generate any missing ContributionPeriods up to the current month at the OLD rate (before switching)
3. **Switch:** update both `planId` and `planVersionId` to the new plan
4. **Rewrite future periods:** find all existing ContributionPeriods from next month onward that have status `DUE` or `PENDING`, update their `expectedAmount` and `dueAmount` to the NEW plan's rate
5. **Forward-fill:** generate any missing future periods (next month onward) at the new rate

- [ ] **Step 1: Read the current function and imports**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
sed -n '1,204p' src/features/subscriptions/services/subscription.service.ts
```

Expected: Shows imports, interfaces, `subscribe` function, and the full `upgradeSubscription` function.

- [ ] **Step 2: Add the imports for `generateUserContributions` and `ContributionStatus`**

In `src/features/subscriptions/services/subscription.service.ts`, add these imports after line 8 (`import { hasHighRoleAccess } from '@src/shared/utils';`):

```typescript
import { generateUserContributions } from '@src/features/contributions/services/contribution.service';
import { ContributionStatus } from '@prisma/client';
```

Note: `ContributionStatus` can be added to the existing `@prisma/client` import on line 13. Change line 13 from:

```typescript
import { UserRole } from '@prisma/client';
```

to:

```typescript
import { UserRole, ContributionStatus } from '@prisma/client';
```

- [ ] **Step 3: Rename the interface**

In `src/features/subscriptions/services/subscription.service.ts`, replace lines 24-28 from:

```typescript
/** Parameters for upgrading a subscription. */
interface UpgradeInput {
  planId: string;
  userId: string;
}
```

to:

```typescript
/** Parameters for changing a user's subscription plan (upgrade or downgrade). */
interface ChangePlanInput {
  planId: string;
  userId: string;
}
```

- [ ] **Step 4: Replace the entire `upgradeSubscription` function with `changePlan`**

In `src/features/subscriptions/services/subscription.service.ts`, replace lines 132-204 (from the comment `// ---- upgradeSubscription` through the end of the function) with:

```typescript
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
```

- [ ] **Step 5: Verify the change compiles**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
git add src/features/subscriptions/services/subscription.service.ts
git commit -m "feat: refactor upgradeSubscription into changePlan with full contribution handling

Renamed upgradeSubscription → changePlan (alias kept for compatibility).
Key changes:
- Fixes planId bug: now updates both planId AND planVersionId
- Backfills missing ContributionPeriods at old rate before switching
- Updates existing future DUE/PENDING periods to new rate after switching
- Forward-fills any missing future periods at new rate
- Works for both upgrades and downgrades (same logic, different direction)
- Never touches PAID/PARTIAL/WAIVED/OVERDUE periods"
```

---

### Task 3: Update the upgrade route to call `changePlan`

**Files:**
- Modify: `src/features/subscriptions/routes/upgrade.route.ts:22,58`

**Context:** The upgrade route currently imports `upgradeSubscription`. The alias ensures it still works, but for clarity update the import and call to use `changePlan` directly.

- [ ] **Step 1: Read the current file**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
cat src/features/subscriptions/routes/upgrade.route.ts
```

Expected: Shows the full file with import on line 22 and function call on line 58.

- [ ] **Step 2: Update the import and function call**

In `src/features/subscriptions/routes/upgrade.route.ts`, make two changes:

Change line 22 from:

```typescript
import { upgradeSubscription } from '@feature/subscriptions/services';
```

to:

```typescript
import { changePlan } from '@feature/subscriptions/services';
```

Change line 58 from:

```typescript
    const updated = await upgradeSubscription({
```

to:

```typescript
    const updated = await changePlan({
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
git add src/features/subscriptions/routes/upgrade.route.ts
git commit -m "refactor: upgrade route now calls changePlan directly

Updated import from upgradeSubscription → changePlan for clarity.
Functionally identical — same params, same behavior."
```

---

### Task 4: Add the downgrade validator schema

**Files:**
- Modify: `src/features/subscriptions/validators/index.ts:40-49`

**Context:** The downgrade endpoint needs the same validation as upgrade — a `planId` (required) and an optional `userId` for admin-on-behalf-of-user operations.

- [ ] **Step 1: Read the current file**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
cat src/features/subscriptions/validators/index.ts
```

Expected: Shows schemas ending at line 49 with `UpgradeSubscriptionInput`.

- [ ] **Step 2: Add the DowngradeSubscriptionSchema**

In `src/features/subscriptions/validators/index.ts`, add after line 49 (after the `UpgradeSubscriptionInput` type):

```typescript

// ---- Downgrade subscription ---------------------------------------------------

/** Schema for validating subscription downgrade requests. */
export const DowngradeSubscriptionSchema = z.object({
  planId: z.uuid(),
  userId: z.uuid().optional(),
});

/** Input type inferred from DowngradeSubscriptionSchema. */
export type DowngradeSubscriptionInput = z.infer<typeof DowngradeSubscriptionSchema>;
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
git add src/features/subscriptions/validators/index.ts
git commit -m "feat: add DowngradeSubscriptionSchema validator

Same shape as UpgradeSubscriptionSchema — planId (required) + userId
(optional, for admin-on-behalf-of-user operations)."
```

---

### Task 5: Create the downgrade route handler

**Files:**
- Create: `src/features/subscriptions/routes/downgrade.route.ts`

**Context:** The downgrade route mirrors the upgrade route exactly — it calls the same `changePlan` service. The separate route provides API clarity: consumers call `/downgrade` when switching to a cheaper plan. The service doesn't care about direction.

- [ ] **Step 1: Create the downgrade route file**

Create `src/features/subscriptions/routes/downgrade.route.ts`:

```typescript
import type { RequestHandler } from 'express';

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@src/shared/lib/validate';
import { success } from '@src/shared/utils/responses';
import { ValidationError } from '@src/shared/errors';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { logger } from '@src/shared/logger';
import { getAssociation } from '@src/shared/services/association/get-association';

// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { changePlan } from '@feature/subscriptions/services';
import { DowngradeSubscriptionSchema } from '../validators';
import { hasHighRoleAccess } from '@src/shared/utils';

// ---- POST /api/subscriptions/downgrade ---------------------------------------

/** @desc  Downgrade the current user's subscription to a cheaper plan
 *  @role  MEMBER */
export const postDowngrade: RequestHandler[] = [
  validate({ body: DowngradeSubscriptionSchema }),
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    let userId = req.user?.id;

    // Validate association membership
    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'POST /api/subscriptions/downgrade - Request started',
    );

    // Authorize user — MEMBER is the minimum
    const user = await withRole(req, UserRole.MEMBER);

    const isAdmin = hasHighRoleAccess(user.role);

    if (req.body.userId && isAdmin) {
      userId = req.body.userId;
    }

    logger.info({ traceId, userId: userId, actorId: user.id }, 'User authorized');

    if (!req.body) throw new ValidationError('Invalid request body');

    if (!userId) throw new ValidationError('Invalid request body');

    // Downgrade subscription to the target plan version
    const updated = await changePlan({
      planId: req.body.planId,
      userId: userId,
    });

    logger.info({ traceId, subscriptionId: updated.id }, 'Subscription downgraded');

    return success(res, { data: updated, message: 'Subscription downgraded successfully' });
  }),
];
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
git add src/features/subscriptions/routes/downgrade.route.ts
git commit -m "feat: add POST /downgrade route handler

Calls the same changePlan service as /upgrade — separate route for
API clarity when switching to a cheaper plan."
```

---

### Task 6: Register the downgrade route

**Files:**
- Modify: `src/features/subscriptions/routes/index.ts:24,51`

**Context:** Add the import for `postDowngrade` and register the route at `POST /downgrade` alongside `/upgrade`.

- [ ] **Step 1: Read the current file**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
cat src/features/subscriptions/routes/index.ts
```

Expected: Shows the router with `postUpgrade` imported on line 24 and registered on line 51.

- [ ] **Step 2: Add the import**

In `src/features/subscriptions/routes/index.ts`, add after line 24 (`import { postUpgrade } from './upgrade.route';`):

```typescript
import { postDowngrade } from './downgrade.route';
```

- [ ] **Step 3: Register the route**

In the same file, add after line 51 (`router.post('/upgrade', postUpgrade);`):

```typescript
router.post('/downgrade', postDowngrade);
```

- [ ] **Step 4: Verify compilation**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
git add src/features/subscriptions/routes/index.ts
git commit -m "feat: register POST /downgrade route

Added alongside /upgrade in the subscriptions router."
```

---

### Task 7: Write integration tests for plan change + contribution handling

**Files:**
- Create: `src/__tests__/integration/subscriptions.plan-change.test.ts`

**Context:** Tests use the existing integration pattern: real PostgreSQL via Prisma, supertest for HTTP, JWT auth via test helpers, factory-based test data with `PREFIX`-based cleanup. The test file covers:

1. **Upgrade preserves existing period** — current month stays at old rate
2. **Upgrade backfills current month** — if not generated yet, gets old rate
3. **Upgrade rewrites future periods** — already-generated Jul–Dec periods get updated from ₹500 to ₹1000
4. **Upgrade forward-fills missing future periods** — creates them at new rate
5. **Downgrade preserves existing period** — current month stays at old (higher) rate
6. **Downgrade rewrites future periods** — Jul–Dec periods get updated from ₹1000 to ₹500
7. **Same-version rejection** — returns 409
8. **planId + planVersionId consistency** — both updated after change
9. **Re-generation idempotency** — cron re-run after plan change doesn't overwrite anything
10. **PAID periods untouched** — plan change never alters periods that were already paid

- [ ] **Step 1: Create the test file**

Create `src/__tests__/integration/subscriptions.plan-change.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import type { Express } from 'express';

import { createAssociation, createUser, cleanupByPrefix } from '../helpers/factories';
import { signAccessToken } from '../helpers/auth';
import { prisma } from '@src/shared/lib';
import { generateUserContributions } from '@src/features/contributions/services/contribution.service';
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

      expect(res.body.error).toBeDefined();
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

      expect(res.body.error).toBeDefined();
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
      expect(Number((await getContribution(user.id, currentYear, currentMonth))!.expectedAmount)).toBe(500);

      // Re-run generation for full year (simulating cron job)
      await generateUserContributions(user.id, currentYear, 12);

      // Current month STILL ₹500 — not overwritten
      expect(Number((await getContribution(user.id, currentYear, currentMonth))!.expectedAmount)).toBe(500);

      // Future months STILL ₹1000 — not overwritten
      for (let m = currentMonth + 1; m <= 12; m++) {
        const period = await getContribution(user.id, currentYear, m);
        expect(period).not.toBeNull();
        expect(Number(period!.expectedAmount)).toBe(1000);
      }
    });
  });
});
```

- [ ] **Step 2: Run the tests**

Run:
```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend && NODE_OPTIONS='--experimental-vm-modules' npx jest --runInBand --forceExit src/__tests__/integration/subscriptions.plan-change.test.ts -v 2>&1
```

Expected: All 10 tests pass.

```
 PASS  src/__tests__/integration/subscriptions.plan-change.test.ts
  Plan change (upgrade/downgrade) → ContributionPeriod handling
    POST /api/v1/subscriptions/upgrade
      ✓ should preserve existing contribution for the current month after upgrade
      ✓ should backfill current month at old rate when no contributions exist yet
      ✓ should update already-generated future periods to the new rate after upgrade
      ✓ should reject upgrading to the same plan version
      ✓ should update both planId and planVersionId after upgrade
    POST /api/v1/subscriptions/downgrade
      ✓ should preserve current month and update future periods on downgrade
      ✓ should backfill current month at old rate and create future at new rate on downgrade
      ✓ should reject downgrading to the same plan version
    Safety: PAID periods and re-generation
      ✓ should NOT update PAID periods when plan changes
      ✓ should not overwrite any amounts when contributions are re-generated after plan change
```

- [ ] **Step 3: Commit**

```bash
cd /Users/harrison/Downloads/msa-mono/apps/backend
git add src/__tests__/integration/subscriptions.plan-change.test.ts
git commit -m "test: add integration tests for plan change + contribution handling

10 tests covering:
- Upgrade: preserve current month, backfill at old rate, rewrite future
  periods to new rate, same-version rejection, planId consistency
- Downgrade: preserve current month + rewrite future, backfill + create
  future, same-version rejection
- Safety: PAID periods untouched by plan change, re-generation after
  plan change is idempotent (cron re-run doesn't overwrite amounts)"
```

---

## Self-Review

### Spec Coverage

| Spec Requirement | Task |
|---|---|
| Stop overwriting existing periods | Task 1 |
| Plan changes take effect at start of next calendar month | Task 2 (backfill current month at old rate; rewrite future periods to new rate) |
| Upgrade vs downgrade treated equally — same rule applies | Task 2 (`changePlan` handles both), Task 5 (downgrade route calls same function) |
| Existing unpaid periods left unchanged for current/past months | Task 1 (skip existing) + Task 2 (backfill only generates, never updates) |
| Future periods updated to new rate | Task 2 (Step 4: `updateMany` on `DUE`/`PENDING` periods with `month > currentMonth`) |
| PAID/PARTIAL/WAIVED/OVERDUE periods never touched | Task 2 (status filter: `{ in: [DUE, PENDING] }`), Task 7 (explicit PAID safety test) |
| No schema changes | ✅ Confirmed — no migration tasks needed |

### Placeholder Scan

- All file paths are exact
- All code blocks contain complete, runnable code
- All commands are exact with expected output described
- No `TBD`, `TODO`, `handle edge cases`, or `similar to above`

### Type Consistency

- `generateUserContributions(userId, year, numberOfMonth)` — signature matches definition at `contribution.service.ts:170`
- `changePlan({ planId, userId })` — matches `ChangePlanInput` interface
- `upgradeSubscription = changePlan` — alias for backward compatibility
- `ContributionStatus.DUE`, `ContributionStatus.PENDING`, `ContributionStatus.PAID` — matches the `ContributionStatus` enum in `prisma/schema/enums.prisma:116`
- `prisma.contributionPeriod.updateMany` with `status: { in: [...] }` — valid Prisma filter
- `planA.versions[0].id` / `planB.versions[0].id` — matches `include: { versions: true }` structure
- `userId_year_month` — matches `@@unique([userId, year, month])` in `prisma/schema/contribution.prisma:35`
- `DowngradeSubscriptionSchema` — same shape as `UpgradeSubscriptionSchema`

---

## Execution

Plan complete and saved to `docs/superpowers/plans/2026-06-06-plan-change-contributions.md`.

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
