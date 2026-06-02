# Payment Endpoints Shared Constants Design

**Status:** DRAFT
**Created:** 2026-06-02
**Last Updated:** 2026-06-02

## Purpose
Centralize all payment-related endpoint paths in the shared package to ensure consistency across the backend, web frontend, and mobile app.

## Scope
- Covers: Payments, Razorpay Flow, Contributions, Reports, and Payment Providers.

## Architecture
- **Location:** `packages/shared/src/constants/endpoints/payments.ts`
- **Pattern:** Nested objects for logical grouping (e.g., `PAYMENTS.PROVIDERS.LIST`).

## Data Structure
```typescript
export const PAYMENTS = {
  LIST: '/payments',
  MY: '/payments/my',
  HISTORY: '/payments/history',
  STATS: '/payments/stats',
  DETAIL: (id: string) => `/payments/${id}`,
  RECEIPT: (id: string) => `/payments/${id}/receipt`,
  
  RAZORPAY: {
    CREATE_ORDER: '/payments/order',
    VERIFY: '/payments/verify',
    WEBHOOK: '/payments/webhook',
    RECORD: '/payments/record',
  },

  USERS: {
    BY_ID: (userId: string) => `/payments/users/${userId}`,
    CONTRIBUTIONS: (userId: string) => `/payments/users/${userId}/contributions`,
  },

  CONTRIBUTIONS: {
    LIST: '/payments/contributions',
    GENERATE: '/payments/contributions',
    WAIVE: '/payments/contributions',
    DETAIL: (id: string) => `/payments/contributions/${id}`,
  },

  REPORTS: {
    COLLECTIONS: '/payments/reports/collections',
  },

  PROVIDERS: {
    LIST: '/payments/providers',
    CREATE: '/payments/providers',
    STATUS: '/payments/providers/status',
    DETAIL: (id: string) => `/payments/providers/${id}`,
    UPDATE: (id: string) => `/payments/providers/${id}`,
    DELETE: (id: string) => `/payments/providers/${id}`,
    ACTIVATE: (id: string) => `/payments/providers/${id}/activate`,
    TEST: (id: string) => `/payments/providers/${id}/test`,
    TEST_VERIFY: (id: string) => `/payments/providers/${id}/test/verify`,
  },
} as const;
```

## Integration
1. Create `payments.ts` in `packages/shared/src/constants/endpoints/`.
2. Export `PAYMENTS` from `packages/shared/src/constants/endpoints/index.ts`.
3. Export from main `packages/shared/src/index.ts` if not already covered.
