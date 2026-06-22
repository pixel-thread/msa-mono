# Auth Loading Refactor Design

**Status:** APPROVED
**Last Updated:** 2026-06-22

## Problem

On app launch, even when the user has a valid persisted session (cached in SecureStore), the app shows a `LoadingScreen` while `GET /auth/me` completes. This creates an unnecessary flash of loading for returning users.

## Current Flow

```
App Launch
  → Zustand store created with initial values (user: null, isAuthLoading: true)
  → Persist middleware rehydrates from SecureStore (async)
  → AuthProvider calls initTokens(), setHydrated(true)
  → AuthProvider calls fetchUser()
      → fetchUser sets isAuthLoading: true (overwrites rehydrated false)
      → API call to GET /auth/me
  → AuthGuard sees isAuthLoading: true → shows LoadingScreen
  → API returns → isAuthLoading: false → content renders
```

The issue: the persisted user data IS available after rehydration, but `fetchUser()` always sets `isAuthLoading: true`, forcing a loading flash.

## Solution

Split the user fetch into two paths:

1. **Has cached user data** → render content immediately, silently refresh in background
2. **No cached user data** → show loading, full fetch (existing behavior)

## Architecture

### Three File Changes

| File                                                  | Change                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `src/shared/store/auth.store.ts`                      | Add `refreshUser()` method for silent background fetch       |
| `src/shared/components/providers/auth/index.tsx`      | Conditional bootstrap + AppState foreground refresh listener |
| `src/shared/components/auth/auth-guard.component.tsx` | Simplify loading check, remove `isChecking` state            |

### New Data Flow

```
App Launch
  → Zustand rehydrates from SecureStore
  → AuthProvider: initTokens, setHydrated(true)
  → AuthProvider checks:
      ├── user exists (cached) → call refreshUser() (silent)
      │     └── AuthGuard sees user → renders content immediately
      │     └── refreshUser() → GET /auth/me → updates store silently
      │                              ↳ on failure → keep cached data (no error shown)
      │
      └── user is null (cold start) → call fetchUser()
            └── AuthGuard shows LoadingScreen
            └── GET /auth/me → user set → reroute to home or sign-in

App Foreground
  → AppState listener fires on 'active'
  → Calls refreshUser() silently
```

### refreshUser() Contract

```typescript
refreshUser: () => Promise<void>;
```

- Never touches `isAuthLoading` — silent, no UI impact
- Calls `GET /auth/me`
- On success: updates `user` and `isAuthenticated` in store
- On failure: silently keeps cached data (network error, server error)
- On 401: Axios interceptor handles token refresh; if refresh fails, session expired handler clears store (redirects to sign-in)
- Used for: app launch with cached data, app foreground, pull-to-refresh (future)

### fetchUser() Contract (unchanged)

- Sets `isAuthLoading: true` → guards against premature redirect
- Calls `GET /auth/me`
- On failure: clears user, redirects to sign-in
- Used for: cold start (no cached data), after sign-in

### Error Handling

| Scenario                               | Behavior                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Open app, cached data exists, offline  | Shows cached immediately. `refreshUser()` fails silently.                                                    |
| Open app, no cached data, offline      | `fetchUser()` fails → user null → AuthGuard redirects to sign-in                                             |
| Open app, cached data, expired session | `refreshUser()` → 401 → interceptor refreshes → refresh fails → handler clears store → redirected to sign-in |
| Foreground refresh, server error       | `refreshUser()` fails silently. Keeps current data.                                                          |
| Foreground refresh, session expired    | Same as above — session cleared, redirected to sign-in                                                       |

### Implementation Notes

- `AppState.addEventListener` uses the same pattern as `notification.tsx:71`
- `onRehydrateStorage` is NOT needed — AuthProvider's `isHydrated` + the conditional check suffice
- `use-sign-in.ts` still uses `fetchUser()` — the loading state during sign-in is expected user feedback
