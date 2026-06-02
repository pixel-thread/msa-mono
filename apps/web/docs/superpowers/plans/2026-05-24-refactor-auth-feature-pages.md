# Refactor Auth Feature Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Auth feature pages from the Next.js `app` directory to the `features/auth/pages` module to align with the project's architectural mandate.

**Architecture:** We are refactoring domain-specific UI logic into feature modules. App routes will become thin wrappers that import and render these feature pages.

**Tech Stack:** Next.js (App Router), React, TypeScript.

---

### Task 1: Create Sign Up feature page

**Files:**
- Create: `src/features/auth/pages/sign-up.tsx`

- [ ] **Step 1: Move Sign Up logic to feature**
Copy content from `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` to `src/features/auth/pages/sign-up.tsx`. Ensure all imports are correct and use `@src/...` aliases if they don't already.

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/pages/sign-up.tsx
git commit -m "feat(auth): move Sign Up logic to features"
```

### Task 2: Create Sign In feature page

**Files:**
- Create: `src/features/auth/pages/sign-in.tsx`

- [ ] **Step 1: Move Sign In logic to feature**
Copy content from `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` to `src/features/auth/pages/sign-in.tsx`.

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/pages/sign-in.tsx
git commit -m "feat(auth): move Sign In logic to features"
```

### Task 3: Create Change Password feature page

**Files:**
- Create: `src/features/auth/pages/change-password.tsx`

- [ ] **Step 1: Move Change Password logic to feature**
Copy content from `src/app/(auth)/change-password/page.tsx` to `src/features/auth/pages/change-password.tsx`.

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/pages/change-password.tsx
git commit -m "feat(auth): move Change Password logic to features"
```

### Task 4: Create Reset Password feature page

**Files:**
- Create: `src/features/auth/pages/reset-password.tsx`

- [ ] **Step 1: Move Reset Password logic to feature**
Copy content from `src/app/(auth)/reset-password/page.tsx` to `src/features/auth/pages/reset-password.tsx`.

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/pages/reset-password.tsx
git commit -m "feat(auth): move Reset Password logic to features"
```

### Task 5: Create Forgot Password feature page

**Files:**
- Create: `src/features/auth/pages/forgot-password.tsx`

- [ ] **Step 1: Move Forgot Password logic to feature**
Copy content from `src/app/(auth)/forgot-password/page.tsx` to `src/features/auth/pages/forgot-password.tsx`.

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/pages/forgot-password.tsx
git commit -m "feat(auth): move Forgot Password logic to features"
```

### Task 6: Create Forbidden feature page

**Files:**
- Create: `src/features/auth/pages/forbidden.tsx`

- [ ] **Step 1: Move Forbidden logic to feature**
Copy content from `src/app/(auth)/forbidden/page.tsx` to `src/features/auth/pages/forbidden.tsx`.

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/pages/forbidden.tsx
git commit -m "feat(auth): move Forbidden logic to features"
```

### Task 7: Create Auth pages index

**Files:**
- Create: `src/features/auth/pages/index.ts`

- [ ] **Step 1: Export all pages from index**

```typescript
export * from './sign-up';
export * from './sign-in';
export * from './change-password';
export * from './reset-password';
export * from './forgot-password';
export * from './forbidden';
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/pages/index.ts
git commit -m "feat(auth): create pages index barrel export"
```

### Task 8: Refactor app routes to thin wrappers

**Files:**
- Modify: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Modify: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Modify: `src/app/(auth)/change-password/page.tsx`
- Modify: `src/app/(auth)/reset-password/page.tsx`
- Modify: `src/app/(auth)/forgot-password/page.tsx`
- Modify: `src/app/(auth)/forbidden/page.tsx`

- [ ] **Step 1: Refactor all app routes**
Replace the content of each file with a thin wrapper that renders the corresponding feature page.

Example for `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:
```tsx
import { SignInPage } from '@src/features/auth/pages';

export default function Page() {
  return <SignInPage />;
}
```

- [ ] **Step 2: Verify all pages still render correctly**
Since these are client components, visual verification or build check is recommended.

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/**/page.tsx
git commit -m "refactor(auth): turn app routes into thin wrappers"
```
