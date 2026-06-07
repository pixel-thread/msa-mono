# Shared Pagination Helper & FIFO Allocation Deduplication

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate 7+ duplicated paginated Prisma query patterns across payments/contributions/ledger, and remove 3 duplicate FIFO allocation implementations in payments that already exist in contributions.

**Architecture:** Two independent refactors: (1) extract a `buildPaginationParams` utility that eliminates the duplicated `skip = (page - 1) * pageSize` + `Promise.all([findMany, count])` pattern across all 3 features, and (2) extract `createAllocations` from `contribution.service.ts` so `payment.service.ts` and `webhook.service.ts` call it instead of reimplementing the allocation loop.

**Tech Stack:** TypeScript, Prisma, Jest (ts-jest, ESM), Express

---

## File Structure

### Files to Create
| File | Responsibility |
|---|---|
| `src/shared/lib/prisma/helpers.ts` | Export `buildPaginationParams()` shared utility |
| `src/shared/services/allocate-contributions.ts` | Export `createAllocations()` shared FIFO allocation engine |

### Files to Modify
| File | Change |
|---|---|
| `src/features/payments/services/find-payment-transactions.ts` | Rewrite to use `buildPaginationParams` helper |
| `src/features/contributions/services/find-contribution-periods.ts` | Rewrite to use `buildPaginationParams` helper |
| `src/features/contributions/services/declarations.service.ts` | Replace inline `findDeclarations` pagination with `buildPaginationParams` |
| `src/features/ledger/services/ledger.service.ts` | Replace 3 inline pagination blocks (`getEntries`, `getAccounts`, `getMemberEntries`) with `buildPaginationParams` |
| `src/features/contributions/services/contribution.service.ts` | Extract `createAllocations()` from `allocatePaymentToContributions`; export it |
| `src/features/payments/services/payment.service.ts` | Replace inline FIFO allocation loop in `verifyAndCompletePayment` with `createAllocations` |
| `src/features/payments/services/webhook.service.ts` | Replace inline FIFO allocation loop in `verifyAndCompletePaymentFromWebhook` with `createAllocations` |

### Not Modified (but considered)
| File | Reason Skipped |
|---|---|
| `src/features/payments/services/find-subscription-plans.ts` | Not paginated (no page/skip/take) |
| `src/features/contributions/services/find-unique-contribution-period.ts` | Not paginated (singleton `findFirst`) |

---

## Part 1: Shared Paginated Query Helper

### Task 1.1: Create the buildPaginationParams helper

**Files:**
- Create: `src/shared/lib/prisma/helpers.ts`

- [ ] **Step 1.1.1: Create buildPaginationParams implementation**

Create `src/shared/lib/prisma/helpers.ts`:

```typescript
import { PAGE_SIZE } from '@src/shared/constants';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function buildPaginationParams(page: number = 1, pageSize: number = PAGE_SIZE): PaginationParams {
  const p = Math.max(1, page);
  return {
    skip: (p - 1) * pageSize,
    take: pageSize,
    page: p,
    pageSize,
  };
}
```

- [ ] **Step 1.1.2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors

- [ ] **Step 1.1.3: Commit**

```bash
git add src/shared/lib/prisma/helpers.ts
git commit -m "feat: add buildPaginationParams helper"
```

---

### Task 1.2: Refactor payments/find-payment-transactions

**Files:**
- Modify: `src/features/payments/services/find-payment-transactions.ts`

- [ ] **Step 1.2.1: Replace body with buildPaginationParams**

Replace the entire file:

```typescript
import { Prisma } from '@prisma/client';
import { prisma } from '@lib/prisma';
import { buildPaginationParams } from '@lib/prisma/helpers';

type Props = {
  where: Prisma.PaymentTransactionWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.PaymentTransactionInclude;
};

export async function findPaymentTransactions({ where, page = 1, pageSize = 20, include }: Props) {
  const { skip, take } = buildPaginationParams(page, pageSize);
  const [transactions, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      include,
      orderBy: { paymentDate: 'desc' },
      take,
      skip,
    }),
    prisma.paymentTransaction.count({ where }),
  ]);
  return { transactions, total };
}
```

- [ ] **Step 1.2.2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors

- [ ] **Step 1.2.3: Commit**

```bash
git add src/features/payments/services/find-payment-transactions.ts
git commit -m "refactor: use buildPaginationParams in find-payment-transactions"
```

---

### Task 1.3: Refactor contributions/find-contribution-periods

**Files:**
- Modify: `src/features/contributions/services/find-contribution-periods.ts`

- [ ] **Step 1.3.1: Replace body with buildPaginationParams**

Replace the entire file:

