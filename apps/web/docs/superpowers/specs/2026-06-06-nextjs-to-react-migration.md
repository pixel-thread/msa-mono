# Next.js → React + TanStack Router Migration

**Status:** DRAFT
**Date:** 2026-06-06

## Purpose

Migrate the `apps/web` Next.js 16 App Router project to a pure React SPA using Vite as build tool and `@tanstack/react-router` (file-based routing) for routing. Remove server-side Next.js dependencies, `next-swagger-doc`, and Vercel cron jobs. Keep all existing feature code, state management (TanStack Query, Zustand), UI (shadcn/ui, Tailwind v4), auth patterns, and providers.

## Decisions

| Decision     | Choice                                                                              |
| ------------ | ----------------------------------------------------------------------------------- |
| Build tool   | Vite with `@vitejs/plugin-react` + `@tanstack/router-plugin/vite`                   |
| Routing      | `@tanstack/react-router` — file-based, folder-per-route (`routes/<name>/index.tsx`) |
| Fonts        | `@fontsource/roboto`, `@fontsource/roboto-mono`, `@fontsource/jetbrains-mono`       |
| Theme        | `next-themes` (works without Next.js)                                               |
| Swagger docs | Removed entirely                                                                    |
| Hosting      | Vercel (static SPA, remove cron jobs from `vercel.json`)                            |
| Env vars     | Keep `NEXT_PUBLIC_*` prefix — Vite supports custom `envPrefix`                      |

## Files to Create

### Root config files

- `index.html` — Vite entry HTML
- `vite.config.ts` — Vite config with plugins

### Entry points

- `src/main.tsx` — App entry, renders `<RouterProvider>`, applies global CSS

### Route tree

- `src/routes/__root.tsx` — Root route layout (providers: AppProviders, Theme, Query, Auth)
- `src/routes/index/index.tsx` — Home page (`/`)
- `src/routes/_auth/index.tsx` — Auth layout (no sidebar)
- `src/routes/_auth/sign-in/index.tsx` — Sign in
- `src/routes/_auth/sign-up/index.tsx` — Sign up
- `src/routes/_auth/forgot-password/index.tsx` — Forgot password
- `src/routes/_auth/reset-password/index.tsx` — Reset password
- `src/routes/_auth/change-password/index.tsx` — Change password
- `src/routes/_auth/forbidden/index.tsx` — Forbidden page
- `src/routes/_dashboard/index.tsx` — Dashboard layout (sidebar + header from `(dashboard)/layout.tsx`)
- `src/routes/_dashboard/dashboard/index.tsx` — Dashboard page (stub)
- `src/routes/_dashboard/announcement/index.tsx` — Announcements list
- `src/routes/_dashboard/announcement/archived/index.tsx` — Archived announcements
- `src/routes/_dashboard/announcement/draft/index.tsx` — Draft announcements
- `src/routes/_dashboard/announcement/$announcementId/index.tsx` — Announcement detail
- `src/routes/_dashboard/associations/index.tsx` — Associations list
- `src/routes/_dashboard/associations/current/index.tsx` — Current associations
- `src/routes/_dashboard/audit-logs/index.tsx` — Audit logs
- `src/routes/_dashboard/compliance/index.tsx` — Compliance
- `src/routes/_dashboard/consent/index.tsx` — Consent
- `src/routes/_dashboard/contributions/index.tsx` — Contributions dashboard
- `src/routes/_dashboard/contributions/declarations/index.tsx` — Declarations list
- `src/routes/_dashboard/contributions/declarations/$declarationId/index.tsx` — Declaration detail
- `src/routes/_dashboard/contributions/record/index.tsx` — Record contribution
- `src/routes/_dashboard/contributions/$contributionId/index.tsx` — Contribution detail
- `src/routes/_dashboard/dsar/index.tsx` — DSAR admin
- `src/routes/_dashboard/ledger/index.tsx` — Ledger dashboard
- `src/routes/_dashboard/ledger/accounts/index.tsx` — Ledger accounts
- `src/routes/_dashboard/ledger/accounts/$id/index.tsx` — Ledger account detail
- `src/routes/_dashboard/ledger/entries/index.tsx` — Ledger entries
- `src/routes/_dashboard/ledger/entries/$entryId/index.tsx` — Ledger entry detail
- `src/routes/_dashboard/ledger/reports/index.tsx` — Ledger reports
- `src/routes/_dashboard/meetings/index.tsx` — Meetings list
- `src/routes/_dashboard/meetings/$meetingId/index.tsx` — Meeting detail
- `src/routes/_dashboard/meetings/$meetingId/assign/index.tsx` — Assign members
- `src/routes/_dashboard/meetings/$meetingId/minutes/index.tsx` — Meeting minutes
- `src/routes/_dashboard/member-types/index.tsx` — Member types
- `src/routes/_dashboard/members/index.tsx` — Members list
- `src/routes/_dashboard/members/applications/index.tsx` — Membership applications
- `src/routes/_dashboard/members/$memberId/index.tsx` — Member detail
- `src/routes/_dashboard/payments/index.tsx` — Payments list
- `src/routes/_dashboard/payments/providers/index.tsx` — Payment providers
- `src/routes/_dashboard/payments/users/index.tsx` — User payments lookup
- `src/routes/_dashboard/payments/users/$userId/index.tsx` — User payments detail
- `src/routes/_dashboard/payments/users/$userId/contributions/index.tsx` — User contributions
- `src/routes/_dashboard/payments/$paymentId/index.tsx` — Payment detail
- `src/routes/_dashboard/subscriptions/index.tsx` — Subscriptions list
- `src/routes/_dashboard/subscriptions/change-plan/index.tsx` — Change plan
- `src/routes/_dashboard/subscriptions/my/index.tsx` — My subscription
- `src/routes/_dashboard/subscriptions/plans/index.tsx` — Plans list
- `src/routes/_dashboard/subscriptions/plans/$planId/index.tsx` — Plan detail
- `src/routes/_dashboard/training/index.tsx` — Training list
- `src/routes/_dashboard/training/completions/index.tsx` — All completions
- `src/routes/_dashboard/training/$id/index.tsx` — Training detail
- `src/routes/_dashboard/training/$id/assign/index.tsx` — Training assign
- `src/routes/_dashboard/training/$id/completions/index.tsx` — Training completions

