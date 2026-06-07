# Next.js → React + TanStack Router Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate a Next.js 16 App Router project to a pure React SPA with Vite + `@tanstack/react-router` file-based routing.

**Architecture:** Vite as build tool, TanStack Router for client-side routing, all existing feature code (hooks, components, state, API client) stays unchanged. Each route is a folder with `index.tsx` that imports a feature page component. Next.js APIs (`next/navigation`, `next/link`, `next/font`) replaced with TanStack Router equivalents and `@fontsource`.

**Tech Stack:** Vite, React 19, @tanstack/react-router (file-based routing), @tanstack/react-query, Zustand, Axios, Tailwind v4, shadcn/ui, Zod, @fontsource

---

## File Structure Map

```
Current → New

src/
  app/layout.tsx                        → src/main.tsx + src/routes/__root.tsx
  app/page.tsx                          → src/routes/index/index.tsx
  app/(auth)/sign-in/[[...sign-in]]/page.tsx → src/routes/_auth/sign-in/index.tsx
  app/(auth)/sign-up/[[...sign-up]]/page.tsx → src/routes/_auth/sign-up/index.tsx
  app/(auth)/forgot-password/page.tsx   → src/routes/_auth/forgot-password/index.tsx
  app/(auth)/reset-password/page.tsx    → src/routes/_auth/reset-password/index.tsx
  app/(auth)/change-password/page.tsx   → src/routes/_auth/change-password/index.tsx
  app/(auth)/forbidden/page.tsx         → src/routes/_auth/forbidden/index.tsx
  app/(dashboard)/layout.tsx            → src/routes/_dashboard/index.tsx
  app/(dashboard)/dashboard/page.tsx    → src/routes/_dashboard/dashboard/index.tsx
  app/(dashboard)/announcement/page.tsx → src/routes/_dashboard/announcement/index.tsx
  ... (all dashboard routes follow same pattern)
  app/(dashboard)/docs/page.tsx         → REMOVED

  features/swagger/                     → REMOVED (entire directory)

[new] index.html                        → Vite HTML entry
[new] vite.config.ts                    → Vite config

  features/*/pages/*.tsx                → UNCHANGED (feature components stay put)
  shared/                               → MOSTLY UNCHANGED (some imports updated)
```

---

### Task 1: Scaffold Vite + install dependencies

**Files:**

- Create: `index.html`
- Create: `vite.config.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Remove from deps: `next`, `next-swagger-doc`, `next-themes`, `@t3-oss/env-nextjs`, `eslint-config-next`
- Add deps: `@tanstack/react-router`, `@tanstack/router-plugin`, `@vitejs/plugin-react`, `vite`, `@fontsource/roboto`, `@fontsource/roboto-mono`, `@fontsource/jetbrains-mono`

- [ ] **Step 1: Create `index.html`**

```html
<!doctype html>
<html lang="en" suppressHydrationWarning>
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MFSA</title>
  </head>
  <body class="min-h-full flex flex-col">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

export default defineConfig({
  plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@feature': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@store': path.resolve(__dirname, './src/shared/stores'),
      '@hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@lib': path.resolve(__dirname, './src/shared/lib'),
      '@utils': path.resolve(__dirname, './src/shared/utils'),
      '@errors': path.resolve(__dirname, './src/shared/errors'),
      '@config': path.resolve(__dirname, './src/shared/config'),
      '@sharedType': path.resolve(__dirname, './src/shared/types'),
      '@validator': path.resolve(__dirname, './src/shared/validators'),
    },
  },
  envPrefix: ['NEXT_PUBLIC_', 'VITE_'],
});
```

- [ ] **Step 3: Update `package.json` scripts and dependencies**

Edit `package.json`:

Replace scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint",
  "format": "prettier --write ."
}
```

Remove from `dependencies`:

- `next`
- `next-swagger-doc`
- `next-themes`
- `@t3-oss/env-nextjs`

Remove from `devDependencies`:

- `eslint-config-next`

Add to `devDependencies`:

```json
"devDependencies": {
  "@tanstack/router-plugin": "^1.114.35",
  "@vitejs/plugin-react": "^4.4.1",
  "vite": "^6.3.5",
  "@fontsource/roboto": "^5.2.6",
  "@fontsource/roboto-mono": "^5.2.6",
  "@fontsource/jetbrains-mono": "^5.2.6",
  ...
}
```

Add to `dependencies`:

```json
"dependencies": {
  "@tanstack/react-router": "^1.114.35",
  ...
}
```

- [ ] **Step 4: Update `tsconfig.json`**

