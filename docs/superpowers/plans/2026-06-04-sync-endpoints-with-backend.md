# Sync Endpoints Constants With Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync all `@packages/shared/src/constants/endpoints/` files to match actual backend routes in `@apps/backend/src/features/`.

**Architecture:** Audit backend routes per feature, then update shared constants — remove stale entries, add missing entries, create new files for features not yet represented.

**Tech Stack:** TypeScript, Shared Package

---

### Task 1: Remove stale entries from payments.ts

The `USERS.CONTRIBUTIONS` and the entire `CONTRIBUTIONS` sub-object are stale — contributions were moved to their own feature module with paths under `/contributions/` not `/payments/contributions/`.

**Files:**
- Modify: `packages/shared/src/constants/endpoints/payments.ts`

- [ ] **Step 1: Remove CONTRIBUTIONS sub-object and USERS.CONTRIBUTIONS**

Remove `USERS.CONTRIBUTIONS` and the entire `CONTRIBUTIONS` sub-object:

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

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/payments.ts
git commit -m "fix(shared): remove stale contributions endpoints from payments"
```

---

### Task 2: Clean up and expand contributions.ts

The `CONTRIBUTION` constant has duplicate declarations constants (all point to same path), a stale `VERIFY_PAYMENT` endpoint, and is missing several contribution routes.

**Files:**
- Modify: `packages/shared/src/constants/endpoints/contributions.ts`

- [ ] **Step 1: Rewrite contributions.ts with correct endpoints**

Replace the file with all actual contribution routes:

```typescript
export const CONTRIBUTION = {
  DECLARATIONS: '/contributions/declarations',
  ALL_DECLARATIONS: '/contributions/all-declarations',
  APPROVE_DECLARATION: (id: string) => `/contributions/declarations/${id}/approve`,
  REJECT_DECLARATION: (id: string) => `/contributions/declarations/${id}/reject`,

  LIST: '/contributions/contributions',
  GENERATE: '/contributions/contributions',
  WAIVE: '/contributions/contributions',
  DETAIL: (id: string) => `/contributions/contributions/${id}`,

  USER: (userId: string) => `/contributions/users/${userId}`,

  CREATE_PAYMENT: '/contributions/payments',
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/contributions.ts
git commit -m "fix(shared): clean up and expand contributions endpoints"
```

---

### Task 3: Add missing default plan endpoint to subscriptions.ts

**Files:**
- Modify: `packages/shared/src/constants/endpoints/subscriptions.ts`

- [ ] **Step 1: Add PLANS_DEFAULT**

```typescript
export const SUBSCRIPTIONS = {
  PLANS: '/subscriptions/plans',
  PLANS_DEFAULT: '/subscriptions/plans/default',
  PLAN_DETAILS: (id: string) => `/subscriptions/plans/${id}`,
  MY: '/subscriptions/my',
  SUBSCRIBE: '/subscriptions/subscribe',
  UPGRADE: '/subscriptions/upgrade',
  WAIVE: '/subscriptions/waive',
  PAYMENTS: (id: string) => `/subscriptions/${id}/payments`,
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/subscriptions.ts
git commit -m "feat(shared): add subscriptions default plan endpoint"
```

---

### Task 4: Create meetings.ts

The meetings feature has 25 endpoints — the biggest gap in the shared constants.

**Files:**
- Create: `packages/shared/src/constants/endpoints/meetings.ts`

- [ ] **Step 1: Write meetings.ts**

```typescript
export const MEETINGS = {
  MY: '/meetings/my',
  LIST: '/meetings',
  CREATE: '/meetings',
  DETAIL: (id: string) => `/meetings/${id}`,
  UPDATE: (id: string) => `/meetings/${id}`,
  DELETE: (id: string) => `/meetings/${id}`,
  CANCEL: (id: string) => `/meetings/${id}/cancel`,
  NOTICE: (id: string) => `/meetings/${id}/notice`,
  REPORT: (id: string) => `/meetings/${id}/report`,
  RSVP: (id: string) => `/meetings/${id}/rsvp`,

  ATTENDEES: {
    LIST: (id: string) => `/meetings/${id}/attendees`,
    ADD: (id: string) => `/meetings/${id}/attendees`,
    BULK_ASSIGN: (id: string) => `/meetings/${id}/attendees/bulk`,
    BULK_ASSIGN_PUT: (id: string) => `/meetings/${id}/attendees`,
    DETAIL: (meetingId: string, userId: string) => `/meetings/${meetingId}/attendees/${userId}`,
    REMOVE: (meetingId: string, userId: string) => `/meetings/${meetingId}/attendees/${userId}`,
  },

  AGENDA: {
    LIST: (id: string) => `/meetings/${id}/agenda`,
    ADD: (id: string) => `/meetings/${id}/agenda`,
    PROCESS: (id: string) => `/meetings/${id}/agenda`,
    ITEM: (meetingId: string, itemId: string) => `/meetings/${meetingId}/agenda/${itemId}`,
  },

  MINUTES: {
    LIST: (id: string) => `/meetings/${id}/minutes`,
    ADD: (id: string) => `/meetings/${id}/minutes`,
    DETAIL: (meetingId: string, minutesId: string) => `/meetings/${meetingId}/minutes/${minutesId}`,
  },
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/meetings.ts
git commit -m "feat(shared): add meetings endpoints"
```

---

### Task 5: Create training.ts

The training feature has 30 endpoints — the second biggest gap.

**Files:**
- Create: `packages/shared/src/constants/endpoints/training.ts`

- [ ] **Step 1: Write training.ts**

```typescript
export const TRAINING = {
  MODULES: '/training/modules',
  MODULE_DETAIL: (id: string) => `/training/modules/${id}`,
  MODULE_ASSIGN: (id: string) => `/training/modules/${id}/assign`,
  MODULE_ASSIGNED_USERS: (id: string) => `/training/modules/${id}/assigned-users`,
  MODULE_COMPLETE: (id: string) => `/training/modules/${id}/complete`,
  MODULE_COMPLETE_USER: (moduleId: string, userId: string) =>
    `/training/modules/${moduleId}/assignments/${userId}/complete`,
  MODULE_CERTIFICATES: (id: string) => `/training/modules/${id}/certificates`,
  MODULE_CERTIFICATE_DETAIL: (moduleId: string, certId: string) =>
    `/training/modules/${moduleId}/certificates/${certId}`,
  MODULE_CERTIFICATE_TEMPLATE: (id: string) => `/training/modules/${id}/certificate-template`,
  MODULE_SUPPLEMENTS: (id: string) => `/training/modules/${id}/supplements`,
  MODULE_SUPPLEMENT_DETAIL: (moduleId: string, supplementId: string) =>
    `/training/modules/${moduleId}/supplements/${supplementId}`,
  MY_ASSIGNMENTS: '/training/my-assignments',
  MY_COMPLETIONS: '/training/my-completions',
  COMPLETIONS: '/training/completions',
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/training.ts
git commit -m "feat(shared): add training endpoints"
```

---

### Task 6: Create associations.ts

The associations feature has 8 endpoints. (Note: the admin associations are separate — these are the member-facing association routes.)

**Files:**
- Create: `packages/shared/src/constants/endpoints/associations.ts`

- [ ] **Step 1: Write associations.ts**

```typescript
export const ASSOCIATIONS = {
  ROOT: '/associations',
  CURRENT: '/associations/current',
  DETAIL: (id: string) => `/associations/${id}`,
  DEACTIVATE: (id: string) => `/associations/${id}/deactivate`,
  LOGO: (id: string) => `/associations/${id}/logo`,
  MEMBERS: (id: string) => `/associations/${id}/members`,
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/associations.ts
git commit -m "feat(shared): add associations endpoints"
```

---

### Task 7: Create member-types.ts

**Files:**
- Create: `packages/shared/src/constants/endpoints/member-types.ts`

- [ ] **Step 1: Write member-types.ts**

```typescript
export const MEMBER_TYPES = {
  ROOT: '/member-types',
  DETAIL: (id: string) => `/member-types/${id}`,
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/member-types.ts
git commit -m "feat(shared): add member-types endpoints"
```

---

### Task 8: Create notifications.ts

**Files:**
- Create: `packages/shared/src/constants/endpoints/notifications.ts`

- [ ] **Step 1: Write notifications.ts**

```typescript
export const NOTIFICATIONS = {
  REGISTER: '/notifications/register',
  LINK: '/notifications/link',
  STATUS: (id: string) => `/notifications/${id}/status`,
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/notifications.ts
git commit -m "feat(shared): add notifications endpoints"
```

---

### Task 9: Create logs.ts

**Files:**
- Create: `packages/shared/src/constants/endpoints/logs.ts`

- [ ] **Step 1: Write logs.ts**

```typescript
export const LOGS = {
  ROOT: '/logs',
  BATCH: '/logs/batch',
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/logs.ts
git commit -m "feat(shared): add logs endpoints"
```

---

### Task 10: Update index.ts barrel export

**Files:**
- Modify: `packages/shared/src/constants/endpoints/index.ts`

- [ ] **Step 1: Add imports and exports for all new feature files**

```typescript
import { AUTH } from "./auth";
import { USER } from "./user";
import { ADMIN } from "./admin";
import { ANNOUNCEMENTS } from "./announcements";
import { ASSOCIATIONS } from "./associations";
import { AUDIT_LOGS } from "./audit-logs";
import { COMPLIANCE } from "./compliance";
import { CONSENT } from "./consent";
import { CONTRIBUTION } from "./contributions";
import { CRON } from "./cron";
import { DASHBOARD } from "./dashboard";
import { DSAR } from "./dsar";
import { HEALTH } from "./health";
import { LEDGER } from "./ledger";
import { LOGS } from "./logs";
import { MEETINGS } from "./meetings";
import { MEMBERS } from "./members";
import { MEMBER_TYPES } from "./member-types";
import { NOTIFICATIONS } from "./notifications";
import { PAYMENTS } from "./payments";
import { SUBSCRIPTIONS } from "./subscriptions";
import { TRAINING } from "./training";

export const ENDPOINTS = {
  AUTH,
  USER,
  ADMIN,
  ANNOUNCEMENTS,
  ASSOCIATIONS,
  AUDIT_LOGS,
  COMPLIANCE,
  CONSENT,
  CONTRIBUTION,
  CRON,
  DASHBOARD,
  DSAR,
  HEALTH,
  LEDGER,
  LOGS,
  MEETINGS,
  MEMBERS,
  MEMBER_TYPES,
  NOTIFICATIONS,
  PAYMENTS,
  SUBSCRIPTIONS,
  TRAINING,
} as const;
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --project packages/shared/tsconfig.json 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/endpoints/index.ts
git commit -m "feat(shared): register new feature endpoint constants in barrel export"
```
