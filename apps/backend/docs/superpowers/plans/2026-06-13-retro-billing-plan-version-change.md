# Retroactive Billing on Plan Version Price Change — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a plan's price changes (new PlanVersion), retroactively adjust all affected ContributionPeriods from the `effectiveFrom` date through the current month — recalculating `expectedAmount`, `dueAmount`, and `status` for each user. Members who joined after `effectiveFrom` are only adjusted from their join month onward.

**Architecture:** Three coordinated changes:

1. **Fix `retroactivelyAdjustContributionsForPlan()`** — remove the `effectiveTo` requirement. Instead, auto-compute the adjustment window as `[effectiveFrom, currentMonth]`. Respect each user's `dateOfJoiningAssociation` so members who joined in Feb are not retro-billed for Jan.
2. **Fix `updatePlan()` trigger condition** — currently requires both `effectiveFrom` AND `effectiveTo` to trigger retro adjustment. Change to only require `effectiveFrom` (effectiveTo defaults to current month).
3. **Add comprehensive tests** — cover price increase (₹100→₹150 with partial payment creating PARTIAL status), price decrease (₹150→₹100 with overpayment creating surplus), join-date boundary (Feb joiner not billed for Jan), WAIVED/PAID period preservation, and surplus carry-forward.

**Tech Stack:** TypeScript, Prisma, PostgreSQL, Express 5, Zod, Vitest

---

## How It Works — Example Flows

### Flow 1: Price Increase (₹100 → ₹150), Member Paid ₹100 for March

```
effectiveFrom = March 2026
Current month = June 2026

BEFORE retro-adjustment:
  Mar ₹100 (PAID, paid=100)  Apr ₹100 (DUE, paid=0)  May ₹100 (DUE, paid=0)  Jun ₹100 (DUE, paid=0)

AFTER retro-adjustment:
  Mar ₹150 (PARTIAL, paid=100, due=50)  Apr ₹150 (DUE, paid=0, due=150)  May ₹150 (DUE, paid=0, due=150)  Jun ₹150 (DUE, paid=0, due=150)
```

### Flow 2: Member Joined Feb, effectiveFrom = Jan

```
effectiveFrom = Jan 2026
Member dateOfJoiningAssociation = Feb 2026

BEFORE:
  Feb ₹100 (PAID, paid=100)  Mar ₹100 (DUE, paid=0)  Apr ₹100 (DUE, paid=0)

AFTER (Jan skipped because member joined Feb):
  Feb ₹150 (PARTIAL, paid=100, due=50)  Mar ₹150 (DUE, paid=0, due=150)  Apr ₹150 (DUE, paid=0, due=150)
```

### Flow 3: Price Decrease (₹150 → ₹100), Member Paid ₹150 for March

```
effectiveFrom = March 2026

BEFORE:
  Mar ₹150 (PAID, paid=150)  Apr ₹150 (DUE, paid=0)

AFTER:
  Mar ₹100 (PAID, paid=100, surplus=50 carried forward)  Apr ₹100 (PARTIAL, paid=50, due=50)
```

### Safety Rules

- **WAIVED** periods are **never** touched — amount stays as-is
- Periods with `paidAmount >= newExpectedAmount` become **PAID** with surplus carried forward FIFO
- Periods with `0 < paidAmount < newExpectedAmount` become **PARTIAL**
- Periods with `paidAmount == 0` stay **DUE** (or **OVERDUE** if `dueDate <= now`)
- **PENDING** periods (future months) get their `expectedAmount` and `dueAmount` updated

---

## File Structure

