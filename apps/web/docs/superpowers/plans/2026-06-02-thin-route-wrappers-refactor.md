# Thin Route Wrappers Refactoring Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor all "thick" pages in `src/app/` to be thin wrappers that delegate to feature pages in `src/features/<feature-name>/pages/`, following the architectural mandate in `GEMINI.md`.

**Architecture:** Move business logic, UI composition, and data fetching from `src/app/` to dedicated feature page components. This ensures `src/app/` only handles routing and layout, while the core domain logic remains within feature modules.

**Tech Stack:** Next.js (App Router), React, TypeScript.

---

### Task 1: Refactor Auth Feature Pages

**Files:**

- Create: `src/features/auth/pages/sign-up.tsx`
- Create: `src/features/auth/pages/sign-in.tsx`
- Create: `src/features/auth/pages/change-password.tsx`
- Create: `src/features/auth/pages/reset-password.tsx`
- Create: `src/features/auth/pages/forgot-password.tsx`
- Create: `src/features/auth/pages/forbidden.tsx`
- Create: `src/features/auth/pages/index.ts`
- Modify: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Modify: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Modify: `src/app/(auth)/change-password/page.tsx`
- Modify: `src/app/(auth)/reset-password/page.tsx`
- Modify: `src/app/(auth)/forgot-password/page.tsx`
- Modify: `src/app/(auth)/forbidden/page.tsx`

- [ ] **Step 1: Move Sign Up logic to feature**
      Move content from `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` to `src/features/auth/pages/sign-up.tsx`. Update imports to use `@src/...` aliases.

- [ ] **Step 2: Move Sign In logic to feature**
      Move content from `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` to `src/features/auth/pages/sign-in.tsx`.

- [ ] **Step 3: Move Change Password logic to feature**
      Move content from `src/app/(auth)/change-password/page.tsx` to `src/features/auth/pages/change-password.tsx`.

- [ ] **Step 4: Move Reset Password logic to feature**
      Move content from `src/app/(auth)/reset-password/page.tsx` to `src/features/auth/pages/reset-password.tsx`.

- [ ] **Step 5: Move Forgot Password logic to feature**
      Move content from `src/app/(auth)/forgot-password/page.tsx` to `src/features/auth/pages/forgot-password.tsx`.

- [ ] **Step 6: Move Forbidden logic to feature**
      Move content from `src/app/(auth)/forbidden/page.tsx` to `src/features/auth/pages/forbidden.tsx`.

- [ ] **Step 7: Create Auth pages index**
      Create `src/features/auth/pages/index.ts` and export all pages.

- [ ] **Step 8: Refactor app routes to thin wrappers**
      Replace content of all modified `app/(auth)/.../page.tsx` files with thin wrappers.

Example for `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignInPage } from '@src/features/auth/pages';
export default function Page() {
  return <SignInPage />;
}
```

- [ ] **Step 9: Commit**

```bash
git add src/features/auth/pages src/app/\(auth\)
git commit -m "refactor(auth): move page logic to feature pages"
```

### Task 2: Refactor Meetings Feature Pages

**Files:**

- Create: `src/features/meetings/pages/meeting-detail.tsx`
- Create: `src/features/meetings/pages/meetings.tsx`
- Modify: `src/features/meetings/pages/index.ts`
- Modify: `src/app/(dashboard)/meetings/[meetingId]/page.tsx`
- Modify: `src/app/(dashboard)/meetings/page.tsx`

- [ ] **Step 1: Move Meeting Detail logic to feature**
      Move content from `src/app/(dashboard)/meetings/[meetingId]/page.tsx` to `src/features/meetings/pages/meeting-detail.tsx`.

- [ ] **Step 2: Move Meetings list logic to feature**
      Move content from `src/app/(dashboard)/meetings/page.tsx` to `src/features/meetings/pages/meetings.tsx`.

- [ ] **Step 3: Update Meetings pages index**
      Update `src/features/meetings/pages/index.ts` to export new pages.

- [ ] **Step 4: Refactor app routes to thin wrappers**
      Replace content of `src/app/(dashboard)/meetings/[meetingId]/page.tsx` and `src/app/(dashboard)/meetings/page.tsx` with thin wrappers.

- [ ] **Step 5: Commit**

```bash
git add src/features/meetings/pages src/app/\(dashboard\)/meetings
git commit -m "refactor(meetings): move page logic to feature pages"
```

### Task 3: Refactor Dashboard Feature Page

**Files:**

- Create: `src/features/dashboard/pages/dashboard.tsx`
- Create: `src/features/dashboard/pages/index.ts`
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Move Dashboard logic to feature**
      Move content from `src/app/(dashboard)/dashboard/page.tsx` to `src/features/dashboard/pages/dashboard.tsx`.

- [ ] **Step 2: Create Dashboard pages index**
      Create `src/features/dashboard/pages/index.ts` and export the page.

- [ ] **Step 3: Refactor app route to thin wrapper**
      Replace content of `src/app/(dashboard)/dashboard/page.tsx` with thin wrapper.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/pages src/app/\(dashboard\)/dashboard
git commit -m "refactor(dashboard): move page logic to feature pages"
```

### Task 4: Verification

- [ ] **Step 1: Run build to check for errors**
      Run: `npm run build` or `pnpm run build`
      Expected: PASS

- [ ] **Step 2: Verify routes in browser (manual)**
      Check that all refactored pages still render and function correctly.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: finalize thin route wrappers refactor"
```