## Files to Remove

- `src/app/` (entire directory with all pages, layouts)
- `src/features/swagger/` (entire directory)
- `next.config.ts`
- `next-env.d.ts`
- `vercel.json` (or sanitize to remove cron jobs)
- `src/shared/components/Redirect.tsx` (Next.js-specific auth redirect)

## Files to Modify

### Config files

- `package.json` — Replace Next.js scripts with Vite scripts, update dependencies
- `tsconfig.json` — Remove `"plugins": [{"name": "next"}]`, remove Next.js-specific include paths
- `.env` / `.env.production` — Ensure `VITE_*` prefix or set `envPrefix: ['NEXT_PUBLIC_', 'VITE_']` in vite config
- `eslint.config.mjs` — Replace `eslint-config-next` with appropriate React/Vite plugins

### All files importing from `next/*` (~40 files, listed in exploration)

- `next/link` → `Link` from `@tanstack/react-router`
- `useRouter` from `next/navigation` → `useNavigate` from `@tanstack/react-router`
- `useParams` from `next/navigation` → `useParams` from `@tanstack/react-router`
- `useSearchParams` from `next/navigation` → `useSearchParams` from `@tanstack/react-router`
- `usePathname` from `next/navigation` → `useLocation` from `@tanstack/react-router`

### Feature pages (currently in `src/features/*/pages/*.tsx`)

These are thin page components imported by Next.js route pages. They remain unchanged in `src/features/` but will now be imported by TanStack Router route files instead of Next.js `page.tsx` files.

## Architecture

```
index.html                          ← Vite HTML entry
vite.config.ts                      ← Vite + TanStack Router plugin
src/
  main.tsx                          ← ReactDOM.createRoot, render <RouterProvider>
  env.ts                            ← Env vars (unchanged)
  app/                              ← REMOVED
  routes/                           ← NEW: TanStack Router file-based routes
    __root.tsx                      ← Root layout (AppProviders, global CSS)
    index/index.tsx                 ← /
    _auth/index.tsx                 ← Auth group layout (no sidebar)
    _auth/sign-in/index.tsx
    _auth/sign-up/index.tsx
    ...
    _dashboard/index.tsx            ← Dashboard layout (sidebar)
    _dashboard/announcement/index.tsx
    _dashboard/announcement/archived/index.tsx
    ...
  features/                         ← UNCHANGED (all hooks, components, pages)
    auth/
    members/
    contributions/
    meetings/
    ledger/
    ...
  shared/                           ← MOSTLY UNCHANGED (except Redirect.tsx removed)
    providers/                      ← AppProviders, AuthProvider, QueryProvider etc.
    components/                     ← sidebar, data-table, nav components (imports updated)
    hooks/                          ← use-url-filters updated
    ...
```

## Data Flow

```
Browser URL
  → TanStack Router matches route
  → Route file renders feature page component (from src/features/*/pages/)
  → Feature page uses hooks (from src/features/*/hooks/)
  → Hooks call API via Axios client (src/shared/api/)
  → Auth state from AuthProvider/Zustand store
  → Theme from next-themes provider
```

Unchanged: Axios client, TanStack Query, AuthProvider, Zustand stores, Zod validators, shadcn/ui components.

## Migration Order

1. Scaffold Vite + TanStack Router (config files, entry point, root layout)
2. Create route tree (all route files as thin wrappers importing feature pages)
3. Migrate `next/link` imports (30 files)
4. Migrate `useRouter` → `useNavigate` (15 files)
5. Migrate `useParams` → `@tanstack/react-router` `useParams` (10 files)
6. Migrate `useSearchParams` → `@tanstack/react-router` `useSearchParams` (4 files)
7. Migrate `usePathname` → `useLocation` (3 files)
8. Replace `next/font/google` with `@fontsource` packages
9. Clean up: remove `src/app/`, remove `swagger` feature, update configs
10. Build & verify
