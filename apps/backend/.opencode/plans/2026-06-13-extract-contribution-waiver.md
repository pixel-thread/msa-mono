# Extract ContributionWaiver Model

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract `waivedAt`, `waivedReason`, `waivedBy` from `ContributionPeriod` into a separate `ContributionWaiver` model with a 1:1 relation, cleaning up the ContributionPeriod model and fixing the `waivedBy` bug.

**Architecture:** A new `ContributionWaiver` model with a unique FK back to `ContributionPeriod`. All existing code that reads `period.waivedAt` / `period.waivedReason` switches to `period.waiver?.waivedAt` / `period.waiver?.reason`. The waiveContribution service writes to the new model and finally populates `waivedBy`. Two sequential Prisma migrations: (1) add new table + FK, copy data, (2) drop old columns.

**Tech Stack:** Prisma ORM, PostgreSQL, TypeScript, Express, React (web), React Native (mobile)

---

### Task 1: Create ContributionWaiver model

**Files:**

- Create: `prisma/schema/waiver.prisma`
- Modify: `prisma/schema/contribution.prisma` (add `waiver` relation, deprecate old fields)

- [ ] **Step 1a: Create `prisma/schema/waiver.prisma`**

```prisma
// ─────────────────────────────────────────────────────────────────────────────
// CONTRIBUTION WAIVERS
// A separate 1:1 model for contribution waiver data. Extracted from
// ContributionPeriod to keep the period model lean.
// ─────────────────────────────────────────────────────────────────────────────

model ContributionWaiver {
  id        String   @id @default(uuid())
  periodId  String   @unique
  waivedAt  DateTime
  reason    String?
  waivedBy  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  period ContributionPeriod @relation(fields: [periodId], references: [id], onDelete: Cascade)

  @@index([periodId])
  @@map("contribution_waivers")
}
```

- [ ] **Step 1b: Update `contribution.prisma` — add waiver relation + deprecation comments**

In `ContributionPeriod` model, add after `declarations Declarations[]`:

```prisma
  waiver ContributionWaiver?
```

Add deprecation comments above old waiver columns:

```prisma
  // @deprecated — use `waiver` relation instead
  waivedAt     DateTime?
  // @deprecated — use `waiver` relation instead
  waivedReason String?
  // @deprecated — use `waiver` relation instead
  waivedBy     String?
```

- [ ] **Step 1c: Run initial migration**

```bash
npx prisma migrate dev --name add_contribution_waiver
```

Verify the generated SQL creates `contribution_waivers` table and does NOT drop old columns.

- [ ] **Step 1d: Commit**

```bash
git add prisma/schema/waiver.prisma prisma/schema/contribution.prisma prisma/migrations/0002_add_contribution_waiver/
git commit -m "feat(db): add ContributionWaiver model with 1:1 relation to ContributionPeriod"
```

---

### Task 2: Data backfill + drop old columns

**Files:**

- Create: `prisma/scripts/backfill-waivers.ts`
- Modify: `prisma/schema/contribution.prisma` (remove old columns)

- [ ] **Step 2a: Create backfill script `prisma/scripts/backfill-waivers.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const periods = await prisma.contributionPeriod.findMany({
    where: { waivedAt: { not: null } },
  });

  console.log(`Found ${periods.length} periods with waiver data`);

  for (const period of periods) {
    await prisma.contributionWaiver.create({
      data: {
        periodId: period.id,
        waivedAt: period.waivedAt!,
        reason: period.waivedReason,
        waivedBy: period.waivedBy,
      },
    });
  }

  console.log(`Backfilled ${periods.length} waivers`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2b: Run backfill**

```bash
npx tsx prisma/scripts/backfill-waivers.ts
```

Expected: Found N periods + Backfilled N waivers

- [ ] **Step 2c: Remove old columns from schema**

Delete the 3 deprecated lines from `prisma/schema/contribution.prisma`.

- [ ] **Step 2d: Generate migration to drop columns**

```bash
npx prisma migrate dev --name drop_contribution_period_waiver_columns
```

- [ ] **Step 2e: Commit**

```bash
git add prisma/schema/contribution.prisma prisma/migrations/0003_drop_contribution_period_waiver_columns/
git rm prisma/scripts/backfill-waivers.ts
git commit -m "feat(db): migrate waiver data and drop old columns from contribution_periods"
```

---

### Task 3: Update backend ContributionPeriod type

**Files:**

- Modify: `src/features/contributions/types/index.ts`

- [ ] **Step 3a: Replace flat waiver fields with nested `waiver` object**

Replace:

```typescript
waivedAt: string | null;
waivedReason: string | null;
```

With:

```typescript
  waiver: {
    id: string;
    waivedAt: string;
    reason: string | null;
    waivedBy: string | null;
  } | null;