```typescript
import { Prisma } from '@prisma/client';
import { prisma } from '@lib/prisma';
import { PAGE_SIZE } from '@src/shared/constants';
import { buildPaginationParams } from '@lib/prisma/helpers';

type Props = {
  where: Prisma.ContributionPeriodWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.ContributionPeriodInclude;
};

export async function findContributionPeriods({
  where,
  page = 1,
  pageSize = PAGE_SIZE,
  include,
}: Props) {
  const { skip, take } = buildPaginationParams(page, pageSize);
  const [contributions, total] = await Promise.all([
    prisma.contributionPeriod.findMany({
      where,
      include,
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      take,
      skip,
    }),
    prisma.contributionPeriod.count({ where }),
  ]);
  return { contributions, total };
}
```

- [ ] **Step 1.3.2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors

- [ ] **Step 1.3.3: Commit**

```bash
git add src/features/contributions/services/find-contribution-periods.ts
git commit -m "refactor: use buildPaginationParams in find-contribution-periods"
```

---

### Task 1.4: Refactor contributions/declarations.service pagination

**Files:**
- Modify: `src/features/contributions/services/declarations.service.ts`

- [ ] **Step 1.4.1: Replace inline pagination in findDeclarations**

Add import at the top of `src/features/contributions/services/declarations.service.ts`:
```typescript
import { buildPaginationParams } from '@lib/prisma/helpers';
```

Replace the `findDeclarations` function body:

```typescript
export async function findDeclarations({ where, include, page = 1 }: Props) {
  const { skip, take } = buildPaginationParams(page);
  return await prisma.$transaction(async (tx) => {
    const declaration = await tx.declarations.findMany({ where, include, take, skip });
    const total = await tx.declarations.count({ where });
    const pagination = buildPagination(total, page);
    return { declaration, pagination };
  });
}
```

- [ ] **Step 1.4.2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors

- [ ] **Step 1.4.3: Commit**

```bash
git add src/features/contributions/services/declarations.service.ts
git commit -m "refactor: use buildPaginationParams in findDeclarations"
```

---

### Task 1.5: Refactor ledger/ledger.service.ts inline pagination

**Files:**
- Modify: `src/features/ledger/services/ledger.service.ts`

- [ ] **Step 1.5.1: Add import**

At the top of `src/features/ledger/services/ledger.service.ts`, add:
```typescript
import { buildPaginationParams } from '@lib/prisma/helpers';
```

- [ ] **Step 1.5.2: Replace getEntries pagination**

Replace the body of `getEntries`:

```typescript
export async function getEntries(associationId: string, page = 1) {
  const { skip, take, page: currentPage } = buildPaginationParams(page);

  const where: Prisma.LedgerEntryWhereInput = {
    OR: [
      { paymentTransaction: { associationId } },
      { lines: { some: { account: { associationId } } } },
    ],
  };

  const [entries, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      include: { lines: true, paymentTransaction: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.ledgerEntry.count({ where }),
  ]);

  return { entries, total, page: currentPage };
}
```

- [ ] **Step 1.5.3: Replace getAccounts pagination**

Replace the body of `getAccounts`:

```typescript
export async function getAccounts(associationId: string, page = 1) {
  const { skip, take, page: currentPage } = buildPaginationParams(page);

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where: { associationId, isActive: true },
      orderBy: { code: 'asc' },
      skip,
      take,
    }),
    prisma.account.count({
      where: { associationId, isActive: true },
    }),
  ]);

  return { accounts, total, page: currentPage };
}
```

- [ ] **Step 1.5.4: Replace getMemberEntries pagination**

Replace the body of `getMemberEntries`:

```typescript
export async function getMemberEntries(associationId: string, memberId: string, page = 1) {
  const { skip, take, page: currentPage } = buildPaginationParams(page);

  const where = {
    createdById: memberId,
    OR: [
      { paymentTransaction: { associationId } },
      { lines: { some: { account: { associationId } } } },
    ],
  };

  const [entries, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      skip,
      take,
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ledgerEntry.count({ where }),
  ]);

  return { entries, total, page: currentPage };
}
```

- [ ] **Step 1.5.5: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors

- [ ] **Step 1.5.6: Commit**

```bash
git add src/features/ledger/services/ledger.service.ts
git commit -m "refactor: use buildPaginationParams in ledger service"
```

---

## Part 2: Shared FIFO Allocation Function

### Task 2.1: Extract createAllocations into shared service

**Files:**
- Create: `src/shared/services/allocate-contributions.ts`
- Modify: `src/features/contributions/services/contribution.service.ts`

- [ ] **Step 2.1.1: Create allocate-contributions.ts with createAllocations**

Create `src/shared/services/allocate-contributions.ts`:

```typescript
import { Prisma, ContributionStatus } from '@prisma/client';

/**
 * Allocate a payment amount across a user's outstanding contribution periods
 * using FIFO (oldest debt first).
 *
 * For each period (ordered by year ASC, month ASC):
 *   - If remaining >= dueAmount -> mark as PAID
 *   - If remaining > 0 but < dueAmount -> mark as PARTIAL
 *   - If remaining == 0 -> stop
 *
 * This ONLY creates PaymentAllocation rows and updates ContributionPeriod
 * records. The caller is responsible for updating the PaymentTransaction
 * status and creating ledger entries via the accounting service.
 *
 * @returns The total amount allocated and the remaining unallocated amount.
 */
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
```

