# Design Spec: Subscription Payment History and User Details

**Date:** 2026-05-11
**Status:** DRAFT
**Feature:** Subscription Payment History
**PRD Reference:** N/A (User Directive)

## 1. Overview
The goal is to enhance the Subscription screen by adding detailed user information and a comprehensive payment history with a full audit trail. The layout will be updated to a tabbed interface to maintain clarity as the data complexity increases.

## 2. User Experience (UX)

### 2.1 User Profile Header
A persistent header at the top of the Subscription screen will display:
- User Name
- User Email
- User ID (from `useAuthStore`)

### 2.2 Tabbed Navigation
The screen will use a two-tab system:
1. **Plan Tab**: Displays the current active subscription plan details and the payment action button.
2. **History Tab**: Displays billing statistics and a detailed list of past transactions.

### 2.3 Payment History (History Tab)
- **Billing Statistics Grid**: A quick-glance section showing:
  - Total Paid
  - Total Due
  - Overdue Months
  - Paid/Partial/Waived Months counts
- **Audit Trail List**: A scrollable list of all transactions.
  - **Visible by default**: Date, Amount, Currency, and Status (PAID, PENDING, FAILED).
  - **Detailed view**: "Created By" user info and Allocation breakdown (showing which months/periods the payment covered).

## 3. Technical Design

### 3.1 Components
- `SubscriptionScreen` (src/features/subscription/screens/subscription.screen.tsx):
  - Refactored to include `UserProfileHeader` and a tab view.
  - Uses `useSubscriptionPlans` for the "Plan" tab.
- `UserProfileHeader` (New component):
  - Fetches user data from `useAuthStore`.
- `PaymentHistory` (New component: src/features/subscription/components/payment-history.component.tsx):
  - Uses `usePaymentHistory` hook.
  - Renders the Billing Stats Grid and Transaction List.
- `TransactionListItem` (New sub-component):
  - Handles the rendering of individual transactions and their expanded audit trail details.

### 3.2 Data Flow
- **User Identity**: `useAuthStore` (existing)
- **Active Plan**: `useSubscriptionPlans` (existing)
- **History & Stats**: `usePaymentHistory` (existing hook using `/payments/history` endpoint)
  - Hook returns `PaymentHistory` type containing `transactions` and `summary`.

### 3.3 Types
The existing `Transaction` and `PaymentSummary` types in `src/features/subscription/types/payment.ts` already cover the required fields:
- `Transaction`: `id`, `amount`, `currency`, `status`, `paymentDate`, `createdById`, `allocations`.
- `PaymentSummary`: `totalExpected`, `totalPaid`, `totalDue`, `overdueMonths`, etc.

## 4. Error Handling & Loading
- Standard `ActivityIndicator` for loading states on both tabs.
- `ErrorScreen` for fetch failures with a retry option.
- `ErrorBoundary` wrapper for the entire screen.

## 5. Visual Standards
- Follow existing Tailwind/NativeWind patterns.
- Use Indigo-600 as the primary brand color for active states and buttons.
- Use Slate-900/Slate-100 for dark mode compatibility.
