# Retroactive Affected Users Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a retroactive affected users page under `/contributions/retroactive` that allows searching by plan version or date range.

**Architecture:** New route + page component with filter controls (plan version selector OR date range inputs). Two new hooks: `usePlanVersions` (shared, fetches versions for a selected plan) and `useRetroactiveAffectedUsers` (POST-based query for affected users). Columns show user details, amounts, and contribution period info.

**Tech Stack:** TypeScript, TanStack Query, TanStack Table/DataTable, TanStack Router

---

### Task 1: Create `usePlanVersions` hook

**Files:**

- Create: `apps/web/src/features/plans/hooks/use-plan-versions.ts`
- Create: `apps/web/src/features/plans/hooks/index.ts` (if missing)

**Context:** The `PLANS.PLAN_VERSIONS` endpoint already exists as a function `(id: string) => \`/plans/${id}/versions\``and`PLANS_KEYS.PLAN_VERSION`already exists as`(id: string) => ['plan', 'version', id]`. The `PlanVersion`type already exists in`src/features/plans/types/index.ts`.

- [ ] **Step 1: Create the hook file**

Write `src/features/plans/hooks/use-plan-versions.ts`:

```typescript
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { PlanVersion } from '../types';

export function usePlanVersions(planId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PLANS_KEYS.PLAN_VERSION(planId),
    queryFn: () => http.get<PlanVersion[]>(ENDPOINTS.PLANS.PLAN_VERSIONS(planId)),
    enabled: !!planId,
  });

  return {
    planVersions: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
```

- [ ] **Step 2: Create/update plans hooks barrel export**

Write `src/features/plans/hooks/index.ts`:

```typescript
export * from './use-plan-versions';
export * from './use-plan-version-columns';
export * from './use-plans';
export * from './use-plan';
export * from './use-create-plan';
export * from './use-delete-plan';
export * from './use-update-plan';
export * from './use-set-default-plan';
export * from './use-plan-table-actions';
export * from './use-plan-table-columns';
```

(Check which hooks exist — include only existing ones + the new one)

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit` from `apps/web/`
Expected: No type errors

---

### Task 2: Create `useRetroactiveAffectedUsers` hook

**Files:**

- Create: `apps/web/src/features/contributions/hooks/use-retroactive-affected-users.ts`

**Context:** The endpoint `CONTRIBUTION.RETROACTIVE_USERS` already exists as `/contributions/retroactive/affected-users`. The query key `CONTRIBUTIONS_KEYS.RETROACTIVE_USERS` exists as a static array. The types `RetroactiveAdjustmentRecord`, `RetroactiveAdjustment`, `RetroActiveUser` exist in `src/features/contributions/types/retro-active.ts`.

- [ ] **Step 1: Create the hook**

Write `src/features/contributions/hooks/use-retroactive-affected-users.ts`:

```typescript
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { RetroactiveAdjustmentRecord } from '../types/retro-active';

interface RetroactiveAffectedUsersFilters {
  planVersionId?: string;
  startDate?: string;
  endDate?: string;
}

export function useRetroactiveAffectedUsers(filters: RetroactiveAffectedUsersFilters) {
  const { planVersionId, startDate, endDate } = filters;
  const hasFilters = !!(planVersionId || (startDate && endDate));

  const body: Record<string, string> = {};
  if (planVersionId) body.planVersionId = planVersionId;
  if (startDate) body.startDate = startDate;
  if (endDate) body.endDate = endDate;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      ...QUERY_KEYS.CONTRIBUTIONS_KEYS.RETROACTIVE_USERS,
      planVersionId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      http.post<RetroactiveAdjustmentRecord[]>(ENDPOINTS.CONTRIBUTION.RETROACTIVE_USERS, body),
    enabled: hasFilters,
  });

  return {
    records: data?.data ?? [],
    isLoading,
    error,
    refetch,
  };
}
```

Note: The `RETROACTIVE_USERS` query key is currently `['retroactive-users'].filter(Boolean)` which returns the array. We spread it and add the filter params as deps.

---

### Task 3: Create retroactive affected users columns hook

**Files:**

- Create: `apps/web/src/features/contributions/hooks/use-retroactive-affected-users-columns.tsx`

- [ ] **Step 1: Create the columns hook**

Write `src/features/contributions/hooks/use-retroactive-affected-users-columns.tsx`:

```typescript
'use client';

