# Dashboard Feature Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Dashboard page from the app router to a feature module for better modularity.

**Architecture:** Move page logic to `src/features/dashboard/pages/DashboardPage.tsx`, export via barrel index, and update `src/app/(dashboard)/dashboard/page.tsx` as a thin wrapper.

**Tech Stack:** React, Next.js, TanStack Query, Zod, shadcn/ui.

---

### Task 1: Create Dashboard Feature Page

**Files:**

- Create: `src/features/dashboard/pages/DashboardPage.tsx`

- [ ] **Step 1: Create the DashboardPage component with JSDoc**

```tsx
'use client';

import { useDashboard } from '@src/shared/hooks/use-dashboard';
import { SectionHeader } from '@src/shared/components/section-header';
import { StatsCards } from '@src/shared/components/dashboard/stats-cards';
import { RevenueAreaChart } from '@src/shared/components/dashboard/revenue-area-chart';
import { MemberBarChart } from '@src/shared/components/dashboard/member-bar-chart';
import { RevenueLineChart } from '@src/shared/components/dashboard/revenue-line-chart';
import { PaymentPieChart } from '@src/shared/components/dashboard/payment-pie-chart';
import { RolesRadarChart } from '@src/shared/components/dashboard/roles-radar-chart';
import { RecentPaymentsTable } from '@src/shared/components/dashboard/recent-payments-table';
import { DashboardSkeleton } from '@src/shared/components/dashboard/dashboard-skeleton';

/**
 * Main dashboard page component.
 * Fetches and displays association analytics and overview stats.
 */
export function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Dashboard" description="Association analytics and overview" />
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-ink">Failed to load dashboard</h2>
          <p className="mt-2 text-sm text-body">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-active"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" description="Association analytics and overview" />

      <StatsCards stats={data.stats} />

      <RevenueAreaChart data={data.revenueOverTime} />

      <div className="grid gap-4 md:grid-cols-2">
        <MemberBarChart data={data.memberGrowth} />
        <RevenueLineChart revenueData={data.revenueOverTime} memberData={data.memberGrowth} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PaymentPieChart data={data.paymentMethodDistribution} />
        <RolesRadarChart data={data.memberRoleDistribution} />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">Recent Payments</h2>
        <RecentPaymentsTable payments={data.recentPayments} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/pages/DashboardPage.tsx
git commit -m "feat(dashboard): move dashboard logic to feature page"
```

### Task 2: Create Barrel Export

**Files:**

- Create: `src/features/dashboard/pages/index.ts`

- [ ] **Step 1: Export DashboardPage from index**

```ts
export * from './DashboardPage';
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/pages/index.ts
git commit -m "feat(dashboard): add barrel export for dashboard pages"
```

### Task 3: Refactor App Route

**Files:**

- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace content with thin wrapper**

```tsx
'use client';

import { DashboardPage } from '@feature/dashboard/pages';

/**
 * Dashboard route page.
 * Thin wrapper that imports and renders the DashboardPage from the feature module.
 */
export default function DashboardPageRoute() {
  return <DashboardPage />;
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build` (or `next build`)
Expected: SUCCESS

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/dashboard/page.tsx
git commit -m "refactor(dashboard): convert dashboard route to thin wrapper"
```
