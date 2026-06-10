# Transaction Client Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all payment/contribution service functions to accept an optional Prisma transaction client (`db`/`tx`) parameter so they can participate in caller-owned transactions, and fix a bug where `findUniqueUser` is called inside a `$transaction` without tx support.

**Architecture:** Add a shared `DbClient` type alias, convert all direct `prisma` usages to accept an optional `db` param (defaulting to `prisma`), and convert functions that wrap internally in `$transaction` to accept external `tx` with internal fallback. This is a pure refactor — no behavior changes.

**Tech Stack:** TypeScript, Prisma, Node.js

---

### Task 1: Fix `findUniqueUser` bug — add optional `db` param

**Files:**

- Modify: `src/shared/services/user/get-unique-user.ts`
- Verify no other callers break

- [ ] **Step 1: Add `db` param to `findUniqueUser`**

Update `src/shared/services/user/get-unique-user.ts`:

```typescript
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.UserWhereUniqueInput;
  db?: DbClient;
};

export async function findUniqueUser({ where, db = prisma }: Props) {
  return await db.user.findUnique({
    where,
    select: {
      id: true,
      associationId: true,
      email: true,
      name: true,
      role: true,
      status: true,
      memberTypeId: true,
      imageUrl: true,
    },
  });
}
```

- [ ] **Step 2: Fix the call site in `contribution.service.ts`**

In `src/features/contributions/services/contribution.service.ts`, line 55, the call to `findUniqueUser` is inside a `$transaction` callback but uses `prisma` directly. Change the call to pass the transaction client:

```typescript
const user = await findUniqueUser({ where: { id: userId }, db: tx });
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -50`
Expected: No new type errors.

---

### Task 2: Add `DbClient` type alias to shared and standardize inline query helpers

**Files:**

- Modify: `src/shared/services/payments/create-payment-transaction.ts`
- Modify: `src/shared/services/payments/update-payment-transaction.ts`
- Modify: `src/shared/services/payments/find-unique-payment-transactions.ts`
- Modify: `src/shared/services/payments/find-payment-transactions-first.ts`
- Modify: `src/shared/services/payments/find-payment-transactions.ts`
- Modify: `src/shared/index.ts` (if needed to export shared type)

Currently there's an inconsistency:

- `createPaymentTransaction` uses props style: `{ data, db? }`
- `updatePaymentTransaction` uses props style: `{ where, data, db? }`
- `findUniquePaymentTransactions` uses positional style: `(where, db?)`
- `findPaymentTransactionsFirst` uses positional: `(where, db?)`
- `findPaymentTransactions` uses positional: `(where, db?)`

We'll standardize on the **positional `db` as last param** style (simpler, matches Prisma's own pattern of optional context as last arg) and also consistently accept `include` where it makes sense.

- [ ] **Step 1: Standardize `find-payment-transactions.ts`**

Update `src/shared/services/payments/find-payment-transactions.ts`:

```typescript
import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function findPaymentTransactions(
  where: Prisma.PaymentTransactionWhereInput,
  db: DbClient = prisma,
) {
  return db.paymentTransaction.findMany({ where });
}
```

- [ ] **Step 2: Standardize `find-payment-transactions-first.ts`**

Update `src/shared/services/payments/find-payment-transactions-first.ts`:

```typescript
import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function findPaymentTransactionsFirst(
  where: Prisma.PaymentTransactionWhereInput,
  db: DbClient = prisma,
) {
  return db.paymentTransaction.findFirst({ where });
}
```

- [ ] **Step 3: Standardize `find-unique-payment-transactions.ts`**

Update `src/shared/services/payments/find-unique-payment-transactions.ts`:

```typescript
import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function findUniquePaymentTransactions(
  where: Prisma.PaymentTransactionWhereUniqueInput,
  db: DbClient = prisma,
) {
  return db.paymentTransaction.findUnique({ where });
}
```

- [ ] **Step 4: Verify the barrel exports in `src/shared/services/payments/index.ts`**

Read `src/shared/services/payments/index.ts` and fix the duplicate export (line 4 exports `find-unique-payment-transactions` twice instead of also exporting `find-payment-transactions`):

```typescript
export * from './create-payment-transaction';
export * from './find-payment-transactions-first';
export * from './find-unique-payment-transactions';
export * from './find-payment-transactions';
export * from './update-payment-transaction';
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -50`
Expected: No new type errors.

---

### Task 3: Add `db` params to `payment-provider.service.ts`

**Files:**

- Modify: `src/features/payments/services/payment-provider.service.ts`

All 9 functions in this file use `prisma` directly. Add a `DbClient` type and `db` param to each.

- [ ] **Step 1: Update all functions to accept optional `db`**

