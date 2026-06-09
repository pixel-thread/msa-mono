# Manual Payment — Income Account Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the finance user to select which income account a manual payment credits, instead of always hardcoding Subscription Income (4000).

**Architecture:** The frontend `RecordPaymentDialog` gets a new "Income Account" dropdown populated from `useLedgerAccounts()` filtered to INCOME type. On submit it sends `incomeAccountId` alongside existing fields. The backend validator accepts the UUID, `recordManualPayment` resolves the account to its code inside the existing Prisma transaction, and passes it to `recordMemberPayment`. The function signature gains an optional `incomeAccountCode` parameter defaulting to `'4000'` for backward compatibility (online Razorpay payments remain unchanged).

**Tech Stack:** React 19 · shadcn/ui · Zod · TypeScript strict · Express 5 · Prisma ORM

---

## File Structure

| Action | File                                                                  | Responsibility                                                                     |
| ------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Modify | `apps/web/src/features/payments/validators/index.ts`                  | Add `incomeAccountId` to `RecordManualPaymentSchema`                               |
| Modify | `apps/web/src/features/payments/components/record-payment-dialog.tsx` | Add income account dropdown + pass `incomeAccountId`                               |
| Modify | `apps/backend/src/features/payments/validators/index.ts`              | Add `incomeAccountId` to backend `RecordManualPaymentSchema`                       |
| Modify | `apps/backend/src/features/payments/services/payment.service.ts`      | Accept `incomeAccountId`, resolve account code, pass to `recordMemberPayment`      |
| Modify | `apps/backend/src/shared/services/accounting.ts`                      | Accept optional `incomeAccountCode` in `RecordMemberPaymentOpts`, default `'4000'` |

---

## Reference: Existing Patterns

- **Income accounts already exist in the chart of accounts seed:** `src/features/ledger/services/seed-chart-of-accounts.ts` — `4000` (Subscription Income), `4100` (Event Fee Income), `4200` (Donation Income), `4300` (Bank Interest). All have `type: 'INCOME'`.
- **Account selector pattern:** `apps/web/src/features/payments/components/transfer-payment-dialog.tsx` — uses `useLedgerAccounts()` with `<Select>` for account dropdowns.
- **Account type filtering:** The `Account` type has a `type` field (`'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'`). Frontend filters `accounts.filter(a => a.type === 'INCOME')`.
- **`recordMemberPayment` callers:** Three callers total — `recordManualPayment` (manual), `verifyAndCompletePayment` (online Razorpay), `verifyAndCompletePaymentFromWebhook` (webhook). The latter two should keep defaulting to `'4000'`.

---

### Task 1: Update Frontend Validator — Add `incomeAccountId`

**Files:**

- Modify: `apps/web/src/features/payments/validators/index.ts:27-33`

- [ ] **Step 1: Add `incomeAccountId` field**

Add `incomeAccountId` as a required UUID field after `referenceNumber`:

```typescript
export const RecordManualPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(PaymentMethod).default(PaymentMethod.CASH),
  notes: z.string(),
  receiptNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  incomeAccountId: z.string().min(1, 'Please select an income account'),
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors.

---

### Task 2: Update Frontend Dialog — Add Income Account Dropdown

**Files:**

- Modify: `apps/web/src/features/payments/components/record-payment-dialog.tsx`

- [ ] **Step 1: Add the `useLedgerAccounts` import**

Add the import after the existing hooks:

```typescript
import { useLedgerAccounts } from '@hooks/useLedgerAccounts';
```

- [ ] **Step 2: Fetch accounts in the component**

Add the hook call inside the component, after `const queryClient = useQueryClient();`:

```typescript
const { accounts } = useLedgerAccounts();
const incomeAccounts = accounts.filter((a) => a.type === 'INCOME');
```

- [ ] **Step 3: Add the income account form field**

Add after the `referenceNumber` field (line 174) and before the `DialogFooter`:

```typescript
            <FormField
              control={form.control}
              name="incomeAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Account *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select income account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incomeAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
