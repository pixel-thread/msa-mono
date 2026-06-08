# Ledger Balance Transfer Route — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `POST /api/v1/payments/transfer` route that moves a balance from one ledger account to another by creating a balanced double-entry journal entry (debit the source account, credit the destination account).

**Architecture:** The transfer is a thin route handler that validates input via Zod, authorises the caller (FINANCE role), then delegates to a new `transferBalance` service function in `src/shared/services/transfer-balance.ts`. That function reuses the existing `createJournalEntry` helper from the ledger service — which already enforces balanced debits/credits, resolves account codes, and writes idempotent ledger entries — so the transfer is just a two-line journal entry (debit source, credit destination). An audit log is written inside the same Prisma transaction.

**Tech Stack:** Express 5 · TypeScript strict · Prisma ORM · Zod

---

## File Structure

| Action | File                                                     | Responsibility                              |
| ------ | -------------------------------------------------------- | ------------------------------------------- |
| Modify | `src/features/payments/validators/index.ts`              | Add `TransferBalanceSchema` Zod schema      |
| Create | `src/features/payments/routes/transfer-balance.route.ts` | Route handler for `POST /transfer`          |
| Create | `src/shared/services/transfer-balance.ts`                | Add `transferBalance` service function      |
| Modify | `src/features/payments/routes/index.ts`                  | Register the new route                      |
| Modify | `prisma/schema/enums.prisma`                             | Add `LEDGER_TRANSFER` to `AuditAction` enum |

---

## Reference: Existing Patterns & Account Codes

Before you start, orient yourself with these files — they define the patterns every task follows:

- **Route handler pattern:** `src/features/payments/routes/record-payment.route.ts` — `validate()` → `asyncHandler()` → `withRole()` → call service → `success()`.
- **Journal entry creation:** `src/features/ledger/services/accounting.service.ts` — `createJournalEntry()` resolves account codes to IDs, validates balance, and writes idempotently.
- **Shared service pattern:** `src/shared/services/allocate-contributions.ts` — standalone service functions used by multiple features live in `src/shared/services/` and are imported via `@services/`.
- **Chart of accounts seed:** `src/features/ledger/services/seed-chart-of-accounts.ts` — known account codes: `1000` (Bank), `1200` (Cash), `1100` (Accounts Receivable), `2000` (Unearned Revenue), `2100` (Member Deposits), `4000` (Subscription Income), etc.
- **Validator barrel:** `src/features/payments/validators/index.ts` — all payment schemas live here.
- **Route index:** `src/features/payments/routes/index.ts` — route registration order matters (static before parameterised).
- **AuditAction enum:** `prisma/schema/enums.prisma` L189–L226

---

### Task 1: Add `LEDGER_TRANSFER` to the `AuditAction` Enum

**Files:**

- Modify: `prisma/schema/enums.prisma:189-226`

- [ ] **Step 1: Add the enum value**

Open `prisma/schema/enums.prisma` and add `LEDGER_TRANSFER` after `COMPLAINT_UPDATE` (line 223), before the closing `@@map`:

```prisma
enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  CONSENT_GRANT
  CONSENT_REVOKE
  DSAR_SUBMIT
  DSAR_RESPOND
  PAYMENT_RECORD
  SUBSCRIPTION_CHANGE
  ANONYMIZE
  ROLE_CHANGE
  MEETING_ASSIGN
  MEETING_RSVP
  PAYMENT_CREATED
  PAYMENT_COMPLETED
  PAYMENT_FAILED
  PAYMENT_REFUNDED
  PAYMENT_VERIFIED
  PAYMENT_WAIVED
  WEBHOOK_RECEIVED
  REPORT_EXPORTED
  ANNOUNCEMENT_CREATE
  ANNOUNCEMENT_PUBLISH
  ANNOUNCEMENT_DELETE
  ANNOUNCEMENT_READ
  TRAINING_MODULE_CREATE
  TRAINING_MODULE_UPDATE
  TRAINING_COMPLETE
  TRAINING_ASSIGN
  TRAINING_UNASSIGN
  COMPLAINT_CREATE
  COMPLAINT_UPDATE
  LEDGER_TRANSFER

  @@map("audit_action")
}
```

- [ ] **Step 2: Generate Prisma client**

