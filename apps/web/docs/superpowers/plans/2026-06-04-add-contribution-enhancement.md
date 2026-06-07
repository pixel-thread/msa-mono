# Add Contribution Page Enhancement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the Add Contribution page with a govt-portal-style UI — collapsible member profile card, contribution statistics panel, and enhanced payment summary bar.

**Architecture:** 4 new leaf components extracted from the page, each with a single responsibility. No new API endpoints or data fetching. All data comes from the existing `useUserContributions` hook. The page orchestrates visibility and wires data to each component.

**Tech Stack:** Next.js 14 App Router, React 19, shadcn/ui (Collapsible, Badge, Progress, Card), Tailwind CSS, Radix UI primitives

---

## File Structure

### New Files

| File                                                                  | Responsibility                                                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/features/contributions/components/contribution-status-badge.tsx` | Renders a `<Badge>` with contribution-specific color mapping (PAID→green, PARTIAL→blue, DUE→yellow, OVERDUE→red, WAIVED→gray) |
| `src/features/contributions/components/member-profile-card.tsx`       | Collapsible card showing member name, email, membership#, and 3 stat mini-cards (periods count, total paid, compliance rate)  |
| `src/features/contributions/components/contribution-stats-panel.tsx`  | Collapsible panel with summary stat cards, status breakdown badges, compliance progress bar, and recent period list           |
| `src/features/contributions/components/payment-summary-bar.tsx`       | Extracted from page, enhanced with itemized list of selected periods below the stat cards                                     |

### Modified Files

| File                                                                | Change                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/features/contributions/hooks/useUserContributionColumns.tsx`   | Replace `getStatusBadge` with `ContributionStatusBadge` component  |
| `src/features/contributions/hooks/useContributionPeriodColumns.tsx` | Replace `getStatusBadge` with `ContributionStatusBadge` component  |
| `src/features/contributions/pages/add-contribution.tsx`             | Import and wire new components; replace inline summary bar section |
| `src/features/contributions/components/index.ts`                    | Add exports for 4 new components                                   |

---

### Task 1: Contribution Status Badge Component

**Files:**

- Create: `src/features/contributions/components/contribution-status-badge.tsx`

- [ ] **Write the ContributionStatusBadge component**

```tsx
'use client';

import { Badge } from '@components/ui/badge';
import { cn } from '@src/shared/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Paid', className: 'text-green-600 bg-green-50 border-green-200' },
  PARTIAL: { label: 'Partial', className: 'text-blue-600 bg-blue-50 border-blue-200' },
  DUE: { label: 'Due', className: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  OVERDUE: { label: 'Overdue', className: 'text-red-600 bg-red-50 border-red-200' },
  WAIVED: { label: 'Waived', className: 'text-gray-500 bg-gray-50 border-gray-200' },
};

interface ContributionStatusBadgeProps {
  status: string;
}

export function ContributionStatusBadge({ status }: ContributionStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'text-muted-foreground' };

  return (
    <Badge
      variant="outline"
      className={cn('rounded px-1.5 py-0.5 border text-[10px]', config.className)}
    >
      {config.label}
    </Badge>
  );
}
```

---

### Task 2: Member Profile Card Component

**Files:**

- Create: `src/features/contributions/components/member-profile-card.tsx`

- [ ] **Write the MemberProfileCard component**

```tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@components/ui/collapsible';
import { formattedAmount } from '@src/shared/utils';
import { ChevronDown, ChevronRight, User, Mail, Fingerprint } from 'lucide-react';
import type { ContributionSummary } from '../types';

interface MemberProfileCardProps {
  name: string;
  email: string;
  membershipNumber: string | null;
  userId: string;
  summary: ContributionSummary | null;
  totalPeriods: number;
}

export function MemberProfileCard({
  name,
  email,
  membershipNumber,
  userId,
  summary,
  totalPeriods,
}: MemberProfileCardProps) {
  const [open, setOpen] = useState(false);

  const paidMonths = summary?.paidMonths ?? 0;
  const partialMonths = summary?.partialMonths ?? 0;
  const overdueMonths = summary?.overdueMonths ?? 0;
  const waivedMonths = summary?.waivedMonths ?? 0;
  const resolvedMonths = paidMonths + partialMonths + overdueMonths + waivedMonths;
  const complianceRate = resolvedMonths > 0 ? Math.round((paidMonths / resolvedMonths) * 100) : 0;

  return (
    <Card className="border-hairline bg-surface-card">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Member Profile
            </span>
          </div>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-ink">{name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {email}
                  </div>
                  {membershipNumber && (
                    <Badge variant="secondary" className="text-[10px]">
                      <Fingerprint className="h-3 w-3 mr-0.5" />#{membershipNumber}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ID: {userId.slice(0, 8)}...
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded border border-hairline bg-canvas p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Periods
                  </p>
                  <p className="text-xl font-bold text-ink mt-0.5">{totalPeriods}</p>
                </div>
                <div className="rounded border border-hairline bg-canvas p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Total Paid
                  </p>
                  <p className="text-xl font-bold text-green-600 mt-0.5">
                    {formattedAmount(summary?.totalPaid ?? 0)}
                  </p>
                </div>
                <div className="rounded border border-hairline bg-canvas p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Compliance
                  </p>
                  <p className="text-xl font-bold text-ink mt-0.5">{complianceRate}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
```

---

### Task 3: Contribution Statistics Panel Component

**Files:**

- Create: `src/features/contributions/components/contribution-stats-panel.tsx`

- [ ] **Write the ContributionStatsPanel component**

```tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@components/ui/collapsible';
import { formattedAmount } from '@src/shared/utils';
import { getMonthName } from '@src/shared/utils/helper/get-month-name';
import { ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { ContributionStatusBadge } from './contribution-status-badge';
import type { ContributionPeriod, ContributionSummary } from '../types';

interface ContributionStatsPanelProps {
  summary: ContributionSummary | null;
  contributions: ContributionPeriod[];
}

export function ContributionStatsPanel({ summary, contributions }: ContributionStatsPanelProps) {
  const [open, setOpen] = useState(false);

  if (!summary) return null;

  const paidMonths = summary.paidMonths;
  const partialMonths = summary.partialMonths;
  const overdueMonths = summary.overdueMonths;
  const waivedMonths = summary.waivedMonths;
  const resolvedMonths = paidMonths + partialMonths + overdueMonths + waivedMonths;
  const complianceRate = resolvedMonths > 0 ? Math.round((paidMonths / resolvedMonths) * 100) : 0;

  const recentPeriods = [...contributions]
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .slice(0, 6);

  return (
    <Card className="border-hairline bg-surface-card">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Contribution Statistics
            </span>
          </div>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded border border-hairline bg-canvas p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Expected
                </p>
                <p className="text-xl font-bold text-ink mt-0.5">
                  {formattedAmount(summary.totalExpected)}
                </p>
              </div>
              <div className="rounded border border-hairline bg-canvas p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Paid
                </p>
                <p className="text-xl font-bold text-green-600 mt-0.5">
                  {formattedAmount(summary.totalPaid)}
                </p>
              </div>
              <div className="rounded border border-hairline bg-canvas p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Due
                </p>
                <p className="text-xl font-bold text-red-600 mt-0.5">
                  {formattedAmount(summary.totalDue)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Status Breakdown
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-green-600 bg-green-50 border-green-200"
                >
                  Paid {paidMonths}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-blue-600 bg-blue-50 border-blue-200"
                >
                  Partial {partialMonths}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-yellow-600 bg-yellow-50 border-yellow-200"
                >
                  Due {contributions.filter((c) => c.status === 'DUE').length}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-red-600 bg-red-50 border-red-200"
                >
                  Overdue {overdueMonths}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-gray-500 bg-gray-50 border-gray-200"
                >
                  Waived {waivedMonths}
                </Badge>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Payment Compliance
                </p>
                <span className="text-xs font-semibold">{complianceRate}%</span>
              </div>
              <Progress value={complianceRate} className="h-2" />
            </div>

            {recentPeriods.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Recent Periods
                </p>
                <div className="space-y-1">
                  {recentPeriods.map((period) => (
                    <div
                      key={period.id}
                      className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50"
                    >
                      <span className="text-sm text-ink">
                        {getMonthName(period.month)} {period.year}
                      </span>
                      <ContributionStatusBadge status={period.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
```

---

