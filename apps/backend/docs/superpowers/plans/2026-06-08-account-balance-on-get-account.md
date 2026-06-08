# Account Balance on GET Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `GET /api/ledger/accounts/:id` to use the lightweight `accountBalance()` service instead of the heavy `trialBalance()` and `incomeStatement()` report functions.

**Architecture:** The `getAccountHandler` currently calls `trialBalance()` and `incomeStatement()` — full report functions designed for the `/reports/` endpoints. A dedicated `accountBalance()` service already exists in `reports.service.ts` that queries a single account's debits/credits/balance in one groupBy. This plan swaps the heavy calls for the light one and flattens the response shape.

**Tech Stack:** Express, Prisma, TypeScript

---

## File Structure

| File                                              | Change                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/features/ledger/routes/accounts.route.ts`    | Swap import and replace handler body — 2 lines import change, ~10 lines handler change |
| `src/features/ledger/services/reports.service.ts` | No change needed — `accountBalance()` already exists at line 133                       |

---

### Task 1: Refactor `getAccountHandler` to use `accountBalance`

**Files:**

- Modify: `src/features/ledger/routes/accounts.route.ts:38` (import line)
- Modify: `src/features/ledger/routes/accounts.route.ts:275-290` (handler body)

- [ ] **Step 1: Swap imports**

Replace the `incomeStatement, trialBalance` import from reports.service with `accountBalance`:

```typescript
// Before (line 38):
import { incomeStatement, trialBalance } from '../services/reports.service';

// After:
import { accountBalance } from '../services/reports.service';
```

- [ ] **Step 2: Replace handler body**

In `getAccountHandler`, replace the two report function calls and merged response with a single `accountBalance()` call:

```typescript
// Before (lines 275-290):
const trailBalance = await trialBalance(req.user!.associationId, accountId as string);
const incomeStatementReport = await incomeStatement(
  req.user!.associationId,
  undefined,
  undefined,
  accountId as string,
);

const dataWithReport = {
  ...existingAccount,
  report: {
    trailBalance,
    incomeStatement: incomeStatementReport,
  },
};
return success(res, { data: dataWithReport, message: 'Ledger Account Updated' });

// After:
const balance = await accountBalance(req.user!.associationId, accountId);

return success(res, { data: { ...existingAccount, balance } });
```

- [ ] **Step 3: Verify it compiles**

Run: `NODE_OPTIONS='--experimental-vm-modules' npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/ledger/routes/accounts.route.ts
git commit -m "refactor: use accountBalance for GET ledger account endpoint"
```
