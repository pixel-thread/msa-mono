# Auth Loading Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the loading flash for returning users by rendering cached user data immediately and silently refreshing in the background.

**Architecture:** Add `refreshUser()` method to the Zustand auth store for silent fetches. The `AuthProvider` conditionally calls `refreshUser()` (if cached data exists) or `fetchUser()` (cold start). Add `AppState` listener for foreground refreshes. Simplify `AuthGuard` to not block on `isAuthLoading` when cached data exists.

**Tech Stack:** Zustand (persist), expo-secure-store, React Native AppState, Axios interceptors

---

### Task 1: Add `refreshUser()` to auth.store.ts

**Files:**

- Modify: `src/shared/store/auth.store.ts`

- [ ] **Step 1: Add `refreshUser` to the interface**

Add `refreshUser` to `AuthState`:

```typescript
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  fetchUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}
```

- [ ] **Step 2: Add `refreshUser` implementation after `fetchUser`**

```typescript
refreshUser: async () => {
  try {
    const response = await http.get<AuthUser>('/auth/me');
    if (response.success && response.data) {
      set({ user: response.data, isAuthenticated: true });
    }
  } catch (error) {
    logger.error('Failed to refresh user silently', { error });
  }
},
```

Key properties:

- Does NOT touch `isAuthLoading` — no UI impact
- On success: updates `user` and `isAuthenticated` in store (triggers re-render)
- On failure (network, server error): silently keeps cached data
- On 401: Axios interceptor handles token refresh; if refresh fails, session expired handler clears the store

- [ ] **Step 3: Verify the build compiles**

Run: `npx tsc --noEmit` or `npm run typecheck`
Expected: No type errors

---

### Task 2: Update AuthProvider with new bootstrap flow + AppState listener

**Files:**

- Modify: `src/shared/components/providers/auth/index.tsx`

- [ ] **Step 1: Add `AppState` import**

```typescript
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@src/shared/store';
import { useSecureTokenStore } from '@features/auth/store';
import { setSessionExpiredHandler } from '@src/shared/lib/api-client/session-expired-handler';
```

- [ ] **Step 2: Replace the second `useEffect` (the one that calls `fetchUser`) with conditional logic**

Replace lines 31-34:

```typescript
useEffect(() => {
  if (!isReady) return;
  fetchUser();
}, [isReady, fetchUser]);
```

With:

```typescript
useEffect(() => {
  if (!isReady) return;

  const user = useAuthStore.getState().user;
  if (user) {
    refreshUser();
  } else {
    fetchUser();
  }
}, [isReady, fetchUser, refreshUser]);
```

Also add `refreshUser` to the destructured store on line 10:

```typescript
const { fetchUser, refreshUser, setHydrated, isAuthLoading, isAuthenticated } = useAuthStore();
```

Note: `refreshUser` needs to be destructured from the store.

- [ ] **Step 3: Add AppState foreground listener**

Add a new `useEffect` after line 34 (before the session expired handler):

```typescript
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      const user = useAuthStore.getState().user;
      if (user) {
        refreshUser();
      }
    }
  });
  return () => subscription.remove();
}, [refreshUser]);
```

- [ ] **Step 4: Remove the redirect-to-sign-in `useEffect`**

Remove lines 44-49 (the `useEffect` that redirects to sign-in when not authenticated). AuthGuard handles this.

```typescript
// Remove this entire useEffect:
useEffect(() => {
  if (!isReady || isAuthLoading) return;
  if (!isAuthenticated) {
    router.replace('/(auth)/sign-in');
  }
}, [isReady, isAuthLoading, isAuthenticated, router]);
```

- [ ] **Step 5: Remove unused `router` and `useState` imports**

After removing the redirect effect, the `router` and `isReady` `useState` are no longer needed:

```typescript
// Remove: import { useRouter } from 'expo-router';
// Remove: const router = useRouter();
// Remove: const [isReady, setIsReady] = useState(false);
```

Keep the `useState` import if still needed (it's not after removing `isReady`), but `useEffect` is still needed.

- [ ] **Step 6: Simplify the bootstrap effect**

Since we removed `isReady`, the bootstrap effect simplifies:

```typescript
useEffect(() => {
  const bootstrap = async () => {
    await initTokens();
    setHydrated(true);
  };
  bootstrap();
}, [initTokens, setHydrated]);
```

No need for `mounted` guard since the effect only runs once on mount (empty deps) and `setHydrated` is a stable setState reference.

- [ ] **Step 7: Verify final file content**

Read the file and confirm it compiles. Run: `npx tsc --noEmit`

---

### Task 3: Update AuthGuard to simplify loading check

**Files:**

- Modify: `src/shared/components/auth/auth-guard.component.tsx`

- [ ] **Step 1: Replace the loading and routing logic**

Read and rewrite the component. Keep `isHydrated` and `isAuthLoading` for the loading check, remove `isChecking`:

```typescript
import { useEffect, useState } from 'react';
import { useSegments, useRouter, Route } from 'expo-router';
import { useAuthStore } from '@src/shared/store';
import { LoadingScreen } from '../screens';

interface AuthGuardProps {
  children: React.ReactNode;
  publicRoutes?: Route[];
}

const authRoutes: Route[] = [
  '/(auth)/sign-in',
  '/(auth)/sign-in-verify',
  '/(auth)/sign-up',
  '/(auth)/forgot-password',
  '/(auth)/reset-password',
];

export const AuthGuard = ({ children, publicRoutes = authRoutes }: AuthGuardProps) => {
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthLoading, isHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isHydrated || !isMounted) return;

    const currentPath = '/' + segments.join('/');
    const isPublicRoute = publicRoutes.some((route) => currentPath.startsWith(route));

    if (isPublicRoute && user) {
      router.replace('/');
    } else if (!isPublicRoute && !user) {
      router.replace('/(auth)/sign-in');
    }
  }, [isHydrated, isMounted, user, segments, publicRoutes, router]);

  if (!isHydrated || !isMounted || isAuthLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
```

Key changes:

- Removed `isChecking` state and its logic
- Removed `isAuthenticated` from destructuring (not needed for the simplified check)
- Loading screen shown when: not hydrated, not mounted, OR auth loading in progress (initial cold start)
- Routing decision uses `user` only (no `isAuthenticated` needed — `user` being truthy implies authentication)

- [ ] **Step 2: Verify the build compiles**

Run: `npx tsc --noEmit`

---

### Task 4: Verify full flow

- [ ] **Step 1: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 2: Review all three files for correctness**

Verify:

- `refreshUser()` never sets `isAuthLoading` ✓
- AuthProvider conditionally calls `refreshUser` when cached user exists ✓
- AppState listener calls `refreshUser` on foreground ✓
- AuthGuard shows loading only when truly needed (not hydrated, isAuthLoading) ✓
- `use-sign-in.ts` still uses `fetchUser()` (loading during sign-in is intentional) ✓
- Session expired handler still clears both stores ✓
- No `router.replace` in AuthProvider for redirect (AuthGuard handles it) ✓

- [ ] **Step 3: Commit**

```bash
git add src/shared/store/auth.store.ts src/shared/components/providers/auth/index.tsx src/shared/components/auth/auth-guard.component.tsx
git commit -m "feat: eliminate auth loading flash with stale-while-revalidate pattern

- Add refreshUser() for silent background user fetch
- AuthProvider conditionally caches or fetches on bootstrap
- Add AppState listener for foreground refresh
- Simplify AuthGuard loading check
- Cached user data renders immediately, background refresh is silent"
```