Update `src/features/payments/services/payment-provider.service.ts` — add the type at the top:

```typescript
import type { Prisma } from '@prisma/client';
// near existing imports

type DbClient = Prisma.TransactionClient | typeof prisma;
```

Then update each function signature. Example for `createProvider`:

```typescript
export async function createProvider(
  input: CreateProviderInput,
  db: DbClient = prisma,
): Promise<ProviderResponse> {
  const encryptedKeySecret = encrypt(input.keySecret);
  const encryptedWebhookSecret = input.webhookSecret ? encrypt(input.webhookSecret) : null;

  const provider = await db.paymentProvider.create({
    data: {
      associationId: input.associationId,
      provider: input.provider,
      keyId: input.keyId,
      encryptedKeySecret,
      encryptedWebhookSecret,
      isActive: input.isActive ?? true,
    },
  });

  return maskProvider(provider);
}
```

Apply the same pattern to: `upsertProvider`, `getProviderById`, `getProvidersByAssociation`, `getActiveProvider`, `setActiveProvider`, `updateProvider`, `deleteProvider`, `migrateFromEnv`.

- [ ] **Step 2: Verify all callers still compile**

Run: `npx tsc --noEmit --pretty 2>&1 | head -100`
Expected: No new type errors.

---

### Task 4: Add `db` params to `payment.service.ts` read functions

**Files:**

- Modify: `src/features/payments/services/payment.service.ts`

The following functions use `prisma` directly and should accept `db`:

- `markPaymentFailed` (write — critical to support tx)
- `getUserPaymentHistory` (read)
- `getAllTransactions` (read)
- `getTransactionById` (read)
- `getFinancialStats` (read)

- [ ] **Step 1: Add `db` param to `markPaymentFailed`**

Add `DbClient` type at top of file (or import if it exists in a shared location). Then:

```typescript
export async function markPaymentFailed(
  razorpayOrderId: string,
  reason?: string,
  db: DbClient = prisma,
) {
  const transaction = await db.paymentTransaction.findUnique({
    where: { razorpayOrderId },
  });

  if (!transaction) return null;

  const updated = await updatePaymentTransaction({
    where: { id: transaction.id },
    data: {
      status: PaymentStatus.FAILED,
      failedAt: new Date(),
      notes: reason ? `${transaction.notes ?? ''}\nFailure: ${reason}`.trim() : transaction.notes,
    },
    db,
  });

  await logAction(
    {
      associationId: transaction.associationId,
      actorId: transaction.userId || '',
      action: AuditAction.PAYMENT_FAILED,
      resourceType: 'PaymentTransaction',
      resourceId: transaction.id,
      newValues: { reason },
    },
    db,
  );

  return updated;
}
```

- [ ] **Step 2: Add `db` param to `getUserPaymentHistory`**

```typescript
export async function getUserPaymentHistory(userId: string, page = 1, db: DbClient = prisma) {
  const validPage = Math.max(1, page);
  const skip = (validPage - 1) * PAGE_SIZE;

  const [transactions, total] = await Promise.all([
    db.paymentTransaction.findMany({ ... }),
    db.paymentTransaction.count({ where: { userId } }),
  ]);
  ...
}
```

- [ ] **Step 3: Add `db` param to `getAllTransactions`**

```typescript
export async function getAllTransactions(
  associationId: string,
  filters: TransactionFilters,
  db: DbClient = prisma,
) { ... }
```

- [ ] **Step 4: Add `db` param to `getTransactionById`**

```typescript
export async function getTransactionById(id: string, associationId: string, db: DbClient = prisma) { ... }
```

- [ ] **Step 5: Add `db` param to `getFinancialStats`**

```typescript
export async function getFinancialStats(associationId: string, db: DbClient = prisma) { ... }
```

- [ ] **Step 6: Compile check**

Run: `npx tsc --noEmit --pretty 2>&1 | head -100`
Expected: No new type errors.

---

### Task 5: Fix `contribution.service.ts` self-transactioning functions

**Files:**

- Modify: `src/features/contributions/services/contribution.service.ts`

Functions that currently wrap in `$transaction` internally:

- `markOverdueContributions`
- `waiveContribution`
- `recordContributionPayment`

They should accept an optional `tx` param. If provided, execute directly; if not, create their own transaction.

- [ ] **Step 1: Fix `markOverdueContributions`**

No callers pass a tx currently, but other callers in the future might. Add optional `tx` param:

