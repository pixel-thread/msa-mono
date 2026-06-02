# Sync Endpoints Constants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a centralized `ENDPOINTS` constant in `@packages/shared/src/constants` that maps to all backend routes, enabling type-safe access like `ENDPOINTS.AUTH.SIGNIN`.

**Architecture:** 
- Individual feature constants will live in `packages/shared/src/constants/endpoints/<feature>.ts`.
- A central `ENDPOINTS` object will be composed in `packages/shared/src/constants/endpoints/index.ts`.
- The main entry `packages/shared/src/constants/index.ts` will export `ENDPOINTS`.

**Tech Stack:** TypeScript, Shared Package

---

### Task 1: Create Feature Endpoint Constants

**Files:**
- Create: `packages/shared/src/constants/endpoints/auth.ts`
- Create: `packages/shared/src/constants/endpoints/user.ts`
- Create: `packages/shared/src/constants/endpoints/admin.ts`
- Create: `packages/shared/src/constants/endpoints/announcements.ts`
- Create: `packages/shared/src/constants/endpoints/health.ts`

- [ ] **Step 1: Define AUTH endpoints**
```typescript
export const AUTH = {
  SIGNUP: '/api/v1/auth/sign-up',
  SIGNIN: '/api/v1/auth/sign-in',
  SIGNIN_VERIFY: '/api/v1/auth/sign-in/verify',
  SIGNIN_RESEND: '/api/v1/auth/sign-in/resend',
  REFRESH: '/api/v1/auth/refresh',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  ME: '/api/v1/auth/me',
  LOGOUT: '/api/v1/auth/logout',
  CHANGE_PASSWORD: '/api/v1/auth/change-password',
  MFA_SETUP: '/api/v1/auth/mfa/setup',
  MFA_VERIFY: '/api/v1/auth/mfa/verify',
  MFA_RESEND: '/api/v1/auth/mfa/resend',
  MFA_DISABLE: '/api/v1/auth/mfa/disable',
} as const;
```

- [ ] **Step 2: Define USER endpoints**
```typescript
export const USER = {
  PROFILE: '/api/v1/user',
  MFA: '/api/v1/user/mfa',
  INVOICES: '/api/v1/user/invoices',
  INVOICE_DETAILS: (invoiceId: string) => `/api/v1/user/invoices/${invoiceId}`,
} as const;
```

- [ ] **Step 3: Define HEALTH endpoints**
```typescript
export const HEALTH = {
  ROOT: '/api/v1/health',
} as const;
```

- [ ] **Step 4: Commit**
```bash
git add packages/shared/src/constants/endpoints/
git commit -m "feat(shared): add initial feature endpoint constants"
```

### Task 2: Compose Main ENDPOINTS Constant

**Files:**
- Modify: `packages/shared/src/constants/endpoints/index.ts`
- Modify: `packages/shared/src/constants/index.ts`

- [ ] **Step 1: Export all feature constants from index**
```typescript
import { AUTH } from './auth';
import { USER } from './user';
import { HEALTH } from './health';
// ... import other features

export const ENDPOINTS = {
  AUTH,
  USER,
  HEALTH,
  // ... other features
} as const;
```

- [ ] **Step 2: Export ENDPOINTS from constants root**
```typescript
export * from './endpoints';
```

- [ ] **Step 3: Commit**
```bash
git add packages/shared/src/constants/
git commit -m "feat(shared): export centralized ENDPOINTS constant"
```

### Task 3: Verify and Expand (Validation)

- [ ] **Step 1: Check if ENDPOINTS.AUTH.SIGNIN is accessible**
- [ ] **Step 2: Add more features as discovered from backend index.ts**