```

- [ ] **Step 3b: Commit**

```bash
git add src/features/contributions/types/index.ts
git commit -m "feat(backend): update ContributionPeriod type with nested waiver object"
```

---

### Task 4: Update waiveContribution service

**Files:**

- Modify: `src/features/contributions/services/contribution.service.ts`

- [ ] **Step 4a: Rewrite waiveContribution function**

```typescript
export async function waiveContribution(
  contributionPeriodId: string,
  reason: string,
  approvedById: string,
  db: DbClient = prisma,
) {
  const period = await db.contributionPeriod.findUnique({
    where: { id: contributionPeriodId },
  });

  if (!period) {
    throw new NotFoundError('Contribution period not found');
  }

  const amount = Number(period.dueAmount);

  const [updated] = await db.$transaction([
    db.contributionPeriod.update({
      where: { id: contributionPeriodId },
      data: {
        status: ContributionStatus.WAIVED,
        dueAmount: 0,
        waiver: {
          upsert: {
            create: {
              waivedAt: new Date(),
              reason,
              waivedBy: approvedById,
            },
            update: {
              waivedAt: new Date(),
              reason,
              waivedBy: approvedById,
            },
          },
        },
      },
      include: { waiver: true },
    }),
  ]);

  if (amount > 0) {
    await recordWaiver(db, {
      associationId: period.associationId,
      amount,
      memberId: period.userId,
      period: `${period.year}-${period.month}`,
      approvedById,
    });
  }

  return updated;
}
```

- [ ] **Step 4b: Commit**

```bash
git add src/features/contributions/services/contribution.service.ts
git commit -m "feat(backend): update waiveContribution to use ContributionWaiver model, fix waivedBy bug"
```

---

### Task 5: Update route handlers to include waiver

**Files:**

- Modify: `src/features/contributions/routes/contributions.route.ts`

- [ ] **Step 5a: Add `waiver: true` to 3 includes**

In `myContributionsHandler`, `listContributionsHandler`, `getContributionHandler`:

```typescript
      include: {
        user: { select: { id: true, name: true, email: true, membershipNumber: true } },
        waiver: true,
        allocations: { /* existing */ },
      },
```

- [ ] **Step 5b: Commit**

```bash
git add src/features/contributions/routes/contributions.route.ts
git commit -m "feat(backend): include waiver relation in contribution route handlers"
```

---

### Task 6: Update web frontend

**Files:**

- Modify: `apps/web/src/features/contributions/types/index.ts`
- Modify: `apps/web/src/features/contributions/components/contribution-detail.tsx`

- [ ] **Step 6a: Update web ContributionPeriod type**

Replace `waivedAt: string | null; waivedReason: string | null;` with nested waiver.

- [ ] **Step 6b: Update contribution-detail.tsx waiver card**

Access `contribution.waiver?.waivedAt` and `contribution.waiver?.reason`.

- [ ] **Step 6c: Commit**

---

### Task 7: Update mobile frontend types

**Files:**

- Modify: `apps/mobile/src/features/contributions/types/contribution-period.types.ts`

- [ ] **Step 7a: Update type**

Replace `waivedAt: string | null; waivedReason: string | null;` with nested waiver object.

- [ ] **Step 7b: Commit**

---

### Task 8: Update retro-billing integration test

**Files:**

- Modify: `src/__tests__/integration/retro-billing.test.ts`

- [ ] **Step 8a: Update waiver creation in WAIVED Period Protection test**

Replace `data: { dueAmount: 0, waivedAt: new Date(), waivedReason: 'Hardship' },` with:

```typescript
await prisma.contributionWaiver.create({
  data: {
    periodId: waivedPeriod!.id,
    waivedAt: new Date(),
    reason: 'Hardship',
  },
});
await prisma.contributionPeriod.update({
  where: { id: waivedPeriod!.id },
  data: { dueAmount: 0 },
});
```

- [ ] **Step 8b: Run tests**

```bash
npx vitest run src/__tests__/integration/retro-billing.test.ts
```

Expected: All tests PASS

- [ ] **Step 8c: Commit**

---

### Task 9: Verify and clean up

- [ ] **Step 9a: Check for stale references**

```bash
rg "waivedAt" -g '*.ts' -g '*.tsx' -g '*.prisma'
rg "waivedReason" -g '*.ts' -g '*.tsx' -g '*.prisma'
```

- [ ] **Step 9b: Full test suite**

```bash
npx vitest run
```

Expected: All PASS

- [ ] **Step 9c: Web type check**

```bash
cd ../../apps/web && npx tsc --noEmit
```

- [ ] **Step 9d: Mobile type check**

```bash
cd ../../apps/mobile && npx tsc --noEmit
```

- [ ] **Step 9e: Commit final cleanup**

```bash
git add -A && git commit -m "chore: clean up remaining waived field references after waiver extraction"
```
