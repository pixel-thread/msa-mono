# Deduplication Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate 7 identified duplication patterns across payments/contributions features by extracting shared helpers and using existing shared utilities.

**Architecture:** One new shared file (`complete-payment-transaction.ts`), one new generic utility (`find-paginated.ts`), and targeted inline replacements across 6 existing files.

**Tech Stack:** TypeScript, Prisma, Node.js

---

### Task 1: Extract shared `completePaymentInTransaction` helper

**Files:**

- Create: `src/shared/services/complete-payment-transaction.ts`
- Modify: `src/features/payments/services/payment.service.ts` (use it in `verifyAndCompletePayment`)
- Modify: `src/features/payments/services/webhook.service.ts` (use it in `verifyAndCompletePaymentFromWebhook`)

**Context:** Both `verifyAndCompletePayment` (payment.service.ts:308-371) and `verifyAndCompletePaymentFromWebhook` (webhook.service.ts:339-392) run nearly identical logic inside their `$transaction` blocks: update transaction → `createAllocations` → `recordMemberPayment` → `logAction`.

**Step 1: Create `src/shared/services/complete-payment-transaction.ts`**

```typescript
import { NotFoundError } from '@errors';
import type { PaymentMethod, Prisma } from '@prisma/client';
import { AuditAction, PaymentStatus } from '@prisma/client';
import { createAllocations } from '@services/allocate-contributions';
import { recordMemberPayment } from '@services/accounting';
import { logAction } from '@services/audit-logs';
import { updatePaymentTransaction } from '@src/shared/services/payments';

export interface CompletePaymentOptions {
  transactionId: string;
  userId: string;
  associationId: string;
  amount: number;
  razorpayPaymentId?: string;
  method?: PaymentMethod | string;
  source?: string;
  description?: string;
  paidAt?: Date;
}

/**
 * Core payment completion logic shared between client-side verification
 * and webhook handlers. Must be called inside a $transaction callback.
 */
export async function completePaymentInTransaction(
  tx: Prisma.TransactionClient,
  options: CompletePaymentOptions,
) {
  const {
    transactionId,
    userId,
    associationId,
    amount,
    razorpayPaymentId,
    method,
    source,
    description,
    paidAt,
  } = options;
  const now = paidAt ?? new Date();

  // 1. Update transaction to COMPLETED
  const updated = await updatePaymentTransaction({
    db: tx,
    where: { id: transactionId },
    data: {
      status: PaymentStatus.COMPLETED,
      ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
      paidAt: now,
      ...(method ? { method: method as PaymentMethod } : {}),
    },
  });

  // 2. Allocate to outstanding contribution periods (FIFO)
  await createAllocations(tx, transactionId, userId, Number(amount));

  // 3. Create ledger entry
  await recordMemberPayment(tx, {
    associationId,
    paymentTransactionId: transactionId,
    amount: Number(amount),
    description: description ?? 'Online payment via Razorpay',
    createdById: userId,
    method: method ?? 'ONLINE',
  });

  // 4. Audit log
  await logAction(
    {
      associationId,
      actorId: userId,
      action: AuditAction.PAYMENT_COMPLETED,
      resourceType: 'PaymentTransaction',
      resourceId: transactionId,
      newValues: {
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        amount: Number(amount),
        ...(source ? { source } : {}),
      },
    },
    tx,
  );

  return updated;
}
```

**Step 2: Update `verifyAndCompletePayment` in `payment.service.ts`**

Replace the transaction body (lines 308-371) with a call to `completePaymentInTransaction`:

```typescript
return prisma.$transaction(async (tx) => {
  if (!transaction.userId) {
    throw new NotFoundError('User not found on transaction');
  }

  if (!isValid) {
    return await updatePaymentTransaction({
      where: { id: transaction.id },
      data: {
        status: PaymentStatus.FAILED,
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        paidAt: new Date(),
        method: PaymentMethod.ONLINE as PaymentMethod,
      },
      db: tx,
    });
  }

  return await completePaymentInTransaction(tx, {
    transactionId: transaction.id,
    userId: transaction.userId,
    associationId: transaction.associationId,
    amount: Number(transaction.amount),
    razorpayPaymentId: input.razorpayPaymentId,
    method: 'ONLINE',
    description: 'Online payment via Razorpay',
  });
});
```

**Step 3: Update `verifyAndCompletePaymentFromWebhook` in `webhook.service.ts`**

Replace the transaction body (lines 339-392):

