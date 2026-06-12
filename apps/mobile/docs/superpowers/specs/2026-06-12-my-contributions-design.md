# My Contributions Feature Design

**Date:** 2026-06-12
**Status:** Approved
**App:** Mobile (Expo SDK 54)

## Overview

Replace the "History" tab on the Subscription screen with a "Contributions" tab showing the user's contribution periods filtered by paid, due, and pending future status.

## Data Source

The existing `GET /contributions/my` endpoint (defined in `@repo/shared` as `ENDPOINTS.CONTRIBUTION.MY`) returns contribution periods for the authenticated user:

```ts
interface ContributionPeriod {
  id: string;
  associationId: string;
  userId: string;
  year: number;
  month: number;
  expectedAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'DUE' | 'PAID' | 'PARTIAL' | 'WAIVED';
  dueDate: string;
  waivedAt: string | null;
  waivedReason: string | null;
  createdAt: string;
  updatedAt: string;
  allocations: {
    id: string;
    allocatedAmount: number;
    paymentTransaction: {
      id: string;
      amount: number;
      method: string | null;
      status: string;
      paidAt: string | null;
    };
  }[];
}
```

Supports `?status=` query filter (DUE, PAID, PARTIAL, WAIVED) and pagination.

## Status Mapping

| UI Filter | API `status` | Client-side logic          |
| --------- | ------------ | -------------------------- |
| All       | (none)       | Show everything            |
| Paid      | PAID         | Also include PARTIAL       |
| Due       | DUE          | `dueDate` is past or today |
| Pending   | DUE          | `dueDate` is in the future |

## Feature Structure

```
src/features/contributions/
├── types/
│   ├── contribution-period.types.ts    ← NEW
│   └── index.ts                        ← UPDATE
├── hooks/
│   ├── use-my-contributions.ts         ← NEW
│   └── index.ts                        ← UPDATE
├── components/
│   ├── my-contributions.tsx            ← NEW
│   └── index.ts                        ← UPDATE
```

## Types (`contribution-period.types.ts`)

Extract the `ContributionPeriod` interface matching the API response shape, with a `ContributionStatus` enum re-exported for convenience.

## Hook (`useMyContributions(status?)`)

- Query key: `QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(page, status)`
- Endpoint: `ENDPOINTS.CONTRIBUTION.MY`
- Accepts optional `status` string parameter passed as query param
- Returns `ContributionPeriod[]` with pagination meta

## Component (`MyContributions`)

Replaces `PaymentHistory` on the Subscription screen's "History" tab.

### Summary Cards Row

Four stat cards in a 2x2 grid:

- **Total Paid**: sum of `paidAmount` where status is PAID or PARTIAL
- **Total Due**: sum of `dueAmount` where status is DUE and dueDate is past
- **Pending**: count of contributions where status is DUE and dueDate is future
- **Waived**: sum of expected amounts where status is WAIVED

### Filter Chips

Horizontal row of filter chips below the summary cards:

- All | Paid | Due | Pending

Active chip uses indigo-600 background, inactive uses outline style.

### Contributions List

`FlashList` rendering contribution period items, each showing:

- Month/Year (e.g., "June 2026")
- Expected amount
- Paid amount (if any)
- Status badge (Paid=green, Due=amber/red, Pending=slate, Waived=slate)
- Due date

The user can navigate to the Plan tab to make payments.

### States

- **Loading**: ActivityIndicator spinner
- **Error**: Error message with retry
- **Empty**: "No contributions found" empty state

## Subscription Screen Changes

- Rename "History" tab to "Contributions"
- Update tab icon from `time-outline` to `wallet-outline` (or similar)
- Replace `{activeTab === 'history' && <PaymentHistory />}` with `{activeTab === 'contributions' && <MyContributions />}`
- Update `activeTab` state type from `'plan' | 'history'` to `'plan' | 'contributions'`

## Files Modified

| File                                                            | Change                                 |
| --------------------------------------------------------------- | -------------------------------------- |
| `src/features/contributions/types/contribution-period.types.ts` | Create - ContributionPeriod interface  |
| `src/features/contributions/types/index.ts`                     | Add re-export                          |
| `src/features/contributions/hooks/use-my-contributions.ts`      | Create - data fetching hook            |
| `src/features/contributions/hooks/index.ts`                     | Add re-export                          |
| `src/features/contributions/components/my-contributions.tsx`    | Create - main component                |
| `src/features/contributions/components/index.ts`                | Add re-export                          |
| `src/features/subscription/screens/subscription.screen.tsx`     | Replace History tab with Contributions |
