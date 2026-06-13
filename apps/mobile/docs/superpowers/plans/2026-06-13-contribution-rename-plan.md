# Contribution Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename "Subscription" feature to "Contribution", move payment infrastructure, add per-row Pay button, create new screen.

**Architecture:** Move payment hooks/types/components from `subscription/` to `contributions/`, then create a new `MyContributionsScreen` with two tabs (Contributions + History). Each DUE/PARTIAL contribution row gets a Pay Now button that sends `contributionPeriodId` to `POST /payments/order`.

**Tech Stack:** Expo Router, TanStack React Query, React Native, Razorpay

---

### Task 1: Move payment infrastructure to contributions feature

**Files to copy:**

- Copy: `src/features/subscription/hooks/use-payment-order.ts` → `src/features/contributions/hooks/use-payment-order.ts` (UPDATE to accept `contributionPeriodId`)
- Copy: `src/features/subscription/hooks/use-verify-payment.ts` → `src/features/contributions/hooks/use-verify-payment.ts`
- Copy: `src/features/subscription/hooks/use-payment-history.ts` → `src/features/contributions/hooks/use-payment-history.ts`
- Copy: `src/features/subscription/types/payment.ts` → `src/features/contributions/types/payment.ts`
- Copy: `src/features/subscription/types/razorpay.ts` → `src/features/contributions/types/razorpay.ts`
- Copy: `src/features/subscription/components/payment-history.component.tsx` → `src/features/contributions/components/payment-history.component.tsx`
- Copy: `src/features/subscription/components/transaction-list-item.component.tsx` → `src/features/contributions/components/transaction-list-item.component.tsx`
- Copy: `src/features/subscription/components/pay-button.tsx` → `src/features/contributions/components/pay-contribution-button.tsx` (new name, updated)
- Copy: `src/features/subscription/types/payment.ts` only re-exports needed for invoice types

**Files to update:**

- Modify: `src/features/contributions/types/index.ts` — add payment exports
- Modify: `src/features/contributions/hooks/index.ts` — add payment hook exports
- Modify: `src/features/contributions/components/index.ts` — add component exports
- Modify: `src/features/invoice/types/invoice.types.ts` — update import path

**Key changes in `use-payment-order.ts`:**

- mutationFn should accept `contributionPeriodId: string` parameter
- POST body should be `{ contributionPeriodId }` instead of `{}`
- Query key invalidation should include contributions keys on success

**Key changes in `pay-contribution-button.tsx` (new component):**

- Props: `{ contributionPeriodId: string; expectedAmount: number; dueAmount: number; status: ContributionStatus; onSuccess?: () => void }`
- Shows "Pay Now" for DUE/PARTIAL status, hidden for PAID/WAIVED
- On press: `createPaymentOrder(contributionPeriodId)` → Razorpay checkout → verifyPayment → invalidate queries → call onSuccess
- Rate limited (1 per 10s)
- Disabled during processing
- Uses `usePaymentProviderStatus` to check if payment provider is active

- [ ] **Step 1: Copy payment types to contributions and update exports**
  - Copy `payment.ts` and `razorpay.ts` to `contributions/types/`
  - Update `contributions/types/index.ts` to export them
  - Update `invoice/types/invoice.types.ts` import path

- [ ] **Step 2: Copy payment hooks to contributions and update `use-payment-order.ts`**
  - Copy 3 hook files to `contributions/hooks/`
  - Update `use-payment-order.ts` mutationFn to accept `contributionPeriodId`
  - Update `useVerifyPayment` to invalidate contributions query keys
  - Update `contributions/hooks/index.ts` exports

- [ ] **Step 3: Copy payment components to contributions**
  - Copy `payment-history.component.tsx` and `transaction-list-item.component.tsx` to `contributions/components/`
  - Update import paths in moved files
  - Update `contributions/components/index.ts` exports

- [ ] **Step 4: Create PayContributionButton component**
  - Create `contributions/components/pay-contribution-button.tsx`
  - Props: `contributionPeriodId`, `expectedAmount`, `dueAmount`, `status`, `onSuccess?`
  - Full Razorpay payment flow with rate limiting
  - Only visible for DUE/PARTIAL statuses

- [ ] **Step 5: Update subscription/index.ts to re-export from contributions**
  - Update hooks, types, components re-exports to point to contributions
  - Keeps backward compat while old files still exist

---

### Task 2: Add Pay button to MyContributions + create MyContributionsScreen + route + cleanup

**Files to create:**

- Create: `src/features/contributions/screens/my-contributions.screen.tsx` — two-tab screen
- Create: `src/app/(protected)/contribution/my/index.tsx` — route wrapper

**Files to modify:**

- Modify: `src/features/contributions/components/my-contributions.tsx` — add Pay button to rows
- Modify: `src/features/contributions/screens/index.ts` — export new screen
- Modify: `src/shared/constants/drawer.ts` — rename Subscription to Contribution

**Files to delete:**

- Delete: `src/features/subscription/` entire folder
- Delete: `src/app/(protected)/subscription/` entire folder

**MyContributions screen layout:**

- Container + StackHeader("Contribution") + showBackButton
- Two tabs: "Contributions" and "History"
- Contributions tab: existing MyContributions component (now with Pay buttons)
- History tab: existing PaymentHistory component

**Route file (`contribution/my/index.tsx`):**

- Import MyContributionsScreen from contributions feature
- Expo Go check (same pattern as old subscription route)
- Export default

**MyContributions edits:**

- Add `PayContributionButton` to each `ContributionRow` where status is DUE or PARTIAL
- Show the button aligned right, below the status badge
- Pass `item.id` as `contributionPeriodId`

**Drawer updates:**

- Change label from "Subscription" to "Contribution"
- Change href from `/subscription` to `/(protected)/contribution/my`

**Delete old files:**

- `src/features/subscription/` folder and all contents
- `src/app/(protected)/subscription/` folder and all contents (only index.tsx)

- [ ] **Step 1: Update MyContributions to add Pay button per row**

- [ ] **Step 2: Create MyContributionsScreen with two tabs**

- [ ] **Step 3: Create route `contribution/my/index.tsx`**

- [ ] **Step 4: Update drawer config**

- [ ] **Step 5: Delete old subscription feature and route**

- [ ] **Step 6: Verify the app builds successfully**
      Run: `npx tsc --noEmit` and fix any type errors
      Run: `npx expo export --platform web --output-dir /tmp/expo-check 2>&1 || true` to verify Metro bundling
