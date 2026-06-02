# Payment Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `PAYMENTS` endpoint constants to `@repo/shared` for centralized payment route management.

**Architecture:** Use a nested object structure in a new `payments.ts` file and export it through the central `ENDPOINTS` constant.

**Tech Stack:** TypeScript.

---

### Task 1: Create Payment Endpoints File

**Files:**
- Create: `packages/shared/src/constants/endpoints/payments.ts`

- [ ] **Step 1: Create the payments.ts file with all nested constants**

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

- [ ] **Step 2: Commit file creation**

```bash
git add packages/shared/src/constants/endpoints/payments.ts
git commit -m "feat(shared): add payment endpoint constants"
```

---

### Task 2: Register Endpoints in Index

**Files:**
- Modify: `packages/shared/src/constants/endpoints/index.ts`

- [ ] **Step 1: Import and add PAYMENTS to ENDPOINTS**

```typescript
// packages/shared/src/constants/endpoints/index.ts
import { PAYMENTS } from './payments';
// ... existing imports

export const ENDPOINTS = {
  // ... existing endpoints
  PAYMENTS,
} as const;
```

- [ ] **Step 2: Commit index update**

```bash
git add packages/shared/src/constants/endpoints/index.ts
git commit -m "feat(shared): export payment endpoints from central constants"
```

---

### Task 3: Verification

**Files:**
- N/A

- [ ] **Step 1: Run type-check to ensure no regressions**

Run: `cd packages/shared && pnpm type-check`
Expected: PASS

- [ ] **Step 2: Verify exports**

Run: `cat packages/shared/src/constants/endpoints/index.ts`
Expected: `PAYMENTS` is imported and included in `ENDPOINTS`.