```typescript
async function verifyAndCompletePaymentFromWebhook(
  transactionId: string,
  razorpayPaymentId: string,
) {
  return prisma.$transaction(async (tx) => {
    const transaction = await findUniquePaymentTransactions({ id: transactionId }, tx);
    if (!transaction || transaction.status === 'COMPLETED') {
      return transaction;
    }

    return await completePaymentInTransaction(tx, {
      transactionId,
      userId: transaction.userId || '',
      associationId: transaction.associationId,
      amount: Number(transaction.amount),
      razorpayPaymentId,
      method: 'ONLINE',
      source: 'webhook',
      description: 'Online payment via Razorpay (webhook confirmed)',
    });
  });
}
```

**Step 4: Import the new helper**

In both files, add:

```typescript
import { completePaymentInTransaction } from '@services/payments/complete-payment-transaction';
```

Actually, let me check the import path convention. Shared services are at `@src/shared/services/` or `@services/`. Let me use the right path.

The `createAllocations` is imported as `@services/allocate-contributions` and `recordMemberPayment` as `@services/accounting`. So the new file should be importable similarly. Let me put it at `src/shared/services/complete-payment-transaction.ts` and import as `@services/payments/complete-payment-transaction` or similar.

Actually, looking at existing import patterns:

- `from '@services/accounting'` → `src/shared/services/accounting.ts`
- `from '@services/allocate-contributions'` → `src/shared/services/allocate-contributions.ts`
- `from '@services/audit-logs'` → `src/shared/services/audit-logs.ts`
- `from '@services/payments'` → `src/shared/services/payments/index.ts`

So `@services/complete-payment-transaction` should work if the tsconfig alias maps `@services` to `src/shared/services/`.

**Step 5: Compile check**
Run: `npx tsc --noEmit --pretty`

---

### Task 2: Replace inline ledger creation with `recordMemberPayment`

**Files:**

- Modify: `src/features/contributions/services/contribution.service.ts`

**Context:** `allocatePaymentToContributions` (lines 94-146) manually implements ledger entry creation that duplicates `recordMemberPayment` from `shared/services/accounting.ts`.

**Step 1: Replace the ledger creation block**

In `allocatePaymentToContributions`, replace lines 94-146 (the "Phase 3" section):

```typescript
// Phase 3: Create one consolidated ledger entry for the entire payment
if (allocatedAmount > 0 && outstanding.length > 0) {
  await recordMemberPayment(tx, {
    associationId: outstanding[0].associationId,
    paymentTransactionId,
    amount: allocatedAmount,
    description,
    createdById: actorId || userId,
    method: payment.method,
  });
}

return allocatedAmount;
```

The import for `recordMemberPayment` already exists at line 14.

**Step 2: Remove the unused imports**

If `ApprovalStatus`, `JournalLine`, and `PaymentGateway` are no longer used after this change (check the file — they may still be used elsewhere), remove them.

**Step 3: Compile check**
Run: `npx tsc --noEmit --pretty`

---

### Task 3: Generic `findPaginated` utility

**Files:**

- Create: `src/shared/services/find-paginated.ts`
- Modify: `src/features/payments/services/find-payment-transactions.ts`
- Modify: `src/features/contributions/services/find-contribution-periods.ts`

**Step 1: Create `src/shared/services/find-paginated.ts`**

```typescript
import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';
import { buildPaginationParams } from '@utils/helper';

type DbClient = Prisma.TransactionClient | typeof prisma;

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type PrismaDelegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: any) => Promise<number>;
};

type FindPaginatedArgs<W, I, O> = {
  where: W;
  include?: I;
  orderBy?: O;
  page?: number;
  pageSize?: number;
};

export async function findPaginated<T, W, I, O>(
  delegate: PrismaDelegate,
  args: FindPaginatedArgs<W, I, O>,
  db: DbClient = prisma,
): Promise<PaginatedResult<T>> {
  const { where, include, orderBy, page = 1 } = args;
  const { skip, take } = buildPaginationParams(page);

  const [items, total] = await Promise.all([
    delegate.findMany({ where, include, orderBy, skip, take }),
    delegate.count({ where }),
  ]);

  return { items, total };
}
```

**Step 2: Update `find-payment-transactions.ts`**

```typescript
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';
import { findPaginated } from '@services/find-paginated';

type Props = {
  where: Prisma.PaymentTransactionWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.PaymentTransactionInclude;
};

export async function findPaginatedPaymentTransactions({ where, page = 1, include }: Props) {
  const { items, total } = await findPaginated(prisma.paymentTransaction, {
    where,
    include,
    orderBy: { paymentDate: 'desc' },
    page,
  });
  return { transactions: items, total };
}
```

**Step 3: Update `find-contribution-periods.ts`**