import { Badge } from '@src/shared/components/ui/badge';
import { formatDate, formattedAmount } from '@src/shared/utils';
import { type ColumnDef } from '@tanstack/react-table';

import type { RetroactiveAdjustmentRecord } from '../types/retro-active';

export function useRetroactiveAffectedUsersColumns(): {
  columns: ColumnDef<RetroactiveAdjustmentRecord>[];
} {
  const columns: ColumnDef<RetroactiveAdjustmentRecord>[] = [
    {
      id: 'userName',
      header: 'Name',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-ink">
          {row.original.user.firstName} {row.original.user.lastName ?? ''}
        </span>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.user.email}</span>
      ),
    },
    {
      id: 'designation',
      header: 'Designation',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.user.designation}</span>
      ),
    },
    {
      id: 'contributionPeriod',
      header: 'Period',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.contributionPeriod?.period ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'previousExpectedAmount',
      header: 'Previous Amount',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formattedAmount(Number(row.original.previousExpectedAmount))}
        </span>
      ),
    },
    {
      accessorKey: 'newExpectedAmount',
      header: 'New Amount',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-ink">
          {formattedAmount(Number(row.original.newExpectedAmount))}
        </span>
      ),
    },
    {
      accessorKey: 'adjustmentAmount',
      header: 'Adjustment',
      cell: ({ row }) => {
        const amount = Number(row.original.adjustmentAmount);
        return (
          <Badge variant={amount >= 0 ? 'default' : 'destructive'}>
            {amount >= 0 ? '+' : ''}{formattedAmount(amount)}
          </Badge>
        );
      },
    },
    {
      id: 'effectiveDates',
      header: 'Effective',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.retroactiveAdjustment.effectiveFrom)} — {formatDate(row.original.retroactiveAdjustment.effectiveTo)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
  ];

  return { columns };
}
```

---

### Task 4: Create Retroactive page component

**Files:**

- Create: `apps/web/src/features/contributions/pages/retroactive.tsx`

- [ ] **Step 1: Create the page**

Write `src/features/contributions/pages/retroactive.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { DataTable } from '@src/shared/components/data-table';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import { Input } from '@src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import { Card } from '@src/shared/components/ui/card';

import { useRetroactiveAffectedUsers } from '../hooks/use-retroactive-affected-users';
import { useRetroactiveAffectedUsersColumns } from '../hooks/use-retroactive-affected-users-columns';
import { usePlans } from '@src/features/plans/hooks/use-plans';
import { usePlanVersions } from '@src/features/plans/hooks/use-plan-versions';

type SearchMode = 'planVersion' | 'dateRange';