- [ ] **Step 2.1.2: Refactor allocatePaymentToContributions to use createAllocations**

In `src/features/contributions/services/contribution.service.ts`:

Add import:
```typescript
import { createAllocations } from '@services/allocate-contributions';
```

Replace the body of `allocatePaymentToContributions`:

```typescript
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

  if (outstanding.length === 0) return 0;

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
  const { allocatedAmount } = await createAllocations(tx, paymentTransactionId, userId, totalAmount);

  // Update payment transaction
  await tx.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.COMPLETED,
      verifiedById: actorId,
      notes: description,
      paidAt: payment.paidAt ?? new Date(),
    },
  });

  // Create ledger entry (idempotent - skip if already exists)
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
```

- [ ] **Step 2.1.3: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors

- [ ] **Step 2.1.4: Commit**

```bash
git add src/shared/services/allocate-contributions.ts src/features/contributions/services/contribution.service.ts
git commit -m "refactor: extract createAllocations into shared service"
```

---

### Task 2.2: Refactor payment.service.ts to use createAllocations

**Files:**
- Modify: `src/features/payments/services/payment.service.ts`

- [ ] **Step 2.2.1: Replace inline FIFO loop in verifyAndCompletePayment**

Add import at the top of `src/features/payments/services/payment.service.ts`:
```typescript
import { createAllocations } from '@services/allocate-contributions';
```

Replace the section from `return prisma.$transaction(async (tx) => {` to the end of the function. The old code had an inline loop (lines ~397-440). Replace that entire block:

```typescript
  return prisma.$transaction(async (tx) => {
    const now = new Date();

    const updatedTransaction = await tx.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: PaymentStatus.COMPLETED,
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        paidAt: now,
        method: 'ONLINE' as PaymentMethod,
      },
    });

    await recordMemberPayment(tx, {
      associationId: transaction.associationId,
      paymentTransactionId: transaction.id,
      amount: Number(transaction.amount),
      description: 'Online payment via Razorpay',
      createdById: transaction.userId || '',
      method: 'ONLINE',
    });

    // Allocate to outstanding contribution periods (FIFO - oldest first)
    if (!transaction.userId) {
      throw new NotFoundError('User not found on transaction');
    }

    await createAllocations(tx, transaction.id, transaction.userId, Number(transaction.amount));

    await tx.auditLog.create({
      data: {
        associationId: transaction.associationId,
        actorId: transaction.userId,
        action: AuditAction.PAYMENT_COMPLETED,
        resourceType: 'PaymentTransaction',
        resourceId: transaction.id,
        newValues: {
          razorpayPaymentId: input.razorpayPaymentId,
          amount: Number(transaction.amount),
        },
      },
    });

    return updatedTransaction;
  });
```

- [ ] **Step 2.2.2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors

- [ ] **Step 2.2.3: Commit**

```bash
git add src/features/payments/services/payment.service.ts
git commit -m "refactor: use createAllocations in verifyAndCompletePayment"
```

---

### Task 2.3: Refactor webhook.service.ts to use createAllocations

**Files:**
- Modify: `src/features/payments/services/webhook.service.ts`

- [ ] **Step 2.3.1: Replace inline FIFO loop in verifyAndCompletePaymentFromWebhook**

Add import at the top of `src/features/payments/services/webhook.service.ts`:
```typescript
import { createAllocations } from '@services/allocate-contributions';
```

Replace the entire `verifyAndCompletePaymentFromWebhook` function:

```typescript
async function verifyAndCompletePaymentFromWebhook(
  transactionId: string,
  razorpayPaymentId: string,
) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();

    const transaction = await tx.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.status === 'COMPLETED') {
      return transaction;
    }

    // Mark completed
    const updated = await tx.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId,
        paidAt: now,
        method: 'ONLINE',
      },
    });

    if (!transaction.userId) {
      throw new NotFoundError(`No transaction found for User order: ${razorpayPaymentId}`);
    }

    // Use shared allocation engine
    await createAllocations(tx, transactionId, transaction.userId, Number(transaction.amount));

    // Create ledger entry
    await recordMemberPayment(tx, {
      associationId: transaction.associationId,
      paymentTransactionId: transactionId,
      amount: Number(transaction.amount),
      description: 'Online payment via Razorpay (webhook confirmed)',
      createdById: transaction?.userId || 'N/A',
      method: 'ONLINE',
    });

    // Audit log
    await logAction({
      associationId: transaction.associationId,
      actorId: transaction.userId,
      action: AuditAction.PAYMENT_COMPLETED,
      resourceType: 'PaymentTransaction',
      resourceId: transactionId,
      newValues: {
        razorpayPaymentId,
        source: 'webhook',
        amount: Number(transaction.amount),
      },
    });

    return updated;
  });
}
```

- [ ] **Step 2.3.2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors

- [ ] **Step 2.3.3: Commit**

```bash
git add src/features/payments/services/webhook.service.ts
git commit -m "refactor: use createAllocations in webhook handler"
```