Run:

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client` — no errors. This does NOT create a migration; it only regenerates the TypeScript types. The migration will be created separately after all code changes are done (or as part of your deploy workflow).

- [ ] **Step 3: Commit**

```bash
git add prisma/schema/enums.prisma
git commit -m "feat(ledger): add LEDGER_TRANSFER audit action enum value"
```

---

### Task 2: Add `TransferBalanceSchema` Zod Validator

**Files:**

- Modify: `src/features/payments/validators/index.ts`

- [ ] **Step 1: Add the schema**

Append the following to the end of `src/features/payments/validators/index.ts` (after the `UserPaymentsQuerySchema`):

```typescript
// ---- Transfer Balance Between Ledger Accounts ----

export const TransferBalanceSchema = z
  .object({
    fromAccountId: z.uuid('Invalid source account ID'),
    toAccountId: z.uuid('Invalid destination account ID'),
    amount: z
      .number()
      .positive('Amount must be positive')
      .max(99999999, 'Amount must be less than 99999999'),
    remark: z
      .string()
      .min(5, 'Description must be at least 5 characters')
      .max(500, 'Description must be at most 500 characters'),
  })
  .strict()
  .refine((data) => data.sourceAccountId !== data.destinationAccountId, {
    message: 'Source and destination accounts must be different',
    path: ['destinationAccountId'],
  });
```

- [ ] **Step 2: Verify the file compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors related to the validator file.

- [ ] **Step 3: Commit**

```bash
git add src/features/payments/validators/index.ts
git commit -m "feat(payments): add TransferBalanceSchema validator"
```

---

### Task 3: Move `createJournalEntry` & `record*` Functions to Shared Services

`createJournalEntry` and the `record*` helper functions (`recordMemberPayment`, `recordRefund`, `recordExpense`, `recordWaiver`) are used by multiple features (payments, contributions, and the new transfer route). Move them to `src/shared/services/accounting.ts` and have the ledger file re-export for backward compatibility.

**Files:**

- Create: `src/shared/services/accounting.ts`
- Modify: `src/features/ledger/services/accounting.service.ts`

- [ ] **Step 1: Create shared accounting service**

Create `src/shared/services/accounting.ts` with all the content from `src/features/ledger/services/accounting.service.ts` — the `JournalLine` / `CreateEntryOptions` types, `createJournalEntry`, `recordMemberPayment`, `recordRefund`, `recordExpense`, and `recordWaiver` — exactly as-is. Imports remain the same (`@errors`, `@prisma/client`).

```typescript
import { BadRequestError, NotFoundError } from '@errors';
import type { PaymentMethod, Prisma } from '@prisma/client';
import { ApprovalStatus } from '@prisma/client';

export interface JournalLine {
  accountCode: string;
  isDebit: boolean;
  amount: number;
}

export interface CreateEntryOptions {
  associationId: string;
  paymentTransactionId?: string;
  description: string;
  createdById: string;
  autoApprove?: boolean;
  approvedById?: string;
  lines: JournalLine[];
}

async function getAccountByCode(tx: Prisma.TransactionClient, associationId: string, code: string) {
  const account = await tx.account.findFirst({
    where: { associationId, code, isActive: true },
  });
  if (!account) throw new NotFoundError(`Account not found: ${code}`);
  return account;
}

function validateBalance(lines: { amount: number; isDebit: boolean }[]) {
  const totalDebits = lines.filter((l) => l.isDebit).reduce((s, l) => s + l.amount, 0);
  const totalCredits = lines.filter((l) => !l.isDebit).reduce((s, l) => s + l.amount, 0);
  if (Math.abs(totalDebits - totalCredits) > 0.001) {
    throw new BadRequestError(`Unbalanced entry: debits=${totalDebits}, credits=${totalCredits}`);
  }
}