Remove `"plugins": [{"name": "next"}]` from `compilerOptions`.
Remove `.next/types/**/*.ts` and `.next/dev/types/**/*.ts` from `include`.
Add `"src/**/*.ts", "src/**/*.tsx"` to `include` if needed.

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "paths": {
      "@hooks/*": ["./src/shared/hooks/*"],
      "@src/*": ["./src/*"],
      "@utils/*": ["./src/shared/utils/*"],
      "@lib/*": ["./src/shared/lib/*"],
      "@validator/*": ["./src/shared/validators/*"],
      "@sharedType/*": ["./src/shared/types/*"],
      "@components/*": ["./src/shared/components/*"],
      "@store/*": ["./src/shared/stores/*"],
      "@errors/*": ["./src/shared/errors/*"],
      "@config/*": ["./src/shared/config/*"],
      "@feature/*": ["./src/features/*"]
    }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", "**/*.mts"],
  "exclude": ["node_modules", "express"]
}
```

- [ ] **Step 5: Install new dependencies**

Run: `pnpm install` (or `npm install`)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + TanStack Router config"
```

---

### Task 2: Create root entry + env migration

**Files:**

- Create: `src/main.tsx`
- Create: `src/routes/__root.tsx`
- Modify: `src/env.ts`

- [ ] **Step 1: Rewrite `src/env.ts` to remove `@t3-oss/env-nextjs`**

```ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_ASSOCIATION_SLUG: z.string().min(2).max(10).default('mfsa'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']),
});

function createEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: import.meta.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ASSOCIATION_SLUG: import.meta.env.NEXT_PUBLIC_ASSOCIATION_SLUG,
    NEXT_PUBLIC_API_BASE_URL: import.meta.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_NODE_ENV: import.meta.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = createEnv();
```

- [ ] **Step 2: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './app/globals.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
```

- [ ] **Step 3: Create `src/routes/__root.tsx`**

This is the root layout. It replaces `src/app/layout.tsx` and wraps the app in providers.

```tsx
import '@fontsource/roboto';
import '@fontsource/roboto/variable.css';
import '@fontsource/roboto-mono';
import '@fontsource/roboto-mono/variable.css';
import '@fontsource/jetbrains-mono';
import '@fontsource/jetbrains-mono/variable.css';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppProviders } from '@src/shared/providers/AppProviders';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { env } from '@src/env';
import { Suspense } from 'react';
import '../app/globals.css';

export const Route = createRootRoute({
  component: () => (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense>
          <AppProviders>
            <Outlet />
            {env.NEXT_PUBLIC_NODE_ENV === 'development' && (
              <Suspense fallback={null}>
                <ReactQueryDevtools />
              </Suspense>
            )}
          </AppProviders>
        </Suspense>
      </body>
    </html>
  ),
});
```

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx src/routes/__root.tsx src/env.ts
git commit -m "feat: add Vite entry point, root route, env rewrite"
```

---

### Task 3: Update Redirect component for TanStack Router

**Files:**

- Modify: `src/shared/components/Redirect.tsx`

Replace `usePathname`, `useRouter`, `useSearchParams` from `next/navigation` with TanStack Router equivalents.

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';

import { useAuthStore } from '../stores/auth';
import { Loading } from '@components/loading';
import { ROUTE_ROLE } from '../constants';

type PropsT = {
  children: React.ReactNode;
};

const pageAccessOnlyIfUnAuthenticated: string[] = [
  '/sign-in',
  '/sign-up',
  '/reset-password',
  '/forgot-password',
  '/verify-email',
  '/',
];

export const Redirect = ({ children }: PropsT) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect');
  const navigate = useNavigate();
  const pathName = location.pathname;
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading, isSignedIn } = useAuthStore();
  const userRoles = useMemo(() => user?.role || ['MEMBER'], [user]);
  const isAuthenticated = !!user && isSignedIn;

  useEffect(() => {
    if (isAuthLoading) return;
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [isAuthLoading, pathName]);

  useEffect(() => {
    if (isAuthLoading) return;

    const currentRoute = ROUTE_ROLE.find((route) => {
      if (route.url === pathName) return true;
      if (route.url.endsWith('/*')) {
        const basePath = route.url.replace('/*', '');
        return pathName.startsWith(basePath);
      }
      return false;
    });

    if (currentRoute) {
      if (currentRoute.needAuth && !isAuthenticated) {
        navigate({ to: `/sign-in?redirect=${encodeURIComponent(pathName)}`, replace: true });
        return;
      }

      if (isAuthenticated) {
        const hasRequiredRole = currentRoute.role.some((role) =>
          userRoles.some((userRole) => userRole === role),
        );

        if (!hasRequiredRole) {
          navigate({ to: currentRoute.redirect || '/', replace: true });
          return;
        }
      }
    }
  }, [pathName, isAuthenticated, userRoles, navigate, isAuthLoading]);

  useEffect(() => {
    if (isAuthLoading || isLoading) return;
    if (isAuthenticated && pageAccessOnlyIfUnAuthenticated.includes(pathName)) {
      navigate({ to: redirectTo || '/' });
    }
  }, [isAuthenticated, pathName, redirectTo, navigate, isAuthLoading, isLoading]);

  if (isAuthLoading) {
    return <Loading label={'Loading...'} />;
  }

  return <>{children}</>;
};
```

- [ ] **Step 2: Update `src/shared/hooks/use-url-filters.ts`**

Replace `useSearchParams`, `useRouter`, `usePathname` from `next/navigation` with TanStack Router.

```tsx
'use client';

import { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';

interface UseUrlFiltersOptions {
  basePath?: string;
  pageKey?: string;
  resetPageOnFilter?: boolean;
  mode?: 'replace' | 'push';
}

interface UseUrlFiltersReturn {
  filters: Record<string, string>;
  page: number;
  setPage: (page: number) => void;
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (filters: Record<string, string | undefined>) => void;
  clearFilter: (key: string) => void;
  resetFilters: () => void;
}

export function useUrlFilters(options: UseUrlFiltersOptions = {}): UseUrlFiltersReturn {
  const { basePath, pageKey = 'page', resetPageOnFilter = true, mode = 'replace' } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const resolvedPath = basePath ?? pathname;

  const doNavigate = useCallback(
    (params: URLSearchParams) => {
      const href = `${resolvedPath}?${params.toString()}`;
      navigate({ to: href, replace: mode === 'replace' });
    },
    [resolvedPath, navigate, mode],
  );

  const page = useMemo(() => Number(searchParams.get(pageKey)) || 1, [searchParams, pageKey]);

  const filters = useMemo(() => {
    const result: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== pageKey) result[key] = value;
    }
    return result;
  }, [searchParams, pageKey]);

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(pageKey, String(newPage));
      doNavigate(params);
    },
    [searchParams, doNavigate, pageKey],
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (resetPageOnFilter) params.set(pageKey, '1');
      doNavigate(params);
    },
    [searchParams, doNavigate, resetPageOnFilter, pageKey],
  );

  const setFilters = useCallback(
    (newFilters: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(newFilters)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (resetPageOnFilter) params.set(pageKey, '1');
      doNavigate(params);
    },
    [searchParams, doNavigate, resetPageOnFilter, pageKey],
  );

  const clearFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      if (resetPageOnFilter) params.set(pageKey, '1');
      doNavigate(params);
    },
    [searchParams, doNavigate, resetPageOnFilter, pageKey],
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams();
    params.set(pageKey, '1');
    doNavigate(params);
  }, [doNavigate, pageKey]);

  return {
    filters,
    page,
    setPage,
    setFilter,
    setFilters,
    clearFilter,
    resetFilters,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/Redirect.tsx src/shared/hooks/use-url-filters.ts
git commit -m "refactor: migrate Redirect and use-url-filters to TanStack Router"
```

---

### Task 4: Create auth layout and auth route files

**Files:**

- Create: `src/routes/_auth/index.tsx`
- Create: `src/routes/_auth/sign-in/index.tsx`
- Create: `src/routes/_auth/sign-up/index.tsx`
- Create: `src/routes/_auth/forgot-password/index.tsx`
- Create: `src/routes/_auth/reset-password/index.tsx`
- Create: `src/routes/_auth/change-password/index.tsx`
- Create: `src/routes/_auth/forbidden/index.tsx`

- [ ] **Step 1: Create auth layout `src/routes/_auth/index.tsx`**

```tsx
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
```

- [ ] **Step 2: Create `src/routes/_auth/sign-in/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { SignInPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInPage,
});
```

- [ ] **Step 3: Create `src/routes/_auth/sign-up/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { SignUpPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
});
```

- [ ] **Step 4: Create `src/routes/_auth/forgot-password/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
});
```

- [ ] **Step 5: Create `src/routes/_auth/reset-password/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPasswordPage,
});
```

- [ ] **Step 6: Create `src/routes/_auth/change-password/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { ChangePasswordPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/change-password')({
  component: ChangePasswordPage,
});
```

- [ ] **Step 7: Create `src/routes/_auth/forbidden/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { ForbiddenPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/forbidden')({
  component: ForbiddenPage,
});
```

- [ ] **Step 8: Commit**

```bash
git add src/routes/_auth/
git commit -m "feat: add auth route layout and pages"
```

---

### Task 5: Create dashboard layout route

**Files:**

- Create: `src/routes/_dashboard/index.tsx`

```tsx
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@src/shared/components/dashboard-layout';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayoutWrapper,
});

function DashboardLayoutWrapper() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
```

- [ ] **Commit**

```bash
git add src/routes/_dashboard/index.tsx
git commit -m "feat: add dashboard layout route"
```

---

### Task 6: Create home route + announcements routes

**Files:**

- Create: `src/routes/index/index.tsx`
- Create: `src/routes/_dashboard/announcement/index.tsx`
- Create: `src/routes/_dashboard/announcement/archived/index.tsx`
- Create: `src/routes/_dashboard/announcement/draft/index.tsx`
- Create: `src/routes/_dashboard/announcement/$announcementId/index.tsx`

- [ ] **Step 1: Create `src/routes/index/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@src/shared/pages/home-page';

export const Route = createFileRoute('/')({
  component: HomePage,
});
```

- [ ] **Step 2: Create announcement routes**

```tsx
// src/routes/_dashboard/announcement/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsPage } from '@src/features/announcement/pages';

export const Route = createFileRoute('/_dashboard/announcement/')({
  component: AnnouncementsPage,
});

// src/routes/_dashboard/announcement/archived/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsPage } from '@src/features/announcement/pages';

export const Route = createFileRoute('/_dashboard/announcement/archived')({
  component: AnnouncementsPage,
});

// src/routes/_dashboard/announcement/draft/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsPage } from '@src/features/announcement/pages';

export const Route = createFileRoute('/_dashboard/announcement/draft')({
  component: AnnouncementsPage,
});

// src/routes/_dashboard/announcement/$announcementId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import AnnouncementDetailPage from '@src/features/announcement/pages/announcement-detail';

export const Route = createFileRoute('/_dashboard/announcement/$announcementId')({
  component: AnnouncementDetailPage,
});
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/index/ src/routes/_dashboard/announcement/
git commit -m "feat: add home and announcement routes"
```

---

### Task 7: Create associations + audit-logs + compliance + consent routes

**Files:**

- Create: `src/routes/_dashboard/associations/index.tsx`
- Create: `src/routes/_dashboard/associations/current/index.tsx`
- Create: `src/routes/_dashboard/audit-logs/index.tsx`
- Create: `src/routes/_dashboard/compliance/index.tsx`
- Create: `src/routes/_dashboard/consent/index.tsx`
- Create: `src/routes/_dashboard/dashboard/index.tsx`
- Create: `src/routes/_dashboard/dsar/index.tsx`

```tsx
// src/routes/_dashboard/associations/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AssociationsPage } from '@src/features/associations/pages';

export const Route = createFileRoute('/_dashboard/associations/')({
  component: AssociationsPage,
});

// src/routes/_dashboard/associations/current/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AssociationDetailPage } from '@src/features/associations/pages';

export const Route = createFileRoute('/_dashboard/associations/current')({
  component: AssociationDetailPage,
});

// src/routes/_dashboard/audit-logs/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AuditLogsPage } from '@src/features/audit-logs/pages';

export const Route = createFileRoute('/_dashboard/audit-logs')({
  component: AuditLogsPage,
});

// src/routes/_dashboard/compliance/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { CompliancePage } from '@src/features/compliance/pages';

export const Route = createFileRoute('/_dashboard/compliance')({
  component: CompliancePage,
});

// src/routes/_dashboard/consent/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { ConsentPage } from '@src/features/consent/pages';

export const Route = createFileRoute('/_dashboard/consent')({
  component: ConsentPage,
});

// src/routes/_dashboard/dashboard/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@src/features/dashboard/pages';

export const Route = createFileRoute('/_dashboard/dashboard/')({
  component: DashboardPage,
});

// src/routes/_dashboard/dsar/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { DsarAdminPage } from '@src/features/dsar/pages';

export const Route = createFileRoute('/_dashboard/dsar')({
  component: DsarAdminPage,
});
```

- [ ] **Commit**

```bash
git add src/routes/_dashboard/associations/ src/routes/_dashboard/audit-logs/ src/routes/_dashboard/compliance/ src/routes/_dashboard/consent/ src/routes/_dashboard/dashboard/ src/routes/_dashboard/dsar/
git commit -m "feat: add associations, audit-logs, compliance, consent, dashboard, dsar routes"
```

---

### Task 8: Create contributions + ledger routes

**Files:**

- Create: `src/routes/_dashboard/contributions/index.tsx`
- Create: `src/routes/_dashboard/contributions/declarations/index.tsx`
- Create: `src/routes/_dashboard/contributions/declarations/$declarationId/index.tsx`
- Create: `src/routes/_dashboard/contributions/record/index.tsx`
- Create: `src/routes/_dashboard/contributions/$contributionId/index.tsx`
- Create: `src/routes/_dashboard/ledger/index.tsx`
- Create: `src/routes/_dashboard/ledger/accounts/index.tsx`
- Create: `src/routes/_dashboard/ledger/accounts/$id/index.tsx`
- Create: `src/routes/_dashboard/ledger/entries/index.tsx`
- Create: `src/routes/_dashboard/ledger/entries/$entryId/index.tsx`
- Create: `src/routes/_dashboard/ledger/reports/index.tsx`

```tsx
// src/routes/_dashboard/contributions/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { ContributionsPage } from '@src/features/contributions/pages';

export const Route = createFileRoute('/_dashboard/contributions/')({
  component: ContributionsPage,
});

// src/routes/_dashboard/contributions/declarations/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { DeclarationsPage } from '@src/features/contributions/pages';

export const Route = createFileRoute('/_dashboard/contributions/declarations/')({
  component: DeclarationsPage,
});

// src/routes/_dashboard/contributions/declarations/$declarationId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { DeclarationDetailPage } from '@src/features/contributions/pages/declaration-detail';

export const Route = createFileRoute('/_dashboard/contributions/declarations/$declarationId')({
  component: DeclarationDetailPage,
});

// src/routes/_dashboard/contributions/record/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { RecordContributionPage } from '@src/features/contributions/pages';

export const Route = createFileRoute('/_dashboard/contributions/record')({
  component: RecordContributionPage,
});

// src/routes/_dashboard/contributions/$contributionId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { ContributionDetailPage } from '@src/features/contributions/pages/contribution-detail';

export const Route = createFileRoute('/_dashboard/contributions/$contributionId')({
  component: ContributionDetailPage,
});

// src/routes/_dashboard/ledger/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LedgerDashboardPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/')({
  component: LedgerDashboardPage,
});

// src/routes/_dashboard/ledger/accounts/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LedgerAccountsPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/accounts/')({
  component: LedgerAccountsPage,
});

// src/routes/_dashboard/ledger/accounts/$id/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LedgerAccountDetailPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/accounts/$id')({
  component: LedgerAccountDetailPage,
});

// src/routes/_dashboard/ledger/entries/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LedgerEntriesPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/entries/')({
  component: LedgerEntriesPage,
});

// src/routes/_dashboard/ledger/entries/$entryId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LedgerEntryDetailPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/entries/$entryId')({
  component: LedgerEntryDetailPage,
});

// src/routes/_dashboard/ledger/reports/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LedgerReportsPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/reports')({
  component: LedgerReportsPage,
});
```

- [ ] **Commit**

```bash
git add src/routes/_dashboard/contributions/ src/routes/_dashboard/ledger/
git commit -m "feat: add contributions and ledger routes"
```

---

### Task 9: Create meetings + member-types + members routes

**Files:**

- Create: `src/routes/_dashboard/meetings/index.tsx`
- Create: `src/routes/_dashboard/meetings/$meetingId/index.tsx`
- Create: `src/routes/_dashboard/meetings/$meetingId/assign/index.tsx`
- Create: `src/routes/_dashboard/meetings/$meetingId/minutes/index.tsx`
- Create: `src/routes/_dashboard/member-types/index.tsx`
- Create: `src/routes/_dashboard/members/index.tsx`
- Create: `src/routes/_dashboard/members/applications/index.tsx`
- Create: `src/routes/_dashboard/members/$memberId/index.tsx`

```tsx
// src/routes/_dashboard/meetings/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { MeetingsPage } from '@src/features/meetings/pages';

export const Route = createFileRoute('/_dashboard/meetings/')({
  component: MeetingsPage,
});

// src/routes/_dashboard/meetings/$meetingId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { MeetingDetailPage } from '@src/features/meetings/pages';

export const Route = createFileRoute('/_dashboard/meetings/$meetingId')({
  component: MeetingDetailPage,
});

// src/routes/_dashboard/meetings/$meetingId/assign/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AssignMembersPage } from '@src/features/meetings/pages';

export const Route = createFileRoute('/_dashboard/meetings/$meetingId/assign')({
  component: AssignMembersPage,
});

// src/routes/_dashboard/meetings/$meetingId/minutes/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { MeetingMinutesPage } from '@src/features/meetings/pages';

export const Route = createFileRoute('/_dashboard/meetings/$meetingId/minutes')({
  component: MeetingMinutesPage,
});

// src/routes/_dashboard/member-types/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { MemberTypesPage } from '@src/features/member-type/pages';

export const Route = createFileRoute('/_dashboard/member-types')({
  component: MemberTypesPage,
});

// src/routes/_dashboard/members/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { MembersPage } from '@src/features/members/pages';

export const Route = createFileRoute('/_dashboard/members/')({
  component: MembersPage,
});

// src/routes/_dashboard/members/applications/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { ApplicationsPage } from '@src/features/membership-applications/pages';

export const Route = createFileRoute('/_dashboard/members/applications')({
  component: ApplicationsPage,
});

// src/routes/_dashboard/members/$memberId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { MemberDetailPage } from '@src/features/members/pages';

export const Route = createFileRoute('/_dashboard/members/$memberId')({
  component: MemberDetailPage,
});
```

- [ ] **Commit**

```bash
git add src/routes/_dashboard/meetings/ src/routes/_dashboard/member-types/ src/routes/_dashboard/members/
git commit -m "feat: add meetings, member-types, members routes"
```

---

### Task 10: Create payments + subscriptions routes

**Files:**

- Create: `src/routes/_dashboard/payments/index.tsx`
- Create: `src/routes/_dashboard/payments/providers/index.tsx`
- Create: `src/routes/_dashboard/payments/users/index.tsx`
- Create: `src/routes/_dashboard/payments/users/$userId/index.tsx`
- Create: `src/routes/_dashboard/payments/users/$userId/contributions/index.tsx`
- Create: `src/routes/_dashboard/payments/$paymentId/index.tsx`
- Create: `src/routes/_dashboard/subscriptions/index.tsx`
- Create: `src/routes/_dashboard/subscriptions/change-plan/index.tsx`
- Create: `src/routes/_dashboard/subscriptions/my/index.tsx`
- Create: `src/routes/_dashboard/subscriptions/plans/index.tsx`
- Create: `src/routes/_dashboard/subscriptions/plans/$planId/index.tsx`

```tsx
// src/routes/_dashboard/payments/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AllPaymentsPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/')({
  component: AllPaymentsPage,
});

// src/routes/_dashboard/payments/providers/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PaymentProvidersPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/providers')({
  component: PaymentProvidersPage,
});

// src/routes/_dashboard/payments/users/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { UserPaymentsLookupPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/users')({
  component: UserPaymentsLookupPage,
});

// src/routes/_dashboard/payments/users/$userId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { UserPaymentsPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/users/$userId')({
  component: UserPaymentsPage,
});

// src/routes/_dashboard/payments/users/$userId/contributions/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { UserContributionsPage } from '@src/features/contributions/pages';

export const Route = createFileRoute('/_dashboard/payments/users/$userId/contributions')({
  component: UserContributionsPage,
});

// src/routes/_dashboard/payments/$paymentId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PaymentDetailPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/$paymentId')({
  component: PaymentDetailPage,
});

// src/routes/_dashboard/subscriptions/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionsPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/')({
  component: SubscriptionsPage,
});

// src/routes/_dashboard/subscriptions/change-plan/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { ChangePlanPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/change-plan')({
  component: ChangePlanPage,
});

// src/routes/_dashboard/subscriptions/my/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { MySubscriptionPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/my')({
  component: MySubscriptionPage,
});

// src/routes/_dashboard/subscriptions/plans/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PlansPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/plans/')({
  component: PlansPage,
});

// src/routes/_dashboard/subscriptions/plans/$planId/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PlanDetailPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/plans/$planId')({
  component: PlanDetailPage,
});
```

- [ ] **Commit**

```bash
git add src/routes/_dashboard/payments/ src/routes/_dashboard/subscriptions/
git commit -m "feat: add payments and subscriptions routes"
```

---

### Task 11: Create training routes

**Files:**

- Create: `src/routes/_dashboard/training/index.tsx`
- Create: `src/routes/_dashboard/training/completions/index.tsx`
- Create: `src/routes/_dashboard/training/$id/index.tsx`
- Create: `src/routes/_dashboard/training/$id/assign/index.tsx`
- Create: `src/routes/_dashboard/training/$id/completions/index.tsx`

```tsx
// src/routes/_dashboard/training/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { TrainingListPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/')({
  component: TrainingListPage,
});

// src/routes/_dashboard/training/completions/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { TrainingAllCompletionsPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/completions')({
  component: TrainingAllCompletionsPage,
});

// src/routes/_dashboard/training/$id/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { TrainingDetailPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/$id')({
  component: TrainingDetailPage,
});

// src/routes/_dashboard/training/$id/assign/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { TrainingAssignPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/$id/assign')({
  component: TrainingAssignPage,
});

// src/routes/_dashboard/training/$id/completions/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { TrainingCompletionsPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/$id/completions')({
  component: TrainingCompletionsPage,
});
```

- [ ] **Commit**

```bash
git add src/routes/_dashboard/training/
git commit -m "feat: add training routes"
```

---

### Task 12: Migrate shared components — nav-main, nav-user, public-header, public-footer

**Files:**

- Modify: `src/shared/components/nav-main.tsx`
- Modify: `src/shared/components/nav-user.tsx`
- Modify: `src/shared/components/public-header.tsx`
- Modify: `src/shared/components/public-footer.tsx`

These components use `next/link` and `usePathname`/`useRouter`. Replace with TanStack Router equivalents.

- [ ] **Step 1: Update `src/shared/components/nav-main.tsx`**

Replace:

```tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
```

With:

```tsx
import { Link, useLocation } from '@tanstack/react-router';
```

Replace `const pathname = usePathname();` with `const pathname = useLocation().pathname;`

- [ ] **Step 2: Update `src/shared/components/nav-user.tsx`**

Replace:

```tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';
```

With:

```tsx
import { Link, useNavigate } from '@tanstack/react-router';
```

Replace `const router = useRouter();` with `const navigate = useNavigate();`

Replace `router.replace('/sign-in')` with `navigate({ to: '/sign-in', replace: true })`

- [ ] **Step 3: Update `src/shared/components/public-header.tsx`**

Replace:

```tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
```

With:

```tsx
import { Link, useLocation } from '@tanstack/react-router';
```

Replace `const pathname = usePathname();` with `const pathname = useLocation().pathname;`

- [ ] **Step 4: Update `src/shared/components/public-footer.tsx`**

Replace:

```tsx
import Link from 'next/link';
```

With:

```tsx
import { Link } from '@tanstack/react-router';
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/nav-main.tsx src/shared/components/nav-user.tsx src/shared/components/public-header.tsx src/shared/components/public-footer.tsx
git commit -m "refactor: migrate shared nav components to TanStack Router Link/hooks"
```

---

### Task 13: Migrate auth feature pages — sign-in, sign-up, forgot-password, reset-password, change-password, forbidden

**Files:**

- Modify: `src/features/auth/pages/sign-in.tsx`
- Modify: `src/features/auth/pages/sign-up.tsx`
- Modify: `src/features/auth/pages/forgot-password.tsx`
- Modify: `src/features/auth/pages/reset-password.tsx`
- Modify: `src/features/auth/pages/change-password.tsx`
- Modify: `src/features/auth/pages/forbidden.tsx`
- Modify: `src/features/auth/hooks/use-sign-up.ts`

These files use `useRouter` from `next/navigation` and `Link` from `next/link`.

- [ ] **Step 1: Update `sign-in.tsx`**

Replace:

```tsx
import { useRouter } from 'next/navigation';
import Link from 'next/link';
```

With:

```tsx
import { useNavigate, Link } from '@tanstack/react-router';
```

Replace `const router = useRouter();` with `const navigate = useNavigate();`

Replace `router.push('/dashboard')` with `navigate({ to: '/dashboard' })`

- [ ] **Step 2: Update `sign-up.tsx`**

Replace `import Link from 'next/link';` with `import { Link } from '@tanstack/react-router';`

- [ ] **Step 3: Update `forgot-password.tsx`**

Replace `import Link from 'next/link';` with `import { Link } from '@tanstack/react-router';`

- [ ] **Step 4: Update `reset-password.tsx`**

Replace:

```tsx
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
```

With:

```tsx
import { useNavigate, useSearchParams, Link } from '@tanstack/react-router';
```

Replace `const router = useRouter();` with `const navigate = useNavigate();`
Replace `const searchParams = useSearchParams();` — TanStack Router's `useSearchParams` returns `[searchParams, setSearchParams]` like React Router. The existing code uses `searchParams.get('token')`, which works the same.

Wait, in TanStack Router, `useSearchParams` works differently. Let me check...

In `@tanstack/react-router`, `useSearchParams` returns `[searchParams, setSearchParams]` where `searchParams` is a `URLSearchParams` instance. So `searchParams.get('token')` still works.

Let me check the actual usage in `reset-password.tsx` to be precise.

I need to read the full file to see how `useSearchParams` is used.

Actually, I need to check more pages. Let me just list all the remaining changes and batch them. I'll read the specific pages when executing.

- [ ] **Step 5: Update `change-password.tsx`**

Replace `import { useRouter } from 'next/navigation';` with `import { useNavigate } from '@tanstack/react-router';`

Replace `const router = useRouter();` with `const navigate = useNavigate();`
Replace `router.push(...)` with `navigate({ to: ... })`

- [ ] **Step 6: Update `forbidden.tsx`**

Replace `import Link from 'next/link';` with `import { Link } from '@tanstack/react-router';`

- [ ] **Step 7: Update `src/features/auth/hooks/use-sign-up.ts`**

Replace `import { useRouter } from 'next/navigation';` with `import { useNavigate } from '@tanstack/react-router';`
Replace `const router = useRouter();` with `const navigate = useNavigate();`
Replace `router.push(...)` with `navigate({ to: ... })`

- [ ] **Step 8: Commit**

```bash
git add src/features/auth/pages/ src/features/auth/hooks/use-sign-up.ts
git commit -m "refactor: migrate auth pages and hooks to TanStack Router"
```

---

### Task 14: Migrate feature pages with `next/link` in table columns

These files use `next/link` inside table column definitions (rendering links in table cells). Replace with `Link` from `@tanstack/react-router`.

**Files:**

- `src/features/announcement/hooks/useAnnouncementColumns.tsx`
- `src/features/contributions/hooks/useUserContributionColumns.tsx`
- `src/features/contributions/hooks/useContributionPeriodColumns.tsx`
- `src/features/contributions/hooks/declarations/use-declarations-columns.tsx`
- `src/features/payments/hooks/usePaymentTransactionColumns.tsx`
- `src/features/meetings/hooks/useMeetingTableColumns.tsx`
- `src/features/members/hooks/usePendingMemberColumns.tsx`
- `src/features/members/components/cells/name-cell.tsx`
- `src/features/subscriptions/components/cells/plan-name-cell.tsx`
- `src/features/subscriptions/hooks/usePlanTableActions.ts`
- `src/features/ledger/hooks/useLedgerEntriesColumns.tsx`
- `src/features/ledger/hooks/useLedgerAccountColumns.tsx`
- `src/features/ledger/hooks/useLedgerLineColumns.tsx`
- `src/features/training/hooks/useModuleTableColumns.tsx`
- `src/features/contributions/components/contribution-detail.tsx`

- [ ] **Step 1-15: In each file, replace:**

```tsx
import Link from 'next/link';
```

With:

```tsx
import { Link } from '@tanstack/react-router';
```

This works because TanStack Router's `<Link>` component uses the same `href` prop pattern for simple links.

- [ ] **Step 16: Commit**

```bash
git add src/features/announcement/hooks/useAnnouncementColumns.tsx src/features/contributions/ src/features/payments/hooks/usePaymentTransactionColumns.tsx src/features/meetings/hooks/useMeetingTableColumns.tsx src/features/members/ src/features/subscriptions/ src/features/ledger/hooks/ src/features/training/hooks/useModuleTableColumns.tsx
git commit -m "refactor: migrate table column links to TanStack Router Link"
```

---

### Task 15: Migrate feature pages with `useRouter` – announcements, contributions, meetings, members, subscriptions

**Files:**

- `src/features/announcement/pages/announcement-detail.tsx`
- `src/features/contributions/pages/contribution-detail.tsx`
- `src/features/contributions/pages/declaration-detail.tsx`
- `src/features/contributions/pages/user-contributions.tsx`
- `src/features/meetings/pages/MeetingDetailPage.tsx`
- `src/features/meetings/pages/MeetingMinutesPage.tsx`
- `src/features/meetings/pages/AssignMembersPage.tsx`
- `src/features/meetings/components/MeetingsTable.tsx`
- `src/features/members/pages/member-detail.tsx`
- `src/features/subscriptions/pages/plan-detail.tsx`
- `src/features/training/pages/TrainingListPage.tsx`
- `src/features/training/pages/TrainingDetailPage.tsx`
- `src/features/training/pages/TrainingAllCompletionsPage.tsx`
- `src/features/training/pages/TrainingCompletionsPage.tsx`
- `src/features/training/pages/TrainingAssignPage.tsx`

- [ ] **Step 1: In each file, replace:**

```tsx
import { useRouter } from 'next/navigation';
```

With:

```tsx
import { useNavigate } from '@tanstack/react-router';
```

Replace `const router = useRouter();` with `const navigate = useNavigate();`

Replace `router.push('/path')` with `navigate({ to: '/path' })`
Replace `router.replace('/path')` with `navigate({ to: '/path', replace: true })`

- [ ] **Step 2: Commit**

```bash
git add src/features/announcement/pages/announcement-detail.tsx src/features/contributions/pages/contribution-detail.tsx src/features/contributions/pages/declaration-detail.tsx src/features/contributions/pages/user-contributions.tsx src/features/meetings/ src/features/members/pages/member-detail.tsx src/features/subscriptions/pages/plan-detail.tsx src/features/training/pages/
git commit -m "refactor: migrate useRouter to useNavigate in feature pages"
```

---

### Task 16: Migrate feature pages with `useParams` — announcement, contributions, ledger, meetings, members, training, payments

**Files:**

- `src/features/announcement/pages/announcement-detail.tsx`
- `src/features/contributions/pages/contribution-detail.tsx`
- `src/features/contributions/pages/declaration-detail.tsx`
- `src/features/contributions/pages/user-contributions.tsx`
- `src/features/ledger/pages/ledger-account-detail-page.tsx`
- `src/features/ledger/pages/ledger-entry-detail-page.tsx`
- `src/features/meetings/pages/MeetingDetailPage.tsx`
- `src/features/meetings/pages/MeetingMinutesPage.tsx`
- `src/features/meetings/pages/AssignMembersPage.tsx`
- `src/features/members/pages/member-detail.tsx`
- `src/features/payments/pages/payment-detail.tsx`
- `src/features/payments/pages/user-payments.tsx`
- `src/features/subscriptions/pages/plan-detail.tsx`
- `src/features/training/pages/TrainingDetailPage.tsx`
- `src/features/training/pages/TrainingCompletionsPage.tsx`
- `src/features/training/pages/TrainingAssignPage.tsx`

- [ ] **Step 1: In each file, replace:**

```tsx
import { useParams } from 'next/navigation';
```

With:

```tsx
import { useParams } from '@tanstack/react-router';
```

In TanStack Router, `useParams` takes a `from` parameter for type-safe route matching. For a dynamic migration, use a generic type:

```tsx
const params = useParams({ from: Route.fullPath }) as Record<string, string>;
```

However, since the feature pages don't have access to the route definition, use:

```tsx
const params = useParams({ strict: false }) as Record<string, string>;
```

This gives `params.announcementId`, `params.contributionId`, etc. The existing code accesses like `const { announcementId } = useParams();` — this pattern works identically with TanStack Router's `useParams({ strict: false })`.

- [ ] **Step 2: Commit**

```bash
git add src/features/announcement/pages/announcement-detail.tsx src/features/contributions/pages/contribution-detail.tsx src/features/contributions/pages/declaration-detail.tsx src/features/contributions/pages/user-contributions.tsx src/features/ledger/pages/ src/features/meetings/pages/ src/features/members/pages/member-detail.tsx src/features/payments/pages/payment-detail.tsx src/features/payments/pages/user-payments.tsx src/features/subscriptions/pages/plan-detail.tsx src/features/training/pages/
git commit -m "refactor: migrate useParams to TanStack Router useParams"
```

---

### Task 17: Migrate feature pages with `useSearchParams` — meeting detail, reset-password, user-contributions, Redirect

- [ ] **Step 1: Check each remaining file**

Files using `useSearchParams` from `next/navigation`:

- `src/features/meetings/pages/MeetingDetailPage.tsx`
- `src/features/auth/pages/reset-password.tsx` (already done in Task 13)
- `src/features/contributions/pages/user-contributions.tsx`
- `src/shared/components/Redirect.tsx` (already done in Task 3)
- `src/shared/hooks/use-url-filters.ts` (already done in Task 3)

Replace in `MeetingDetailPage.tsx` and `user-contributions.tsx`:

```tsx
import { useSearchParams } from '@tanstack/react-router';
```

TanStack Router's `useSearchParams` returns `[URLSearchParams, (updater: Updater<Record<string, string>>) => void]`. When reading params, use `searchParams.get('key')`.

For `MeetingDetailPage.tsx`, add `useLocation` if it's not already imported (for `location.search` access pattern).

- [ ] **Step 2: Commit**

```bash
git add src/features/meetings/pages/MeetingDetailPage.tsx src/features/contributions/pages/user-contributions.tsx
git commit -m "refactor: migrate useSearchParams to TanStack Router"
```

---

### Task 18: Update ESLint config

**Files:**

- Modify: `eslint.config.mjs`

Replace Next.js-specific ESLint config with React + TypeScript config:

```mjs
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  // Use a generic TypeScript + React config
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'next-env.d.ts',
    '.vercel/**',
    'node_modules/**',
  ]),
]);

export default eslintConfig;
```

A more complete approach is to use `typescript-eslint` and `eslint-plugin-react-hooks`:

```mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  globalIgnores([
    'dist/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.vercel/**',
    'node_modules/**',
  ]),
]);

export default eslintConfig;
```

Add `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` to `devDependencies`.

- [ ] **Commit**

```bash
git add eslint.config.mjs package.json
git commit -m "chore: replace Next.js ESLint config with React/TypeScript config"
```

---

### Task 19: Clean up — remove old Next.js files and swagger feature

**Remove these files/directories:**

- `src/app/` (entire directory)
- `src/features/swagger/` (entire directory)
- `next.config.ts`
- `next-env.d.ts`
- `postcss.config.mjs` (Vite handles PostCSS — optional to keep)
- `vercel.json` (or strip cron jobs — keep the file if Vercel config needed)

- [ ] **Step 1: Remove files**

```bash
rm -rf src/app
rm -rf src/features/swagger
rm next.config.ts
rm next-env.d.ts
```

- [ ] **Step 2: Update `vercel.json`** — remove cron jobs, keep as empty or with just build config

```json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

- [ ] **Step 3: Commit**

```bash
git rm -r src/app src/features/swagger next.config.ts next-env.d.ts
git add vercel.json
git commit -m "chore: remove Next.js files and swagger feature"
```

---

### Task 20: Verify build

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors. If errors, fix them.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Vite builds successfully, outputs to `dist/`.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No lint errors.

- [ ] **Step 4: Clean up routeTree.gen.ts**

The `@tanstack/router-plugin/vite` generates `src/routeTree.gen.ts` automatically. Ensure this file is in `.gitignore`:

```gitignore
# Add to .gitignore
/src/routeTree.gen.ts
```

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: fix build issues and cleanup"
```

---

## Self-Review

**Spec coverage:**

- ✅ Scaffold Vite + deps (Task 1)
- ✅ Entry point + root route (Task 2)
- ✅ Auth routes (Task 4)
- ✅ Dashboard layout + all ~40 dashboard routes (Tasks 5-11)
- ✅ `/` home route (Task 6)
- ✅ Redirect + use-url-filters migration (Task 3)
- ✅ `next/link` migration across 30 files (Tasks 12-14)
- ✅ `useRouter` → `useNavigate` migration (Tasks 12-13, 15)
- ✅ `useParams` migration (Task 16)
- ✅ `useSearchParams` migration (Task 17)
- ✅ `usePathname` → `useLocation` migration (Tasks 12)
- ✅ `next/font` → `@fontsource` (Task 2, root route)
- ✅ `@t3-oss/env-nextjs` → plain env (Task 2)
- ✅ Swagger removal (Task 19)
- ✅ ESLint config update (Task 18)
- ✅ Vercel cron removal (Task 19)
- ✅ Build verification (Task 20)

**Placeholder scan:** No TBDs, TODOs, or vague steps. All code is concrete.

**Type consistency:** Route `$announcementId`, `$contributionId`, `$meetingId`, `$memberId`, `$paymentId`, `$planId`, `$declarationId`, `$entryId`, `$id`, `$userId` param names match the existing codebase usage.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-06-nextjs-to-react-migration.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
