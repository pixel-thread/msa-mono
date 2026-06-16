# Retroactive Adjustment Audit Trail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a plan price change triggers retroactive adjustment of ContributionPeriods, persist an audit trail recording which plan version change caused it, which users were affected, and the before/after amounts — enabling queries like "who was impacted by the June 2026 price increase and by how much."

**Architecture:** Two new Prisma models (`RetroactiveAdjustment` and `RetroactiveAffectedUser`) alongside existing ledger models. The existing `retroactivelyAdjustContributionsForPlan()` function in `plan.service.ts` is extended to create audit records as it iterates over affected periods. No new API endpoints — the trail is written during the existing PATCH flow and queryable via direct Prisma reads.

**Tech Stack:** TypeScript, Prisma, PostgreSQL, Express 5, Vitest

---

## File Structure

```
prisma/schema/
  retroactive.prisma                    ← NEW: RetroactiveAdjustment + RetroactiveAffectedUser models

src/features/plans/services/
  plan.service.ts                       ← MODIFY: retroactivelyAdjustContributionsForPlan creates audit records

src/__tests__/integration/
  retro-billing.test.ts                 ← MODIFY: add audit-trail assertions to existing tests
  retroactive-audit.test.ts             ← NEW: dedicated audit trail test suite
```

---

### Task 1: Add Prisma models for retroactive audit trail

**Files:**
- Create: `prisma/schema/retroactive.prisma`

- [ ] **Step 1: Write the Prisma schema file**

```prisma
// ─────────────────────────────────────────────────────────────────────────────
// RETROACTIVE ADJUSTMENT AUDIT TRAIL
// Records every plan price change that triggers retroactive billing, plus
// every ContributionPeriod that was adjusted as a result.
// ─────────────────────────────────────────────────────────────────────────────

model RetroactiveAdjustment {
  id String @id @default(uuid())

  associationId String
  planId        String

  oldAmount Decimal @db.Decimal(10, 2)
  newAmount Decimal @db.Decimal(10, 2)

  effectiveFrom DateTime
  effectiveTo   DateTime

  createdAt DateTime @default(now())

  affectedUsers RetroactiveAffectedUser[]

  @@index([associationId])
  @@index([planId])
  @@index([createdAt])
  @@map("retroactive_adjustments")
}

model RetroactiveAffectedUser {
  id String @id @default(uuid())

  retroactiveAdjustmentId String

  userId               String
  contributionPeriodId String

  previousExpectedAmount Decimal @db.Decimal(10, 2)
  newExpectedAmount      Decimal @db.Decimal(10, 2)
  adjustmentAmount       Decimal @db.Decimal(10, 2)

  createdAt DateTime @default(now())

  retroactiveAdjustment RetroactiveAdjustment
    @relation(fields: [retroactiveAdjustmentId], references: [id])

  user               User               @relation(fields: [userId], references: [id])
  contributionPeriod ContributionPeriod  @relation(fields: [contributionPeriodId], references: [id])

  @@index([retroactiveAdjustmentId])
  @@index([userId])
  @@index([contributionPeriodId])
  @@map("retroactive_affected_users")
}
```

- [ ] **Step 2: Generate Prisma client**

Run: `npx prisma generate` from `apps/backend`

Expected: No errors, new types `RetroactiveAdjustment` and `RetroactiveAffectedUser` available.

- [ ] **Step 3: Create database migration**

Run: `npx prisma migrate dev --name add_retroactive_adjustment_trail` from `apps/backend`