export default function RetroactivePage() {
  const [searchMode, setSearchMode] = useState<SearchMode>('planVersion');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchFilters, setSearchFilters] = useState<{
    planVersionId?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const { plans } = usePlans();
  const { planVersions } = usePlanVersions(selectedPlanId);
  const { records, isLoading } = useRetroactiveAffectedUsers(searchFilters);
  const { columns } = useRetroactiveAffectedUsersColumns();

  const handleSearch = () => {
    if (searchMode === 'planVersion' && selectedVersionId) {
      setSearchFilters({ planVersionId: selectedVersionId });
    } else if (searchMode === 'dateRange' && startDate && endDate) {
      setSearchFilters({ startDate, endDate });
    }
  };

  const handleReset = () => {
    setSelectedPlanId('');
    setSelectedVersionId('');
    setStartDate('');
    setEndDate('');
    setSearchFilters({});
  };

  const hasSearched = !!(searchFilters.planVersionId || (searchFilters.startDate && searchFilters.endDate));

  return (
    <>
      <SectionHeader
        title="Retroactive Affected Users"
        description="View users affected by retroactive adjustments"
      />

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={searchMode === 'planVersion' ? 'default' : 'outline'}
            onClick={() => { setSearchMode('planVersion'); handleReset(); }}
            className="h-10"
          >
            By Plan Version
          </Button>
          <Button
            variant={searchMode === 'dateRange' ? 'default' : 'outline'}
            onClick={() => { setSearchMode('dateRange'); handleReset(); }}
            className="h-10"
          >
            By Date Range
          </Button>
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          {searchMode === 'planVersion' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Plan</label>
                <Select value={selectedPlanId} onValueChange={(v) => { setSelectedPlanId(v); setSelectedVersionId(''); }}>
                  <SelectTrigger className="w-[240px] h-10">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Version</label>
                <Select
                  value={selectedVersionId}
                  onValueChange={setSelectedVersionId}
                  disabled={!selectedPlanId}
                >
                  <SelectTrigger className="w-[240px] h-10">
                    <SelectValue placeholder={selectedPlanId ? 'Select a version' : 'Select a plan first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {planVersions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.effectiveFrom} — {v.effectiveTo ?? 'Present'} ({formattedAmount(v.amount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 w-[200px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 w-[200px]"
                />
              </div>
            </>
          )}

          <Button onClick={handleSearch} className="h-10" disabled={searchMode === 'planVersion' ? !selectedVersionId : !(startDate && endDate)}>
            Search
          </Button>
          {hasSearched && (
            <Button variant="outline" onClick={handleReset} className="h-10">
              Reset
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6">
        {hasSearched ? (
          <DataTable columns={columns} data={records} loading={isLoading} />
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Select a plan version or date range and click Search to view affected users.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
```

Note: This uses `formattedAmount` which should be imported. Check the existing import — it comes from `@src/shared/utils`.

---

### Task 5: Update barrel exports and create route

**Files:**

- Modify: `apps/web/src/features/contributions/hooks/index.ts`
- Modify: `apps/web/src/features/contributions/pages/index.ts`
- Create: `apps/web/src/routes/_dashboard/contributions/retroactive/index.tsx`

- [ ] **Step 1: Update contributions hooks barrel**

Modify `src/features/contributions/hooks/index.ts` — add exports:

```typescript
export * from './use-retroactive-affected-users';
export * from './use-retroactive-affected-users-columns';
```

Add at the end of the existing file.

- [ ] **Step 2: Update contributions pages barrel**

Modify `src/features/contributions/pages/index.ts` — add:

```typescript
export { default as RetroactivePage } from './retroactive';
```

Add after existing exports.

- [ ] **Step 3: Create route file**

Create `src/routes/_dashboard/contributions/retroactive/index.tsx`:

```typescript
import { RetroactivePage } from '@src/features/contributions/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/contributions/retroactive/')({
  component: RetroactivePage,
});
```

---

### Task 6: Verify everything builds

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit` from `apps/web/`
Expected: No type errors

- [ ] **Step 2: Build**

Run: `npm run build` or `npx next build` from `apps/web/` (check package.json for the right command)
Expected: Build succeeds

---

### Self-Review

1. **Spec coverage:**
   - Route at `/contributions/retroactive` ✓
   - Table showing affected users ✓
   - Search by plan version ID ✓
   - Search by date from/to ✓
   - Shared `usePlanVersions` hook ✓
   - Uses `retro-active.ts` types ✓

2. **Placeholder scan:** No TBD/TODO/fill-in-later patterns.

3. **Type consistency:**
   - `usePlanVersions` returns `planVersions: PlanVersion[]` — matches existing `PlanVersion` type
   - `useRetroactiveAffectedUsers` returns `records: RetroactiveAdjustmentRecord[]` — matches type
   - Columns use correct accessor keys matching `RetroactiveAdjustmentRecord` fields