export async function createJournalEntry(
  tx: Prisma.TransactionClient,
  options: CreateEntryOptions,
) {
  const {
    associationId,
    paymentTransactionId,
    description,
    createdById,
    autoApprove = false,
    approvedById,
    lines,
  } = options;

  // 1. Resolve account codes to IDs
  const resolvedLines = await Promise.all(
    lines.map(async (line) => {
      const account = await getAccountByCode(tx, associationId, line.accountCode);
      return {
        accountId: account.id,
        isDebit: line.isDebit,
        amount: line.amount,
        associationId,
      };
    }),
  );

  // 2. Validate balance
  validateBalance(resolvedLines);

  // 3. Check for existing (idempotency)
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

  // 4. Write to DB
  return tx.ledgerEntry.create({
    data: {
      paymentTransactionId: paymentTransactionId ?? null,
      description,
      approvalStatus: autoApprove ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
      createdById,
      approvedById: autoApprove ? (approvedById ?? 'system') : null,
      lines: {
        create: resolvedLines,
      },
    },
    include: { lines: true },
  });
}

export async function recordMemberPayment(
  tx: Prisma.TransactionClient,
  opts: {
    associationId: string;
    paymentTransactionId: string;
    amount: number;
    description: string;
    createdById: string;
    method: PaymentMethod | string | null;
  },
) {
  const isCash = opts.method === 'CASH';
  const debitCode = isCash ? '1200' : '1000';
  return createJournalEntry(tx, {
    associationId: opts.associationId,
    paymentTransactionId: opts.paymentTransactionId,
    description: opts.description,
    createdById: opts.createdById,
    autoApprove: true,
    lines: [
      { accountCode: debitCode, isDebit: true, amount: opts.amount },
      { accountCode: '4000', isDebit: false, amount: opts.amount },
    ],
  });
}

export async function recordRefund(
  tx: Prisma.TransactionClient,
  opts: {
    associationId: string;
    paymentTransactionId: string;
    amount: number;
    description: string;
    createdById: string;
  },
) {
  return createJournalEntry(tx, {
    associationId: opts.associationId,
    paymentTransactionId: opts.paymentTransactionId,
    description: `REFUND - ${opts.description}`,
    createdById: opts.createdById,
    autoApprove: true,
    lines: [
      { accountCode: '4000', isDebit: true, amount: opts.amount },
      { accountCode: '1000', isDebit: false, amount: opts.amount },
    ],
  });
}

export async function recordExpense(
  tx: Prisma.TransactionClient,
  opts: {
    associationId: string;
    amount: number;
    description: string;
    expenseAccountCode: string;
    createdById: string;
  },
) {
  return createJournalEntry(tx, {
    associationId: opts.associationId,
    description: opts.description,
    createdById: opts.createdById,
    autoApprove: false,
    lines: [
      { accountCode: opts.expenseAccountCode, isDebit: true, amount: opts.amount },
      { accountCode: '1000', isDebit: false, amount: opts.amount },
    ],
  });
}

export async function recordWaiver(
  tx: Prisma.TransactionClient,
  opts: {
    associationId: string;
    amount: number;
    memberId: string;
    period: string;
    approvedById: string;
  },
) {
  return createJournalEntry(tx, {
    associationId: opts.associationId,
    description: `Dues waiver - ${opts.memberId} - ${opts.period}`,
    createdById: opts.approvedById,
    autoApprove: true,
    approvedById: opts.approvedById,
    lines: [
      { accountCode: '5100', isDebit: true, amount: opts.amount },
      { accountCode: '1100', isDebit: false, amount: opts.amount },
    ],
  });
}
```

- [ ] **Step 2: Update ledger accounting.service.ts to re-export**

Replace the entire content of `src/features/ledger/services/accounting.service.ts` with a single re-export:

```typescript
// Re-exported from shared services — all features should import from @services/accounting
export {
  JournalLine,
  CreateEntryOptions,
  createJournalEntry,
  recordMemberPayment,
  recordRefund,
  recordExpense,
  recordWaiver,
} from '@services/accounting';
```

This preserves backward compatibility for existing importers (payments, contributions) — they can migrate to `@services/accounting` at their own pace.

- [ ] **Step 3: Verify the files compile**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/services/accounting.ts src/features/ledger/services/accounting.service.ts
git commit -m "refactor(shared): move createJournalEntry and record* functions to shared services"
```

---

### Task 4: Add `transferBalance` Service Function

`transferBalance` is used by multiple features (payments route, future admin routes), so it lives in shared services following the pattern of `allocate-contributions.ts`. It imports `createJournalEntry` from the now-shared `@services/accounting`.

**Files:**

- Create: `src/shared/services/transfer-balance.ts`

- [ ] **Step 1: Create the service file**

Create `src/shared/services/transfer-balance.ts`:

```typescript
import { createJournalEntry } from '@services/accounting';
import { NotFoundError } from '@errors';
import type { Prisma } from '@prisma/client';

/**
 * Transfer balance between two ledger accounts.
 *
 * Creates a balanced journal entry: debit the source account, credit the
 * destination account. Both accounts must exist, be active, and belong
 * to the same association.
 *
 * The entry is created with PENDING approval status — a PRESIDENT must
 * approve it before it affects account balances.
 *
 * @param tx - Prisma transaction client
 * @param opts - Transfer options
 * @returns The created ledger entry with lines
 */
export async function transferBalance(
  tx: Prisma.TransactionClient,
  opts: {
    associationId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    description: string;
    createdById: string;
  },
) {
  // 1. Verify both accounts exist, are active, and belong to this association
  const [sourceAccount, destinationAccount] = await Promise.all([
    tx.account.findFirst({
      where: { id: opts.sourceAccountId, associationId: opts.associationId, isActive: true },
    }),
    tx.account.findFirst({
      where: { id: opts.destinationAccountId, associationId: opts.associationId, isActive: true },
    }),
  ]);

  if (!sourceAccount) {
    throw new NotFoundError(`Source account not found or inactive: ${opts.sourceAccountId}`);
  }
  if (!destinationAccount) {
    throw new NotFoundError(
      `Destination account not found or inactive: ${opts.destinationAccountId}`,
    );
  }

  // 2. Create balanced journal entry using account codes
  //    autoApprove is false — transfers require PRESIDENT approval (two-person rule)
  return createJournalEntry(tx, {
    associationId: opts.associationId,
    description: opts.description,
    createdById: opts.createdById,
    autoApprove: false,
    lines: [
      { accountCode: sourceAccount.code, isDebit: true, amount: opts.amount },
      { accountCode: destinationAccount.code, isDebit: false, amount: opts.amount },
    ],
  });
}
```

- [ ] **Step 2: Verify the file compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors related to `transfer-balance.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/shared/services/transfer-balance.ts
git commit -m "feat(shared): add transferBalance service function"
```

---

### Task 5: Create the Transfer Balance Route Handler

**Files:**

- Create: `src/features/payments/routes/transfer-balance.route.ts`

- [ ] **Step 1: Create the route handler file**

Create `src/features/payments/routes/transfer-balance.route.ts` with this content:

```typescript
// ---------------------------------------------------------------------------
// ENDPOINT:  POST /api/v1/payments/transfer
// SECURITY:  Requires FINANCE role
// PURPOSE:   Transfer balance from one ledger account to another by creating
//            a balanced double-entry journal entry. The entry is created with
//            PENDING approval status and requires PRESIDENT approval.
// ---------------------------------------------------------------------------

import { transferBalance } from '@services/transfer-balance';
import { TransferBalanceSchema } from '@feature/payments/validators';
import { prisma } from '@lib/prisma';
import { validate } from '@lib/validate';
import { AuditAction, UserRole } from '@prisma/client';
import { logAction } from '@services/audit-logs';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

export const postTransferBalance: RequestHandler[] = [
  // Step 1: Validate request body
  validate({ body: TransferBalanceSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId }, 'POST /api/v1/payments/transfer - Request started');

    // --- Auth: enforce FINANCE role ---
    const user = await withRole(req, UserRole.FINANCE);
    logger.info({ traceId, userId: user.id }, 'POST /api/v1/payments/transfer - User authorized');

    // --- Business logic: transfer balance inside a transaction ---
    const { sourceAccountId, destinationAccountId, amount, description } = req.body;

    const entry = await prisma.$transaction(async (tx) => {
      const ledgerEntry = await transferBalance(tx, {
        associationId: req.user!.associationId,
        sourceAccountId,
        destinationAccountId,
        amount,
        description,
        createdById: user.id,
      });

      // --- Audit log ---
      await logAction({
        associationId: req.user!.associationId,
        actorId: user.id,
        action: AuditAction.LEDGER_TRANSFER,
        resourceType: 'LedgerEntry',
        resourceId: ledgerEntry.id,
        newValues: {
          sourceAccountId,
          destinationAccountId,
          amount,
          description,
        },
      });

      return ledgerEntry;
    });

    // --- Log: success ---
    logger.info({ traceId, entryId: entry.id }, 'POST /api/v1/payments/transfer - Success');

    // --- Response ---
    return success(
      res,
      { data: entry, message: 'Balance transfer recorded successfully. Pending approval.' },
      201,
    );
  }),
];
```