| File                                          | Action | Responsibility                                                                                                                                                                                  |
| --------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/plans/services/plan.service.ts` | Modify | Fix `updatePlan()` trigger condition to not require `effectiveTo`; fix `retroactivelyAdjustContributionsForPlan()` to auto-compute `effectiveTo` as current month and respect member join dates |
| `src/features/plans/validators/index.ts`      | Verify | Confirm `effectiveTo` is already optional in `UpdatePlanSchema` (it is — no change needed)                                                                                                      |
| `tests/features/plans/retro-billing.test.ts`  | Create | Integration tests for all retro-billing scenarios                                                                                                                                               |

---

## Task 1: Fix the `updatePlan()` Retro-Adjustment Trigger Condition

**Files:**

- Modify: `src/features/plans/services/plan.service.ts:450-464`

Currently, retroactive adjustment only triggers when **both** `effectiveFrom` AND `effectiveTo` are provided. This means the caller must know and specify the end date, which is unintuitive — the end date should default to the current month automatically.

- [ ] **Step 1: Update the retro-adjustment trigger in `updatePlan()`**

In `src/features/plans/services/plan.service.ts`, change the condition at lines 450-464.

Replace:

```typescript
// ── Retroactive adjustment ──────────────────────────────────────
if (
  body.effectiveFrom &&
  body.effectiveTo &&
  body.amount !== undefined &&
  body.amount !== Number(currentVersion.amount)
) {
  await retroactivelyAdjustContributionsForPlan(
    tx,
    planId,
    newVersion.amount,
    body.effectiveFrom,
    body.effectiveTo,
  );
}
```

With:

```typescript
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
```

- [ ] **Step 2: Add the `endOfCurrentMonth()` helper at the top of the file (after imports)**

Add this helper function near the top of `plan.service.ts`, after the import block (around line 15):

```typescript
/**
 * Return the last day of the current month at 23:59:59.999.
 * Used as the default upper bound for retroactive adjustments.
 */
function endOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}
```

- [ ] **Step 3: Verify the change compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to `plan.service.ts`

- [ ] **Step 4: Commit**

```bash
git add src/features/plans/services/plan.service.ts
git commit -m "fix(plans): remove effectiveTo requirement for retro-adjustment trigger"
```

---

## Task 2: Fix `retroactivelyAdjustContributionsForPlan()` to Respect Member Join Dates

**Files:**

- Modify: `src/features/plans/services/plan.service.ts:228-345`

Currently, the function adjusts ALL contribution periods in the date range for each user, regardless of when the member joined. A member who joined in Feb should NOT have a retro-adjustment applied to January (even if a Jan contribution somehow existed).

- [ ] **Step 1: Update the function to fetch `dateOfJoiningAssociation` for each user**

In `src/features/plans/services/plan.service.ts`, modify the `retroactivelyAdjustContributionsForPlan()` function.

Change the user query (around line 248-254) from:

```typescript
const users = await tx.user.findMany({
  where: {
    associationId: plan.associationId,
    ...(plan.memberTypeId ? { memberTypeId: plan.memberTypeId } : {}),
  },
  select: { id: true },
});
```

To:

```typescript
const users = await tx.user.findMany({
  where: {
    associationId: plan.associationId,
    status: 'ACTIVE',
    ...(plan.memberTypeId ? { memberTypeId: plan.memberTypeId } : {}),
  },
  select: { id: true, dateOfJoiningAssociation: true },
});
```

- [ ] **Step 2: Add join-date filtering to the contribution period query**

Inside the `for (const { id: userId } of users)` loop, after the user destructuring (around line 256), add join-date boundary calculation. Change the loop to also destructure `dateOfJoiningAssociation`:

Replace:

```typescript
  for (const { id: userId } of users) {
    // 2. Find contribution periods in the date range, sorted oldest first
    const periods = await tx.contributionPeriod.findMany({
      where: {
        userId,
        ...(fromYear === toYear
          ? {
              year: fromYear,
              month: { gte: fromMonth, lte: toMonth },
            }
          : {
              OR: [
                { year: { gt: fromYear, lt: toYear } },
                { year: fromYear, month: { gte: fromMonth } },
                { year: toYear, month: { lte: toMonth } },
              ],
            }),
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
```

With:

```typescript
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
```

- [ ] **Step 3: Add WAIVED period protection**

Inside the same function, in the period processing loop (around line 281), add a check to skip WAIVED periods. Add this at the top of the `for (const period of periods)` loop, right after the loop begins:

```typescript
    for (const period of periods) {
      // Never touch waived periods — they are intentionally set to 0
      if (period.status === ContributionStatus.WAIVED) continue;

      const paidAmount = Number(period.paidAmount);
      // ... rest of existing logic
```

- [ ] **Step 4: Verify the change compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to `plan.service.ts`

- [ ] **Step 5: Commit**

```bash
git add src/features/plans/services/plan.service.ts
git commit -m "fix(plans): retro-adjustment respects member join dates and skips waived periods"
```

---

## Task 3: Handle PENDING Status in Retro-Adjustment

**Files:**

- Modify: `src/features/plans/services/plan.service.ts:281-327`

Currently, the retro-adjustment handles three cases: fully paid, partially paid, and unpaid. But the system also has `PENDING` status for future months. These should have their `expectedAmount` and `dueAmount` updated without changing their status.

- [ ] **Step 1: Update the unpaid branch to preserve PENDING status**

In the `retroactivelyAdjustContributionsForPlan()` function, the third branch (lines ~313-326) handles `paidAmount === 0`. Update it to also preserve PENDING status:

Replace:

```typescript
      } else {
        // Nothing paid — determine status by dueDate
        surplus = 0;
        const isOverdue = period.dueDate <= now;

        await tx.contributionPeriod.update({
          where: { id: period.id },
          data: {
            expectedAmount: newAmount,
            dueAmount: newExpected,
            status: isOverdue ? ContributionStatus.OVERDUE : ContributionStatus.DUE,
          },
        });
      }
```

With:

```typescript
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
```

- [ ] **Step 2: Verify the change compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/plans/services/plan.service.ts
git commit -m "fix(plans): retro-adjustment preserves PENDING status for future months"
```

---

## Task 4: Write Integration Tests — Price Increase Scenario

**Files:**

- Create: `tests/features/plans/retro-billing.test.ts`

> **Note to implementer:** Check whether the project uses `vitest`, `jest`, or another test runner by looking at `package.json` devDependencies. Adjust imports accordingly. The examples below use `vitest` style. Also check `tests/` for existing test patterns in this repo — look at file structure and how they set up Prisma/test DB.

- [ ] **Step 1: Check the test setup pattern**

Run: `ls tests/` or `find . -name "*.test.ts" | head -10` to see existing test patterns.
Run: `grep -l "vitest\|jest" package.json` to confirm test runner.

- [ ] **Step 2: Write the test file with price increase scenario**

Create `tests/features/plans/retro-billing.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
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
      registrationNumber: `REG-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
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
});
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npx vitest run tests/features/plans/retro-billing.test.ts`
Expected: All 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/features/plans/retro-billing.test.ts
git commit -m "test(plans): add integration tests for retro-billing on plan price change"
```

---

## Task 5: Write Integration Tests — Price Decrease and Surplus Carry-Forward

**Files:**

- Modify: `tests/features/plans/retro-billing.test.ts`

- [ ] **Step 1: Add price decrease test with surplus carry-forward**

Append these test cases to `tests/features/plans/retro-billing.test.ts` inside the main `describe` block:

```typescript
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
```

- [ ] **Step 2: Run all retro-billing tests**

Run: `npx vitest run tests/features/plans/retro-billing.test.ts`
Expected: All 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/features/plans/retro-billing.test.ts
git commit -m "test(plans): add price decrease, PENDING preservation, and default effectiveTo tests"
```

---

## Task 6: Final Review and Verification

**Files:**

- Verify: `src/features/plans/services/plan.service.ts`

- [ ] **Step 1: Review the complete modified `retroactivelyAdjustContributionsForPlan()` function**

Open `src/features/plans/services/plan.service.ts` and verify the function now:

1. Accepts `effectiveTo` as the end of the retro window (set by `updatePlan()` to default to current month)
2. Fetches users with `dateOfJoiningAssociation` and `status: ACTIVE`
3. Skips users without `dateOfJoiningAssociation`
4. Computes per-user start boundary as `max(effectiveFrom, dateOfJoiningAssociation)`
5. Skips WAIVED periods
6. Preserves PENDING status for future months
7. Carries surplus forward via existing `allocateSurplusToNextPeriods()`

- [ ] **Step 2: Verify full type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run the complete test suite**

Run: `npx vitest run`
Expected: All existing tests pass + all 6 new retro-billing tests pass.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(plans): retroactive billing adjustment on plan version price change

- Remove effectiveTo requirement; defaults to end of current month
- Respect member dateOfJoiningAssociation (Feb joiner skips Jan)
- Skip WAIVED contribution periods
- Preserve PENDING status for future months
- Carry surplus forward on price decrease via FIFO"
```

---

## Summary of Changes

| What Changed                                                                    | Why                                                                |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `updatePlan()` trigger: removed `body.effectiveTo &&` from condition            | `effectiveTo` should default to current month, not be required     |
| Added `endOfCurrentMonth()` helper                                              | Computes default retro window upper bound                          |
| `retroactivelyAdjustContributionsForPlan()`: fetches `dateOfJoiningAssociation` | Needed to compute per-user start boundary                          |
| Added per-user start boundary: `max(effectiveFrom, joinDate)`                   | Prevents retro-billing for months before member joined             |
| Added `WAIVED` status skip                                                      | Waived periods should never be modified                            |
| Added `PENDING` status preservation                                             | Future months should keep PENDING status while getting new amounts |
| Added `status: 'ACTIVE'` filter to user query                                   | Only adjust contributions for active members                       |