```typescript
export async function markOverdueContributions(
  associationId: string,
  userId?: string,
  tx?: Prisma.TransactionClient,
): Promise<number> {
  const now = new Date();
  const filter = {
    associationId,
    ...(userId && { userId }),
  };

  const execute = async (client: Prisma.TransactionClient | typeof prisma) => {
    const presentPeriods = await client.contributionPeriod.updateMany({
      where: { ...filter, status: ContributionStatus.DUE, dueDate: { lte: now } },
      data: { status: ContributionStatus.OVERDUE },
    });
    // ... rest of logic
    return presentPeriods.count + futurePeriods.count;
  };

  return tx ? execute(tx) : prisma.$transaction((t) => execute(t));
}
```

Actually, simpler pattern — just pass `db` throughout:

```typescript
export async function markOverdueContributions(
  associationId: string,
  userId?: string,
  db: DbClient = prisma,
): Promise<number> {
  const now = new Date();
  const filter = {
    associationId,
    ...(userId && { userId }),
  };

  const presentPeriods = await db.contributionPeriod.updateMany({
    where: { ...filter, status: ContributionStatus.DUE, dueDate: { lte: now } },
    data: { status: ContributionStatus.OVERDUE },
  });
  const futurePeriods = await db.contributionPeriod.updateMany({
    where: { ...filter, status: ContributionStatus.DUE, dueDate: { gte: now } },
    data: { status: ContributionStatus.PENDING },
  });
  await db.contributionPeriod.updateMany({
    where: { ...filter, status: ContributionStatus.PENDING, dueDate: { lte: now } },
    data: { status: ContributionStatus.DUE },
  });
  await db.contributionPeriod.updateMany({
    where: { ...filter, status: ContributionStatus.PARTIAL, dueDate: { lte: now } },
    data: { status: ContributionStatus.DUE },
  });

  return presentPeriods.count + futurePeriods.count;
}
```

Since the multiple updateMany calls are actually independent (they operate on different status values), they don't strictly need a transaction. Dropping the `$transaction` wrapper and just using the `db` param is cleaner.

- [ ] **Step 2: Fix `waiveContribution`**

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

  const updated = await db.contributionPeriod.update({
    where: { id: contributionPeriodId },
    data: {
      status: ContributionStatus.WAIVED,
      dueAmount: 0,
      waivedAt: new Date(),
      waivedReason: reason,
    },
  });

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

- [ ] **Step 3: Fix `recordContributionPayment`**

```typescript
export async function recordContributionPayment(
  userId: string,
  associationId: string,
  amount: number,
  paymentMethod: PaymentMethod,
  contributionPeriodIds: string[],
  paidAt: Date,
  createdById: string,
  db: DbClient = prisma,
) {
  if (contributionPeriodIds.length === 0) {
    throw new BadRequestError('No contribution periods selected');
  }

  const payment = await db.paymentTransaction.create({
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
    db,
    payment.id,
    userId,
    amount,
    contributionPeriodIds,
    createdById,
  );

  return payment;
}
```

- [ ] **Step 4: Add `db` param to remaining read functions**

Add `db` param to: `getOutstandingContributions`, `getUserContributionSummary`, `getUserContributions`.

- [ ] **Step 5: Compile check**

Run: `npx tsc --noEmit --pretty 2>&1 | head -100`
Expected: No new type errors.

---

### Task 6: Add `db` params to `declarations.service.ts`

**Files:**

- Modify: `src/features/contributions/services/declarations.service.ts`

- [ ] **Step 1: Add `DbClient` type and update all functions**

Add `DbClient` type to file and add `db` param to: `findDeclarations`, `findUniqueDeclaration`, `submitDeclaration`, `approveDeclaration`, `rejectDeclaration`.

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit --pretty 2>&1 | head -100`
Expected: No new type errors.

---

### Task 7: Add `db` param to `find-subscription-plans.ts`

**Files:**

- Modify: `src/features/payments/services/find-subscription-plans.ts`

- [ ] **Step 1: Add `db` param**

```typescript
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.SubscriptionPlanWhereInput;
  include?: Prisma.SubscriptionPlanInclude;
  db?: DbClient;
};

export async function findSubscriptionPlans({ where, include, db = prisma }: Props) {
  return await db.subscriptionPlan.findMany({
    where,
    include,
    orderBy: { createdAt: 'desc' },
  });
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit --pretty 2>&1 | head -100`
Expected: No new type errors.

---

### Task 8: Final verification

**Files:**

- No file changes — just run compilation

- [ ] **Step 1: Full TypeScript compilation check**

Run: `npx tsc --noEmit --pretty`
Expected: Clean compilation with no new errors.

- [ ] **Step 2: Check for any remaining direct `prisma` usage in the refactored files**

Run: `rg "prisma\." src/features/payments/services/ src/features/contributions/services/ src/shared/services/user/`
Expected: The only `prisma.` usages should be in `DbClient = prisma` defaults, not in the function bodies.