- [ ] **Step 2: Verify the file compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors related to `transfer-balance.route.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/features/payments/routes/transfer-balance.route.ts
git commit -m "feat(payments): add POST /transfer balance transfer route handler"
```

---

### Task 6: Register the Route in the Payments Router

**Files:**

- Modify: `src/features/payments/routes/index.ts`

- [ ] **Step 1: Add the import**

Add this import after the existing `recordPayment` import (around line 34):

```typescript
import { postTransferBalance } from './transfer-balance.route';
```

- [ ] **Step 2: Register the route**

Add the route registration after `router.post('/record', recordPayment);` (line 61) and before the User-Specific section comment:

```typescript
router.post('/transfer', postTransferBalance);
```

The relevant section of the file should look like this after the change:

```typescript
// ===========================================================================
// Razorpay Flow
// ===========================================================================

router.post('/order', createOrder);
router.post('/verify', verifyPayment);
router.post('/record', recordPayment);
router.post('/transfer', postTransferBalance);

// ===========================================================================
// User-Specific
// ===========================================================================
```

- [ ] **Step 3: Verify the file compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/payments/routes/index.ts
git commit -m "feat(payments): register POST /transfer route in payments router"
```

---

### Task 7: Create Prisma Migration

**Files:**

- Creates: `prisma/migrations/<timestamp>_add_ledger_transfer_audit_action/migration.sql`

- [ ] **Step 1: Create the migration**

Run:

```bash
npx prisma migrate dev --name add_ledger_transfer_audit_action
```

Expected: Migration created and applied successfully. The SQL will contain an `ALTER TYPE "audit_action" ADD VALUE 'LEDGER_TRANSFER';` statement.

- [ ] **Step 2: Verify migration applied**

Run:

```bash
npx prisma migrate status
```

Expected: All migrations applied, no pending migrations.

- [ ] **Step 3: Commit**

```bash
git add prisma/migrations/
git commit -m "chore(prisma): add migration for LEDGER_TRANSFER audit action"
```

---

### Task 8: Manual Smoke Test

- [ ] **Step 1: Start the dev server**

Run:

```bash
npm run dev
```

Expected: Server starts without errors.

- [ ] **Step 2: Test the endpoint with valid data**

Using `curl` or your API client, send a POST request. You'll need:

- A valid auth token (login as a FINANCE user first)
- Two valid account IDs from the `accounts` table for your association

```bash
curl -X POST http://localhost:<PORT>/api/v1/payments/transfer \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-auth-cookie>" \
  -d '{
    "sourceAccountId": "<VALID_SOURCE_ACCOUNT_UUID>",
    "destinationAccountId": "<VALID_DEST_ACCOUNT_UUID>",
    "amount": 500,
    "description": "Transfer from bank to cash for petty cash replenishment"
  }'
```

Expected: `201 Created` with a response body containing the ledger entry with two lines (one debit, one credit), and `approvalStatus: "PENDING"`.

- [ ] **Step 3: Test validation — same account**

```bash
curl -X POST http://localhost:<PORT>/api/v1/payments/transfer \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-auth-cookie>" \
  -d '{
    "sourceAccountId": "<SAME_UUID>",
    "destinationAccountId": "<SAME_UUID>",
    "amount": 500,
    "description": "This should fail"
  }'
```

Expected: `400 Bad Request` — "Source and destination accounts must be different".

- [ ] **Step 4: Test validation — negative amount**

```bash
curl -X POST http://localhost:<PORT>/api/v1/payments/transfer \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-auth-cookie>" \
  -d '{
    "sourceAccountId": "<VALID_SOURCE_ACCOUNT_UUID>",
    "destinationAccountId": "<VALID_DEST_ACCOUNT_UUID>",
    "amount": -100,
    "description": "This should also fail"
  }'
```

Expected: `400 Bad Request` — "Amount must be positive".

- [ ] **Step 5: Test authorization — MEMBER role**

Login as a MEMBER user and attempt the same request.

Expected: `403 Forbidden` — "Permission denied".