### Task 4: Payment Summary Bar Component

**Files:**

- Create: `src/features/contributions/components/payment-summary-bar.tsx`

- [ ] **Write the PaymentSummaryBar component**

```tsx
'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { formattedAmount } from '@src/shared/utils';
import { getMonthName } from '@src/shared/utils/helper/get-month-name';
import { Loader2 } from 'lucide-react';
import { ContributionStatusBadge } from './contribution-status-badge';
import type { ContributionPeriod, ContributionSummary } from '../types';

interface PaymentSummaryBarProps {
  selectedPeriods: ContributionPeriod[];
  selectedTotal: number;
  summary: ContributionSummary | null;
  isAdding: boolean;
  onSubmit: () => void;
}

export function PaymentSummaryBar({
  selectedPeriods,
  selectedTotal,
  summary,
  isAdding,
  onSubmit,
}: PaymentSummaryBarProps) {
  if (selectedPeriods.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="pt-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Selected Periods</p>
            <p className="text-3xl font-bold tracking-tight">{selectedPeriods.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Due (All)</p>
            <p className="text-3xl font-bold tracking-tight text-destructive">
              {formattedAmount(summary?.totalDue ?? 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Paying Today</p>
            <p className="text-3xl font-bold tracking-tight text-green-600">
              {formattedAmount(selectedTotal)}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-hairline pt-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Selected Periods Breakdown
          </p>
          <div className="space-y-1">
            {selectedPeriods.map((period) => (
              <div
                key={period.id}
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink">
                    {getMonthName(period.month)} {period.year}
                  </span>
                  <ContributionStatusBadge status={period.status} />
                </div>
                <span className="text-sm font-medium text-red-600">
                  {formattedAmount(parseInt(period.dueAmount, 10))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button size="lg" onClick={onSubmit} disabled={isAdding}>
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay {formattedAmount(selectedTotal)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Task 5: Wire Components into the Page

**Files:**

- Modify: `src/features/contributions/pages/add-contribution.tsx`

- [ ] **Update imports and integrate components**

Replace the full file content:

```tsx
'use client';
import { DataTable } from '@src/shared/components/data-table';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { MemberCombobox } from '@src/shared/components/members/member-combobox';
import { SectionHeader } from '@src/shared/components/section-header';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ContributionPeriod } from '../types';
import { useUserContributionColumns } from '../hooks/useUserContributionColumns';
import z from 'zod';
import { toast } from 'sonner';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@hooks/use-url-filters';
import { Card, CardContent } from '@components/ui/card';
import { useUserContributions } from '../hooks';
import { Loader2 } from 'lucide-react';
import { ENDPOINTS } from '@repo/shared';
import { MemberProfileCard } from '../components/member-profile-card';
import { ContributionStatsPanel } from '../components/contribution-stats-panel';
import { PaymentSummaryBar } from '../components/payment-summary-bar';

const AddMemberContributionSchema = z.object({
  userId: z.uuid(),
  contributionPeriodIds: z.array(z.uuid()),
  amount: z
    .string()
    .refine((value) => {
      const amount = parseFloat(value);
      return !isNaN(amount);
    })
    .regex(/^\d+(\.\d{1,2})?$/)
    .min(1),
});

type AddMemberContributionInput = z.infer<typeof AddMemberContributionSchema>;