```

- [ ] **Step 4: Add default value for the new field**

Update the `defaultValues` to include `incomeAccountId`:

```typescript
defaultValues: {
  amount: 0,
  notes: '',
  receiptNumber: '',
  referenceNumber: '',
  method: 'CASH',
  incomeAccountId: '',
},
```

- [ ] **Step 5: Verify TypeScript compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors.

---

### Task 3: Update Backend Validator — Add `incomeAccountId`

**Files:**

- Modify: `apps/backend/src/features/payments/validators/index.ts:24-36`

- [ ] **Step 1: Add `incomeAccountId` to the schema**

```typescript
export const RecordManualPaymentSchema = z
  .object({
    notes: z.string("Notes/Remark can't be empty").min(10, 'Remark should be atleast 10 character'),
    amount: z
      .number()
      .positive('Amount must be positive')
      .min(1, 'Amount is required')
      .max(99999999, 'Amount must be less than 99999999'),
    method: z.enum(PaymentMethod, 'Invalid payment method').default(PaymentMethod.CASH),
    receiptNumber: z.string("Receipt number can't be empty").optional(),
    referenceNumber: z.string("Reference number can't be empty").optional(),
    incomeAccountId: z.uuid('Invalid income account ID'),
  })
  .strict();
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors.

---

### Task 4: Update `RecordMemberPaymentOpts` — Accept Optional `incomeAccountCode`

**Files:**

- Modify: `apps/backend/src/shared/services/accounting.ts:96-103`

- [ ] **Step 1: Add `incomeAccountCode` to the options type**

```typescript
type RecordMemberPaymentOpts = {
  associationId: string;
  paymentTransactionId: string;
  amount: number;
  description: string;
  createdById: string;
  method: PaymentMethod | string | null;
  incomeAccountCode?: string;
};
```

- [ ] **Step 2: Use it instead of hardcoded `'4000'`**

Change the credit line in `recordMemberPayment` to use the optional parameter with a default:

```typescript
return createJournalEntry(tx, {
  associationId: opts.associationId,
  paymentTransactionId: opts.paymentTransactionId,
  description: opts.description,
  createdById: opts.createdById,
  autoApprove: true,
  lines: [
    { accountCode: debitCode, isDebit: true, amount: opts.amount },
    { accountCode: opts.incomeAccountCode ?? '4000', isDebit: false, amount: opts.amount },
  ],
});
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors.

---

### Task 5: Update `recordManualPayment` — Resolve and Pass Income Account Code

**Files:**

- Modify: `apps/backend/src/features/payments/services/payment.service.ts:46-56, 497-530`

- [ ] **Step 1: Add `incomeAccountId` to the input type**

```typescript
export interface RecordManualPaymentInput {
  associationId: string;
  userId?: string | null;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  receiptNumber?: string;
  referenceNumber?: string;
  /** The user who recorded this payment (finance/admin). */
  createdById: string;
  incomeAccountId: string;
}
```

- [ ] **Step 2: Look up the account code and pass it to `recordMemberPayment`**

Inside `recordManualPayment`, after creating the transaction, resolve the income account and pass its code:

```typescript
// Look up income account code
const incomeAccount = await tx.account.findUnique({
  where: { id: input.incomeAccountId },
});
if (!incomeAccount) {
  throw new NotFoundError(`Income account not found: ${input.incomeAccountId}`);
}

// Create ledger entry
await recordMemberPayment(tx, {
  associationId: input.associationId,
  paymentTransactionId: transaction.id,
  amount: input.amount,
  description: `Manual payment (${input.method}) recorded by finance`,
  createdById: input.createdById,
  method: input.method,
  incomeAccountCode: incomeAccount.code,
});
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: No errors.

---

### Task 6: Verify Everything Works End-to-End

- [ ] **Step 1: Start both servers**

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

- [ ] **Step 2: Open the Record Payment dialog**

Navigate to the payments section and open the Record Manual Payment dialog.

Expected: The form now has a required "Income Account" dropdown showing only INCOME-type accounts (Subscription Income, Event Fee Income, Donation Income, Bank Interest).

- [ ] **Step 3: Submit a manual payment**

Select Cash as method, enter an amount, select an income account (e.g., "Event Fee Income (4100)"), and submit.

Expected: `201 Created` response. Check `/api/ledger/accounts` — the cash account should have increased (debit), and the selected income account should have increased (credit).
