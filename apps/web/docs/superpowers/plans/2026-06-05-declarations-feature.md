# Declarations Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a declarations list page with table/filters/approve-reject actions and a declaration detail page.

**Architecture:** Add a `declarations/` feature slice under the existing `contributions` feature module. Two page components (list + detail), data hooks using TanStack Query, approve/reject dialogs with remark fields, and TanStack Table columns. Route files already exist as empty shells.

**Tech Stack:** Next.js App Router, TypeScript, TanStack Query v5, TanStack Table v8, shadcn/ui, Axios HTTP client, sonner toasts.

---

## File Structure

### New files to create:
- `src/features/contributions/hooks/declarations/use-declarations.ts` — hook for list query
- `src/features/contributions/hooks/declarations/use-declaration-detail.ts` — hook for single declaration query
- `src/features/contributions/hooks/declarations/use-declaration-mutations.ts` — approve/reject mutations
- `src/features/contributions/hooks/declarations/use-declarations-columns.tsx` — table column defs with action buttons
- `src/features/contributions/components/declarations/approve-dialog.tsx` — approve dialog with remark
- `src/features/contributions/components/declarations/reject-dialog.tsx` — reject dialog with remark
- `src/features/contributions/pages/declarations.tsx` — list page component
- `src/features/contributions/pages/declaration-detail.tsx` — detail page component

### Files to modify:
- `src/features/contributions/types/index.ts` — add `Declaration` type
- `src/features/contributions/utils/constants/endpoints.ts` — add declaration endpoints
- `src/features/contributions/hooks/index.ts` — re-export declaration hooks
- `src/features/contributions/pages/index.ts` — export declaration pages
- `src/app/(dashboard)/contributions/declarations/page.tsx` — wire list page
- `src/app/(dashboard)/contributions/declarations/[declarationId]/page.tsx` — wire detail page

---

### Task 1: Add Declaration type

**Files:**
- Modify: `src/features/contributions/types/index.ts`

- [x] **Step: Add DeclarationResponse type**

Append to `src/features/contributions/types/index.ts`:

```typescript
export interface DeclarationMember {
  name: string;
  email: string;
  mobile: string;
}

export interface Declaration {
  id: string;
  memberId: string;
  associationId: string;
  declerationStartDate: string;
  declerationEndDate: string;
  amount: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  lastDeclarationDate: string | null;
  reviewBy: string | null;
  reviewAt: string | null;
  remark: string | null;
  member: DeclarationMember;
}
```

---

### Task 2: Add declaration endpoints

**Files:**
- Modify: `src/features/contributions/utils/constants/endpoints.ts`

- [x] **Step: Append declaration endpoints**

Add to `src/features/contributions/utils/constants/endpoints.ts`:

```typescript
export const declarationEndpoints = {
  list: '/declarations' as const,
  byId: (id: string) => `/declarations/${id}`,
  approve: (id: string) => `/declarations/${id}/approve`,
  reject: (id: string) => `/declarations/${id}/reject`,
} as const;
```

---

### Task 3: Create useDeclarations hook (list query)

**Files:**
- Write: `src/features/contributions/hooks/declarations/use-declarations.ts`

- [x] **Step: Write the hook**

```typescript
import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Declaration } from '../../types';
import { declarationEndpoints } from '../../utils/constants/endpoints';

interface UseDeclarationsOptions {
  page?: number;
  status?: string;
  search?: string;
}

export function useDeclarations(options: UseDeclarationsOptions = {}) {
  const { page = 1, status, search } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  if (status) params.set('status', status);
  if (search) params.set('search', search);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['declarations', params.toString()],
    queryFn: () => http.get<Declaration[]>(`${declarationEndpoints.list}?${params.toString()}`),
  });

  return {
    declarations: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
```

---

### Task 4: Create useDeclarationDetail hook

**Files:**
- Write: `src/features/contributions/hooks/declarations/use-declaration-detail.ts`

- [x] **Step: Write the hook**

```typescript
import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Declaration } from '../../types';
import { declarationEndpoints } from '../../utils/constants/endpoints';

export function useDeclarationDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['declaration', id],
    queryFn: () => http.get<Declaration>(declarationEndpoints.byId(id)),
    enabled: !!id,
  });

  return {
    declaration: data?.data ?? null,
    isLoading,
    error,
  };
}
```

---

### Task 5: Create approve/reject mutation hooks

**Files:**
- Write: `src/features/contributions/hooks/declarations/use-declaration-mutations.ts`

- [x] **Step: Write the mutations**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { toast } from 'sonner';
import { declarationEndpoints } from '../../utils/constants/endpoints';