Expected: Migration applied, new tables `retroactive_adjustments` and `retroactive_affected_users` created.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema/retroactive.prisma prisma/migrations/
git commit -m "feat: add RetroactiveAdjustment and RetroactiveAffectedUser models"
```

---

### Task 2: Extend retroactive adjustment logic to create audit records

**Files:**
- Modify: `src/features/plans/services/plan.service.ts`

- [ ] **Step 1: Add the import for the new type**

No import changes needed — Prisma types are auto-generated and already imported via `@prisma/client`. The `ContributionStatus` import is already present on line 13.

- [ ] **Step 2: Update `retroactivelyAdjustContributionsForPlan` signature to accept `oldAmount`**

Change the function on line 236 from:

```typescript
async function retroactivelyAdjustContributionsForPlan(
  tx: Prisma.TransactionClient,
  planId: string,
  newAmount: Prisma.Decimal,
  effectiveFrom: Date,
  effectiveTo: Date,
): Promise<void> {
```

To:

```typescript
async function retroactivelyAdjustContributionsForPlan(
  tx: Prisma.TransactionClient,
  planId: string,
  oldAmount: Prisma.Decimal,
  newAmount: Prisma.Decimal,
  effectiveFrom: Date,
  effectiveTo: Date,
): Promise<void> {
```

- [ ] **Step 3: Create the `RetroactiveAdjustment` record at the top of the function**

After the plan lookup (after line 254 where `plan` is fetched), add:

```typescript
  // ── Create audit trail record for this adjustment batch ──────────
  const adjustment = await tx.retroactiveAdjustment.create({
    data: {
      associationId: plan.associationId,
      planId,
      oldAmount,
      newAmount,
      effectiveFrom,
      effectiveTo,
    },
  });
```

- [ ] **Step 4: Create `RetroactiveAffectedUser` records in the period loop**

Inside the per-period `for` loop, after the `ContributionPeriod.update` block (after the WAIVED skip), add audit record creation. Insert after each of the three update branches (fully paid / partially paid / unpaid) — but before moving to the next period.

Add this before the closing brace of the `for (const period of periods)` loop:

```typescript
      // ── Audit trail ──────────────────────────────────────────────
      await tx.retroactiveAffectedUser.create({
        data: {
          retroactiveAdjustmentId: adjustment.id,
          userId,
          contributionPeriodId: period.id,
          previousExpectedAmount,
          newExpectedAmount: newExpected,
          adjustmentAmount,
        },
      });
```

You'll need to add `const previousExpected = Number(period.expectedAmount);` at the top of the period loop (before the WAIVED check) and `const adjustmentAmount = newExpected - previousExpected;` after it.

The period loop should now look like this (showing only the relevant additions):

```typescript
    for (const period of periods) {
      // Never touch waived periods — they are intentionally set to 0
      if (period.status === ContributionStatus.WAIVED) continue;

      const previousExpected = Number(period.expectedAmount);   // ← NEW
      const adjustmentAmount = newExpected - previousExpected;  // ← NEW

      // ... existing paid/partial/unpaid update blocks ...

      // ── Audit trail ──────────────────────────────────────────────
      await tx.retroactiveAffectedUser.create({
        data: {
          retroactiveAdjustmentId: adjustment.id,
          userId,
          contributionPeriodId: period.id,
          previousExpectedAmount: previousExpected,
          newExpectedAmount: newExpected,
          adjustmentAmount,
        },
      });
    }
```

- [ ] **Step 5: Update the caller to pass `oldAmount`**

In `updatePlan`, change the call site (around line 504) from:

```typescript
        await retroactivelyAdjustContributionsForPlan(
          tx,
          planId,
          newVersion.amount,
          body.effectiveFrom,
          retroEnd,
        );
```

To:

```typescript
        await retroactivelyAdjustContributionsForPlan(
          tx,
          planId,
          currentVersion.amount,  // ← oldAmount
          newVersion.amount,
          body.effectiveFrom,
          retroEnd,
        );
```

- [ ] **Step 6: Run existing tests to verify no regressions**

Run: `npx vitest run src/__tests__/integration/retro-billing.test.ts` from `apps/backend`

Expected: All tests pass.

- [ ] **Step 7: Run plan change integration tests**

Run: `npx vitest run src/__tests__/integration/subscriptions.plan-change.test.ts` from `apps/backend`

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/features/plans/services/plan.service.ts
git commit -m "feat: create retroactive adjustment audit records during plan price change"
```

---

### Task 3: Write dedicated audit trail tests

**Files:**
- Create: `src/__tests__/integration/retroactive-audit.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
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

    const affectedUsers = await prisma.retroactiveAffectedUser.findMany({
      where: {
        retroactiveAdjustment: { associationId: association.id },
      },
      orderBy: { contributionPeriod: { year: 'asc', month: 'asc' } },
    });

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
        name: 'User 1',
        status: UserStatus.ACTIVE,
        dateOfJoiningAssociation: new Date('2026-01-01'),
      },
    });

    const user2 = await prisma.user.create({
      data: {
        associationId: association.id,
        email: `multi-user-2-${Date.now()}@test.com`,
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
```

- [ ] **Step 2: Run the new audit trail tests**

Run: `npx vitest run src/__tests__/integration/retroactive-audit.test.ts` from `apps/backend`

Expected: All 6 tests pass.

- [ ] **Step 3: Run full test suite to confirm no regressions**

Run: `npx vitest run` from `apps/backend`

Expected: All tests pass, including existing retro-billing and plan-change tests.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/integration/retroactive-audit.test.ts
git commit -m "test: add audit trail tests for retroactive adjustment records"
```

---

## Self-Review

### 1. Spec Coverage

| Requirement | Task |
|---|---|
| `RetroactiveAdjustment` model with associationId, planId, oldAmount, newAmount, effectiveFrom, effectiveTo | Task 1 |
| `RetroactiveAffectedUser` model with userId, contribPeriodId, before/after amounts, adjustmentAmount | Task 1 |
| Link to ContributionPeriod, User | Task 1 (relation fields) |
| Index on associationId, planId, createdAt for querying | Task 1 (index declarations) |
| Audit records created during retro adjustment | Task 2, Steps 2-4 |
| WAIVED periods excluded from audit trail | Task 3, test "should skip WAIVED periods" |
| No audit records when price doesn't change retroactively | Task 3, test "should NOT create when no effectiveFrom" |
| Multi-user support (one adjustment, many affected users) | Task 3, test "multiple users on same plan" |
| Association-level querying | Task 3, test "querying all adjustments for association" |

### 2. Placeholder Scan

No "TBD", "TODO", "implement later", or placeholder code. The function signature change in Task 2 Step 2 shows both the old and new code. All code blocks are complete.

### 3. Type Consistency

- `RetroactiveAffectedUser.adjustmentAmount` → `newExpectedAmount - previousExpectedAmount`
- `RetroactiveAdjustment.oldAmount` / `newAmount` → `Prisma.Decimal` (matches `PlanVersion.amount`)
- `effectiveFrom` / `effectiveTo` → `DateTime` (matches `PlanVersion`)
- Foreign keys → `String` (matches Prisma conventions)
- `adjustmentAmount` is positive for price increases, negative for decreases — intentional

### 4. Edge Cases

- **WAIVED periods**: Skipped via `continue` before audit creation
- **No price change**: Caller guard prevents calling the function
- **No effectiveFrom**: Same caller guard
- **Multi-user plan**: One `RetroactiveAdjustment`, N `RetroactiveAffectedUser` — 1:N correctly modeled

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-16-retroactive-adjustment-audit-trail.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