```typescript
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';
import { findPaginated } from '@services/find-paginated';

type Props = {
  where: Prisma.ContributionPeriodWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.ContributionPeriodInclude;
};

export async function findContributionPeriods({ where, page = 1, include }: Props) {
  const { items, total } = await findPaginated(prisma.contributionPeriod, {
    where,
    include,
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
    page,
  });
  return { contributions: items, total };
}
```

**Step 4: Compile check**
Run: `npx tsc --noEmit --pretty`

---

### Task 4: Use `createRazorpayClient` factory in `payment.service.ts`

**Files:**

- Modify: `src/features/payments/services/payment.service.ts`

**Context:** Two functions create `new Razorpay(...)` inline with error handling (lines 97-109 and 197-209) instead of using the existing `createRazorpayClient` factory from `razorpay.service.ts`.

**Step 1: Update `createPaymentOrder`**

Replace lines 97-109:

```typescript
const razorpayClient = createRazorpayClient(keyId, keySecret);
```

Remove the `try/catch` block. The Razorpay constructor doesn't throw synchronously for invalid credentials (it throws on API calls), so the error handling was misleading anyway.

**Step 2: Update `createTestPaymentOrder`**

Replace lines 197-209:

```typescript
const razorpayClient = createRazorpayClient(provider.keyId, keySecret);
```

**Step 3: Add import**

```typescript
import { createRazorpayClient, verifyPaymentSignature } from './razorpay.service';
```

(Update the existing import on line 23.)

**Step 4: Remove unused imports**
`PaymentError` and `decrypt` may still be used elsewhere. Don't remove them unless unused.

**Step 5: Compile check**
Run: `npx tsc --noEmit --pretty`

---

### Task 5: Use `createPaymentTransaction` in contributions

**Files:**

- Modify: `src/features/contributions/services/contribution.service.ts`

**Context:** `recordContributionPayment` (line 485) calls `db.paymentTransaction.create` inline instead of the shared `createPaymentTransaction` wrapper.

**Step 1: Add import**

```typescript
import { createPaymentTransaction } from '@src/shared/services/payments';
```

**Step 2: Replace the inline create**

Replace:

```typescript
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
```

With:

```typescript
const payment = await createPaymentTransaction({
  data: {
    user: { connect: { id: userId } },
    association: { connect: { id: associationId } },
    amount,
    currency: Currency.INR,
    gateway: PaymentGateway.MANUAL,
    status: PaymentStatus.PENDING,
    method: paymentMethod,
    paidAt,
    createdById,
  },
  db,
});
```

Note: `createPaymentTransaction` uses `Prisma.PaymentTransactionCreateInput` which requires relation syntax (`user: { connect: { id } }`) rather than direct `userId` field.

**Step 3: Compile check**
Run: `npx tsc --noEmit --pretty`

---

### Task 6: Standardize `findUniqueContributionPeriod`

**Files:**

- Modify: `src/features/contributions/services/find-unique-contribution-period.ts`

**Step 1: Update to use `findUnique` with `WhereUniqueInput`**

```typescript
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.ContributionPeriodWhereUniqueInput;
  include?: Prisma.ContributionPeriodInclude;
  db?: DbClient;
};

export async function findUniqueContributionPeriod({ where, include, db = prisma }: Props) {
  return await db.contributionPeriod.findUnique({ where, include });
}
```

**Step 2: Compile check**
Run: `npx tsc --noEmit --pretty`

---

### Task 7: Use `logAction` in webhook refund handler

**Files:**

- Modify: `src/features/payments/services/webhook.service.ts`

**Context:** The refund handler (lines 279-292) calls `tx.auditLog.create` directly instead of the shared `logAction({...}, tx)`.

**Step 1: Replace the inline `auditLog.create`**

Replace (lines 279-292):

```typescript
    await tx.auditLog.create({ ... });
```

With:

```typescript
await logAction(
  {
    associationId: transaction.associationId,
    actorId: '', // System-initiated via webhook
    action: AuditAction.PAYMENT_REFUNDED,
    resourceType: 'PaymentTransaction',
    resourceId: transaction.id,
    newValues: {
      refundId: refund.id,
      refundAmount: refund.amount / 100,
      refundStatus: refund.status,
    },
  },
  tx,
);
```

`logAction` accepts an optional `tx` param (already exists in the function signature).

**Step 2: Compile check**
Run: `npx tsc --noEmit --pretty`

---

### Final Verification

**Step 1: Full TypeScript compilation check**
Run: `npx tsc --noEmit --pretty`

**Step 2: Check for remaining duplication**
Run: `rg "tx\.auditLog\.create|new Razorpay" src/features/` to confirm no remaining inline patterns.