export const AddContributionPage = () => {
  const [selectedPeriods, setSelectedPeriods] = useState<ContributionPeriod[]>([]);
  const [userId, setUserId] = useState<string>('');

  const selectedTotal = useMemo(
    () => selectedPeriods.reduce((acc, period) => acc + parseInt(period.dueAmount, 10), 0),
    [selectedPeriods],
  );

  const handleRowCheckChange = (data: ContributionPeriod[]) => {
    setSelectedPeriods(data);
  };

  const { columns } = useUserContributionColumns({
    onCheck: (value) => handleRowCheckChange(value),
    checkValues: selectedPeriods,
  });

  const queryClient = useQueryClient();

  const { setPage, page } = useUrlFilters({
    basePath: '/contributions/add-contribution',
  });

  const {
    contributions = [],
    meta,
    summary,
    refetch,
    user,
  } = useUserContributions({ page, userId });

  const { mutate: addUserContribution, isPending: isAdding } = useMutation({
    mutationFn: (data: AddMemberContributionInput) =>
      http.post(ENDPOINTS.CONTRIBUTION.CREATE_PAYMENT, data),
  });

  const genContribution = useMutation({
    mutationFn: (id: string) => http.post(ENDPOINTS.CONTRIBUTION.USER(id), {}),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Contributions generated successfully');
        queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
        refetch();
      }
    },
  });

  const onSubmit = () => {
    if (selectedPeriods.length === 0) {
      toast.error('Please select at least one contribution period');
      return;
    }

    addUserContribution(
      {
        userId,
        contributionPeriodIds: selectedPeriods.map((p) => p.id),
        amount: selectedTotal.toString(),
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success('Contributions added successfully');
            queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
            genContribution.mutate(userId);
            setSelectedPeriods([]);
            return;
          }
          toast.error(data.message || 'Failed to add contributions');
        },
      },
    );
  };

  function onMemberChange(value: string) {
    setSelectedPeriods([]);
    setUserId(value);
  }

  return (
    <div className="space-y-6 flex-col flex">
      <SectionHeader title="Add Member Contributions" />
      <Card className="p-4">
        <MemberCombobox value={userId} onValueChange={onMemberChange} />
      </Card>

      {userId && user && (
        <MemberProfileCard
          name={user.name}
          email={user.email}
          membershipNumber={user.membershipNumber}
          userId={userId}
          summary={summary}
          totalPeriods={contributions.length}
        />
      )}

      {summary && <ContributionStatsPanel summary={summary} contributions={contributions} />}

      <PaymentSummaryBar
        selectedPeriods={selectedPeriods}
        selectedTotal={selectedTotal}
        summary={summary}
        isAdding={isAdding}
        onSubmit={onSubmit}
      />

      <div className="flex justify-end items-center">
        <Button
          disabled={genContribution.isPending || !userId}
          variant="outline"
          onClick={() => genContribution.mutate(userId)}
        >
          {genContribution.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate All Contributions Months
        </Button>
      </div>

      <DataTable data={contributions || []} columns={columns} />
      <DataTablePagination onPageChange={setPage} meta={meta} />
    </div>
  );
};
```

- [ ] **Remove the old inline summary bar section** (lines 117-146 of the old file) — handled by the rewrite above replacing the entire `<Card>...</Card>` block with `<PaymentSummaryBar />`.

---

### Task 6: Update Data Table Status Badges

**Files:**

- Modify: `src/features/contributions/hooks/useUserContributionColumns.tsx`
- Modify: `src/features/contributions/hooks/useContributionPeriodColumns.tsx`

Both column hooks currently render status via `getStatusBadge(row.original.status)` from the shared utils helper. Replace with the `ContributionStatusBadge` component for contribution-specific colors.

- [ ] **Update `useUserContributionColumns.tsx`**

Replace the import:

```tsx
import { getStatusBadge } from '@src/shared/utils/helper/get-status-badge';
```

with:

```tsx
import { ContributionStatusBadge } from '../components/contribution-status-badge';
```

And in the `columns` array, replace the status cell:

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => getStatusBadge(row.original.status),
},
```

with:

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => <ContributionStatusBadge status={row.original.status} />,
},
```

- [ ] **Update `useContributionPeriodColumns.tsx`**

Replace the import:

```tsx
import { getStatusBadge } from '@src/shared/utils/helper/get-status-badge';
```

with:

```tsx
import { ContributionStatusBadge } from '../components/contribution-status-badge';
```

Replace the status cell:

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => getStatusBadge(row.original.status),
},
```

with:

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => <ContributionStatusBadge status={row.original.status} />,
},
```

---

### Task 7: Update Barrel Exports

**Files:**

- Modify: `src/features/contributions/components/index.ts`

- [ ] **Add new component exports**

```tsx
export * from './contribution-detail';
export * from './manual-contribution-dialog';
export * from './contribution-status-badge';
export * from './member-profile-card';
export * from './contribution-stats-panel';
export * from './payment-summary-bar';
```

---

### Task 8: Verify Build

- [ ] **Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Run Next.js build**

```bash
npx next build
```

Expected: Build succeeds, all routes compile.