export function useApproveDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
      http.post(declarationEndpoints.approve(id), { remark }),
    onSuccess: () => {
      toast.success('Declaration approved successfully');
      queryClient.invalidateQueries({ queryKey: ['declarations'] });
    },
    onError: () => {
      toast.error('Failed to approve declaration');
    },
  });
}

export function useRejectDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
      http.post(declarationEndpoints.reject(id), { remark }),
    onSuccess: () => {
      toast.success('Declaration rejected');
      queryClient.invalidateQueries({ queryKey: ['declarations'] });
    },
    onError: () => {
      toast.error('Failed to reject declaration');
    },
  });
}
```

---

### Task 6: Create table columns with approve/reject action buttons

**Files:**
- Write: `src/features/contributions/hooks/declarations/use-declarations-columns.tsx`

- [x] **Step: Write the columns hook**

```typescript
'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { formatDate } from '@src/shared/utils';
import type { Declaration } from '../../types';
import Link from 'next/link';

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  APPROVED: 'default',
  PENDING: 'secondary',
  REJECTED: 'destructive',
};

interface UseDeclarationsColumnsOptions {
  onApprove?: (declaration: Declaration) => void;
  onReject?: (declaration: Declaration) => void;
}

export function useDeclarationsColumns({
  onApprove,
  onReject,
}: UseDeclarationsColumnsOptions = {}) {
  const columns: ColumnDef<Declaration>[] = [
    {
      accessorKey: 'member.name',
      header: 'Member',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/contributions/declarations/${row.original.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {row.original.member.name}
          </Link>
          <span className="text-xs text-muted-foreground">{row.original.member.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'member.mobile',
      header: 'Mobile',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.member.mobile}</span>
      ),
    },
    {
      id: 'period',
      header: 'Period',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm">{formatDate(row.original.declerationStartDate)}</span>
          <span className="text-xs text-muted-foreground">
            to {formatDate(row.original.declerationEndDate)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.amount}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant[row.original.status] ?? 'outline'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => onApprove?.(row.original)}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onReject?.(row.original)}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return { columns };
}
```

---

### Task 7: Create Approve dialog with remark field

**Files:**
- Create directory: `src/features/contributions/components/declarations/`
- Write: `src/features/contributions/components/declarations/approve-dialog.tsx`

- [x] **Step: Write the ApproveDialog component**

```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/components/ui/dialog';
import { Button } from '@src/shared/components/ui/button';
import { Label } from '@src/shared/components/ui/label';
import { Textarea } from '@src/shared/components/ui/textarea';
import { useApproveDeclaration } from '../../hooks/declarations/use-declaration-mutations';
import type { Declaration } from '../../types';

interface ApproveDialogProps {
  declaration: Declaration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveDialog({ declaration, open, onOpenChange }: ApproveDialogProps) {
  const [remark, setRemark] = useState('');
  const approveDeclaration = useApproveDeclaration();

  const handleApprove = () => {
    if (!declaration) return;
    approveDeclaration.mutate(
      { id: declaration.id, remark: remark.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRemark('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Approve Declaration</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve the declaration from{' '}
            <span className="font-medium">{declaration?.member.name}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="border border-hairline bg-surface-soft p-4 rounded-md space-y-2">
          <p className="text-sm text-ink">
            <span className="font-medium">Amount:</span> {declaration?.amount}
          </p>
          <p className="text-sm text-ink">
            <span className="font-medium">Period:</span>{' '}
            {declaration?.declerationStartDate
              ? new Date(declaration.declerationStartDate).toLocaleDateString()
              : '-'}{' '}
            to{' '}
            {declaration?.declerationEndDate
              ? new Date(declaration.declerationEndDate).toLocaleDateString()
              : '-'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="approve-remark">Remark (Optional)</Label>
          <Textarea
            id="approve-remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add a remark for this approval..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={approveDeclaration.isPending}
          >
            {approveDeclaration.isPending ? 'Approving...' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Task 8: Create Reject dialog with remark field

**Files:**
- Write: `src/features/contributions/components/declarations/reject-dialog.tsx`

- [x] **Step: Write the RejectDialog component**

```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/components/ui/dialog';
import { Button } from '@src/shared/components/ui/button';
import { Label } from '@src/shared/components/ui/label';
import { Textarea } from '@src/shared/components/ui/textarea';
import { useRejectDeclaration } from '../../hooks/declarations/use-declaration-mutations';
import type { Declaration } from '../../types';

interface RejectDialogProps {
  declaration: Declaration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectDialog({ declaration, open, onOpenChange }: RejectDialogProps) {
  const [remark, setRemark] = useState('');
  const rejectDeclaration = useRejectDeclaration();

  const handleReject = () => {
    if (!declaration) return;
    rejectDeclaration.mutate(
      { id: declaration.id, remark: remark.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRemark('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Reject Declaration</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject the declaration from{' '}
            <span className="font-medium">{declaration?.member.name}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="border border-hairline bg-surface-soft p-4 rounded-md space-y-2">
          <p className="text-sm text-ink">
            <span className="font-medium">Amount:</span> {declaration?.amount}
          </p>
          <p className="text-sm text-ink">
            <span className="font-medium">Period:</span>{' '}
            {declaration?.declerationStartDate
              ? new Date(declaration.declerationStartDate).toLocaleDateString()
              : '-'}{' '}
            to{' '}
            {declaration?.declerationEndDate
              ? new Date(declaration.declerationEndDate).toLocaleDateString()
              : '-'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reject-remark">Remark</Label>
          <Textarea
            id="reject-remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Provide a reason for rejection..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={rejectDeclaration.isPending}
          >
            {rejectDeclaration.isPending ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Task 9: Create Declarations list page

**Files:**
- Write: `src/features/contributions/pages/declarations.tsx`

- [x] **Step: Write the list page component**

```typescript
'use client';

import { useState } from 'react';
import { useUrlFilters } from '@src/shared/hooks';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { useDeclarations } from '../hooks/declarations/use-declarations';
import { useDeclarationsColumns } from '../hooks/declarations/use-declarations-columns';
import { ApproveDialog } from '../components/declarations/approve-dialog';
import { RejectDialog } from '../components/declarations/reject-dialog';
import type { Declaration } from '../types';

export default function DeclarationsPage() {
  const { filters, page, setPage, setFilters } = useUrlFilters({
    basePath: '/contributions/declarations',
  });

  const [approveTarget, setApproveTarget] = useState<Declaration | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Declaration | null>(null);

  const { declarations, meta, isLoading } = useDeclarations({
    page,
    ...filters,
  });

  const { columns } = useDeclarationsColumns({
    onApprove: (declaration) => setApproveTarget(declaration),
    onReject: (declaration) => setRejectTarget(declaration),
  });

  return (
    <>
      <SectionHeader
        title="Declarations"
        description="View and manage member declarations"
      />

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search by member name or email...',
          },
          {
            type: 'select',
            id: 'status',
            label: 'Status',
            options: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ],
          },
        ]}
        onFilterChange={setFilters}
      />

      <DataTable columns={columns} data={declarations} loading={isLoading} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="declarations" />

      <ApproveDialog
        declaration={approveTarget}
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
      />

      <RejectDialog
        declaration={rejectTarget}
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      />
    </>
  );
}
```

---

### Task 10: Create Declaration detail page

**Files:**
- Write: `src/features/contributions/pages/declaration-detail.tsx`

- [x] **Step: Write the detail page component**

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDeclarationDetail } from '../hooks/declarations/use-declaration-detail';
import { SectionHeader } from '@src/shared/components/section-header';
import { Card, CardHeader, CardTitle, CardContent } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Badge } from '@src/shared/components/ui/badge';
import { Separator } from '@src/shared/components/ui/separator';
import { formatDate } from '@src/shared/utils';
import { User, Calendar, IndianRupee, ClipboardList } from 'lucide-react';

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  APPROVED: 'default',
  PENDING: 'secondary',
  REJECTED: 'destructive',
};

export function DeclarationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const declarationId = params.declarationId as string;

  const { declaration, isLoading } = useDeclarationDetail(declarationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-body">Loading declaration details...</p>
      </div>
    );
  }

  if (!declaration) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg text-body">Declaration not found</p>
        <Button
          variant="outline"
          className="mt-4 h-11 border-hairline bg-canvas px-5 text-sm font-medium text-ink hover:bg-surface-strong"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title="Declaration Details"
        description={`ID: ${declaration.id.slice(0, 8)}...`}
        onBackClick={() => router.back()}
      >
        <Badge variant={statusBadgeVariant[declaration.status] ?? 'outline'}>
          {declaration.status}
        </Badge>
      </SectionHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-hairline bg-surface-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Declaration Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-medium text-ink mt-1 flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {declaration.amount}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="text-sm text-ink mt-1">
                    <Badge variant={statusBadgeVariant[declaration.status] ?? 'outline'}>
                      {declaration.status}
                    </Badge>
                  </p>
                </div>
              </div>

              <Separator className="bg-hairline" />

              <div>
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                  <Calendar className="h-3 w-3" />
                  Declaration Period
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm text-ink mt-1">
                      {formatDate(declaration.declerationStartDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm text-ink mt-1">
                      {formatDate(declaration.declerationEndDate)}
                    </p>
                  </div>
                </div>
              </div>

              {declaration.lastDeclarationDate && (
                <>
                  <Separator className="bg-hairline" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Last Declaration Date</p>
                    <p className="text-sm text-ink mt-1">
                      {formatDate(declaration.lastDeclarationDate)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-hairline bg-surface-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-medium text-ink">{declaration.member.name}</p>
                <p className="text-sm text-muted-foreground">{declaration.member.email}</p>
                <p className="text-sm text-muted-foreground">{declaration.member.mobile}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-hairline bg-surface-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Review Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {declaration.status === 'PENDING' ? (
                <p className="text-sm text-muted-foreground">Awaiting review</p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Reviewed By</p>
                    <p className="text-sm text-ink mt-1">{declaration.reviewBy || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Reviewed At</p>
                    <p className="text-sm text-ink mt-1">
                      {declaration.reviewAt ? formatDate(declaration.reviewAt) : '-'}
                    </p>
                  </div>
                  {declaration.remark && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Remark</p>
                      <p className="text-sm text-ink mt-1">{declaration.remark}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
```

---

### Task 11: Wire up the route files and exports

**Files:**
- Modify: `src/features/contributions/hooks/index.ts` — add declarations re-exports
- Modify: `src/features/contributions/pages/index.ts` — add declarations pages
- Modify: `src/app/(dashboard)/contributions/declarations/page.tsx` — wire list page
- Modify: `src/app/(dashboard)/contributions/declarations/[declarationId]/page.tsx` — wire detail page

- [x] **Step 1: Update hooks barrel export**

In `src/features/contributions/hooks/index.ts`:

```typescript
export * from './useContributions';
export * from './useUserContributions';
export * from './useContributionDetail';
// Add:
export * from './declarations/use-declarations';
export * from './declarations/use-declaration-detail';
export * from './declarations/use-declaration-mutations';
export * from './declarations/use-declarations-columns';
```

- [x] **Step 2: Update pages barrel export**

In `src/features/contributions/pages/index.ts`:

```typescript
export { default as ContributionsPage } from './contributions';
export { ContributionDetailPage } from './contribution-detail';
export { AddContributionPage } from './record-contribution';
export { UserContributionsPage } from './user-contributions';
// Add:
export { default as DeclarationsPage } from './declarations';
export { DeclarationDetailPage } from './declaration-detail';
```

- [x] **Step 3: Wire declarations list route**

In `src/app/(dashboard)/contributions/declarations/page.tsx`:

```typescript
import DeclarationsPage from '@src/features/contributions/pages/declarations';

export default function page() {
  return <DeclarationsPage />;
}
```

- [x] **Step 4: Wire declarations detail route**

In `src/app/(dashboard)/contributions/declarations/[declarationId]/page.tsx`:

```typescript
import { DeclarationDetailPage } from '@src/features/contributions/pages/declaration-detail';

export default function page() {
  return <DeclarationDetailPage />;
}
```

---

### Task 12: Verify build

**Files:** None

- [x] **Step: Run TypeScript check and build**

Run: `npx tsc --noEmit` or `npm run typecheck`

Expected: Clean compilation with no errors.

If there are import errors, verify barrel exports are correctly configured and the `Textarea` component exists at the imported path.

---

## Self-Review

**1. Spec coverage:**
- ✅ Declarations list page with table — Task 9
- ✅ Search and status filters — Task 9 (DataTableFilters with search + status select)
- ✅ Approve/Reject action buttons in table — Task 6 (actions column in useDeclarationsColumns)
- ✅ Approve dialog with remark field — Task 7
- ✅ Reject dialog with remark field — Task 8
- ✅ Declaration detail page — Task 10

**2. Placeholder scan:** No TBD, TODO, or incomplete stubs found. All code blocks contain complete implementations.

**3. Type consistency:**
- `Declaration` type defined in Task 1 is used in Tasks 3, 4, 5, 6, 7, 8, 9, 10 — consistent.
- `useDeclarations` returns `{ declarations, meta, isLoading, error, refetch }` — matches `usePayments` pattern.
- `useDeclarationDetail` returns `{ declaration, isLoading, error }` — matches `usePaymentDetail` pattern.
- `declarationEndpoints` keys match what mutation hooks use.
- `statusBadgeVariant` record is defined in Tasks 6 and 10 with identical mappings — consistent.
