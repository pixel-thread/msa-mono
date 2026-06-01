# Ledger Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the frontend UI for the Ledger & Accounting system, including Chart of Accounts seeding, entry rejection, dashboard summaries, and financial reports.

**Architecture:** We will extend the existing React Query data-fetching layer with new hooks for the added endpoints. We will add edit/seed capabilities to the Accounts page, reject actions to the Entries page, build out the Dashboard with actual financial metrics, and create a new Reports page with Trial Balance and Income Statement views.

**Tech Stack:** React, Next.js (App Router), TanStack React Query, Tailwind CSS, shadcn/ui, Lucide Icons.

---

### Task 1: Update API Endpoints & Summary Types

**Files:**
- Modify: `src/features/ledger/utils/constants/endpoints.ts`
- Modify: `src/features/ledger/hooks/useLedgerSummary.ts`

- [ ] **Step 1: Update endpoints constant**

```typescript
// src/features/ledger/utils/constants/endpoints.ts
export const ledgerEndpoints = {
  entries: '/api/ledger/entries',
  accounts: '/api/ledger/accounts',
  summary: '/api/ledger/summary',
  seedAccounts: '/api/ledger/accounts/seed',
  rejectEntry: (id: string) => `/api/ledger/entries/${id}/reject`,
  approveEntry: (id: string) => `/api/ledger/entries/${id}/approve`,
  updateAccount: (id: string) => `/api/ledger/accounts/${id}`,
  trialBalance: '/api/ledger/reports/trial-balance',
  incomeStatement: '/api/ledger/reports/income-statement',
};
```

- [ ] **Step 2: Update useLedgerSummary types & hook**

```typescript
// src/features/ledger/hooks/useLedgerSummary.ts
import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';
import type { Account } from '@src/shared/types';

export interface LedgerSummaryResponse {
  accounts: Account[];
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    totalIncome: number;
    totalExpenses: number;
    pendingCount: number;
    approvedCount: number;
    isBalanced: boolean;
  };
}

export function useLedgerSummary() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ledger-summary'],
    queryFn: () => http.get<LedgerSummaryResponse>(ledgerEndpoints.summary),
  });

  return {
    summaryData: data?.data,
    isLoading,
    error,
    refetch,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/ledger/utils/constants/endpoints.ts src/features/ledger/hooks/useLedgerSummary.ts
git commit -m "feat(ledger): update endpoints and summary hook types"
```

### Task 2: Chart of Accounts Seeding

**Files:**
- Create: `src/features/ledger/hooks/useSeedAccounts.ts`
- Modify: `src/features/ledger/pages/ledger-accounts-page.tsx`

- [ ] **Step 1: Create useSeedAccounts hook**

```typescript
// src/features/ledger/hooks/useSeedAccounts.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';
import { useToast } from '@src/shared/hooks/use-toast';

export function useSeedAccounts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      return http.post(ledgerEndpoints.seedAccounts, {});
    },
    onSuccess: () => {
      toast({
        title: 'Accounts Seeded',
        description: 'Standard chart of accounts has been initialized.',
      });
      queryClient.invalidateQueries({ queryKey: ['ledger-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-summary'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed accounts.',
        variant: 'destructive',
      });
    },
  });
}
```

- [ ] **Step 2: Add Seed Button to Accounts Page**

```tsx
// src/features/ledger/pages/ledger-accounts-page.tsx (Modify Imports and Header)
// Add these imports:
import { useSeedAccounts } from '../hooks/useSeedAccounts';
import { Sprout } from 'lucide-react';

// Inside LedgerAccountsPage component:
// const { mutate: seedAccounts, isPending: isSeeding } = useSeedAccounts();

// Change the SectionHeader children to:
/*
<div className="flex items-center gap-2">
  <Button variant="outline" onClick={() => seedAccounts()} disabled={isSeeding || accounts.length > 0}>
    <Sprout className="h-4 w-4 mr-2" />
    Seed Accounts
  </Button>
  <Button onClick={() => setCreateOpen(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Create Account
  </Button>
</div>
*/
```

- [ ] **Step 3: Commit**

```bash
git add src/features/ledger/hooks/useSeedAccounts.ts src/features/ledger/pages/ledger-accounts-page.tsx
git commit -m "feat(ledger): add chart of accounts seeding functionality"
```

### Task 3: Account Editing

**Files:**
- Create: `src/features/ledger/hooks/useUpdateAccount.ts`
- Create: `src/features/ledger/components/update-account-dialog.tsx`
- Modify: `src/features/ledger/hooks/useLedgerAccountColumns.tsx`

- [ ] **Step 1: Create useUpdateAccount hook**

```typescript
// src/features/ledger/hooks/useUpdateAccount.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';
import { useToast } from '@src/shared/hooks/use-toast';

interface UpdateAccountPayload {
  id: string;
  name: string;
  description?: string;
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: UpdateAccountPayload) => {
      return http.put(ledgerEndpoints.updateAccount(payload.id), {
        name: payload.name,
        description: payload.description,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Account Updated',
        description: 'The account has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['ledger-accounts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update account.',
        variant: 'destructive',
      });
    },
  });
}
```

- [ ] **Step 2: Create UpdateAccountDialog**

```tsx
// src/features/ledger/components/update-account-dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@src/shared/components/ui/dialog';
import { Button } from '@src/shared/components/ui/button';
import { Input } from '@src/shared/components/ui/input';
import { Label } from '@src/shared/components/ui/label';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import type { Account } from '@src/shared/types';

interface UpdateAccountDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateAccountDialog({ account, open, onOpenChange }: UpdateAccountDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: updateAccount, isPending } = useUpdateAccount();

  useEffect(() => {
    if (account && open) {
      setName(account.name);
      setDescription(account.description || '');
    }
  }, [account, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    
    updateAccount({ id: account.id, name, description }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Account: {account?.code}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Add Edit action to columns**

```tsx
// src/features/ledger/hooks/useLedgerAccountColumns.tsx (Modify existing file)
// Update the 'Account' column cell to include an Edit button.
// Pass an onEdit callback parameter to the hook: `export function useLedgerAccountColumns(onEdit: (account: Account) => void) {`
import { type ColumnDef } from '@tanstack/react-table';
import type { Account } from '@src/shared/types';
import { DeleteAccountCell } from '../components/account/cell/delete-cell';
import { Button } from '@src/shared/components/ui/button';
import { Edit2 } from 'lucide-react';

export function useLedgerAccountColumns(onEdit: (account: Account) => void) {
  const columns: ColumnDef<Account>[] = [
    // ... keep existing columns (Code, Name, Type, Description)
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="text-sm font-mono text-ink">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="text-sm text-ink">{row.original.name}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return (
           <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-gray-50 text-gray-700">
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.description || '—'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <DeleteAccountCell id={row.original.id} />
        </div>
      ),
    },
  ];

  return { columns };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/ledger/hooks/useUpdateAccount.ts src/features/ledger/components/update-account-dialog.tsx src/features/ledger/hooks/useLedgerAccountColumns.tsx
git commit -m "feat(ledger): add account editing functionality"
```

### Task 4: Ledger Entry Rejection

**Files:**
- Create: `src/features/ledger/hooks/useRejectEntry.ts`
- Create: `src/features/ledger/components/reject-entry-dialog.tsx`
- Modify: `src/features/ledger/hooks/useLedgerEntriesColumns.tsx`
- Modify: `src/features/ledger/pages/ledger-entries-page.tsx`

- [ ] **Step 1: Create useRejectEntry hook**

```typescript
// src/features/ledger/hooks/useRejectEntry.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';
import { useToast } from '@src/shared/hooks/use-toast';

export function useRejectEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return http.post(ledgerEndpoints.rejectEntry(id), { reason });
    },
    onSuccess: () => {
      toast({ title: 'Entry Rejected', description: 'The ledger entry was rejected.' });
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-summary'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
```

- [ ] **Step 2: Create RejectEntryDialog component**

```tsx
// src/features/ledger/components/reject-entry-dialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@src/shared/components/ui/dialog';
import { Button } from '@src/shared/components/ui/button';
import { Input } from '@src/shared/components/ui/input';
import { Label } from '@src/shared/components/ui/label';
import { useRejectEntry } from '../hooks/useRejectEntry';

interface RejectEntryDialogProps {
  entryId: string | null;
  entryDescription: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectEntryDialog({ entryId, entryDescription, open, onOpenChange }: RejectEntryDialogProps) {
  const [reason, setReason] = useState('');
  const { mutate: rejectEntry, isPending } = useRejectEntry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryId) return;
    rejectEntry({ id: entryId, reason }, { onSuccess: () => {
      onOpenChange(false);
      setReason('');
    }});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Ledger Entry</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject "{entryDescription}"?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Incorrect allocation" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={isPending}>Reject Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Add reject to hooks and page**

Update `useLedgerEntriesColumns.tsx` to accept `onReject` and show the button if `approvalStatus === 'PENDING'`. Update `ledger-entries-page.tsx` to handle state for the reject dialog and render it.

- [ ] **Step 4: Commit**

```bash
git add src/features/ledger/hooks/useRejectEntry.ts src/features/ledger/components/reject-entry-dialog.tsx src/features/ledger/hooks/useLedgerEntriesColumns.tsx src/features/ledger/pages/ledger-entries-page.tsx
git commit -m "feat(ledger): add ledger entry rejection workflow"
```

### Task 5: Dashboard Overview Updates

**Files:**
- Modify: `src/features/ledger/pages/ledger-dashboard-page.tsx`

- [ ] **Step 1: Update the Dashboard Page to show actual metrics**

```tsx
// src/features/ledger/pages/ledger-dashboard-page.tsx
'use client';

import { useLedgerSummary } from '../hooks/useLedgerSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { SectionHeader } from '@src/shared/components/section-header';
import { ArrowUpRight, ArrowDownRight, Scale, Clock } from 'lucide-react';

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function LedgerDashboardPage() {
  const { summaryData, isLoading } = useLedgerSummary();

  if (isLoading || !summaryData) {
    return <div>Loading dashboard...</div>;
  }

  const { summary } = summaryData;

  return (
    <div className="space-y-6">
      <SectionHeader title="Ledger Overview" description="Financial summary and ledger status." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalAssets)}</div>
            <p className="text-xs text-muted-foreground mt-1">Balanced: {summary.isBalanced ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalLiabilities)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle className="text-lg flex items-center"><Clock className="mr-2 h-5 w-5" /> Pending Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.pendingCount}</div>
            <p className="text-sm text-muted-foreground mt-2">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="text-lg flex items-center"><Scale className="mr-2 h-5 w-5" /> Approved Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.approvedCount}</div>
            <p className="text-sm text-muted-foreground mt-2">Fully posted to ledger</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/ledger/pages/ledger-dashboard-page.tsx
git commit -m "feat(ledger): implement dashboard summary metrics"
```

### Task 6: Financial Reports Hooks

**Files:**
- Create: `src/features/ledger/hooks/useTrialBalance.ts`
- Create: `src/features/ledger/hooks/useIncomeStatement.ts`

- [ ] **Step 1: Create Trial Balance Hook**

```typescript
// src/features/ledger/hooks/useTrialBalance.ts
import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';

export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceResponse {
  lines: TrialBalanceLine[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export function useTrialBalance() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: () => http.get<TrialBalanceResponse>(ledgerEndpoints.trialBalance),
  });

  return { data: data?.data, isLoading, error };
}
```

- [ ] **Step 2: Create Income Statement Hook**

```typescript
// src/features/ledger/hooks/useIncomeStatement.ts
import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';

export interface IncomeStatementLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface IncomeStatementResponse {
  income: IncomeStatementLine[];
  expenses: IncomeStatementLine[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}

export function useIncomeStatement(startDate?: string, endDate?: string) {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set('startDate', startDate);
  if (endDate) queryParams.set('endDate', endDate);

  const { data, isLoading, error } = useQuery({
    queryKey: ['income-statement', startDate, endDate],
    queryFn: () => http.get<IncomeStatementResponse>(`${ledgerEndpoints.incomeStatement}?${queryParams.toString()}`),
  });

  return { data: data?.data, isLoading, error };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/ledger/hooks/useTrialBalance.ts src/features/ledger/hooks/useIncomeStatement.ts
git commit -m "feat(ledger): add trial balance and income statement hooks"
```

### Task 7: Reports Page Component

**Files:**
- Create: `src/features/ledger/pages/ledger-reports-page.tsx`
- Modify: `src/features/ledger/pages/index.ts`
- Create: `src/app/(dashboard)/ledger/reports/page.tsx`

- [ ] **Step 1: Create LedgerReportsPage**

```tsx
// src/features/ledger/pages/ledger-reports-page.tsx
'use client';

import { useTrialBalance } from '../hooks/useTrialBalance';
import { useIncomeStatement } from '../hooks/useIncomeStatement';
import { SectionHeader } from '@src/shared/components/section-header';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@src/shared/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function LedgerReportsPage() {
  const { data: trialData, isLoading: trialLoading } = useTrialBalance();
  const { data: incomeData, isLoading: incomeLoading } = useIncomeStatement();

  return (
    <div className="space-y-6">
      <SectionHeader title="Financial Reports" description="Trial Balance and Income Statement views." />

      <Tabs defaultValue="trial-balance">
        <TabsList>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trial-balance" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Trial Balance</CardTitle></CardHeader>
            <CardContent>
              {trialLoading ? <div>Loading...</div> : trialData && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trialData.lines.map((line) => (
                      <TableRow key={line.accountId}>
                        <TableCell>{line.accountCode} - {line.accountName}</TableCell>
                        <TableCell className="text-right">{line.debit > 0 ? formatCurrency(line.debit) : '-'}</TableCell>
                        <TableCell className="text-right">{line.credit > 0 ? formatCurrency(line.credit) : '-'}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Totals</TableCell>
                      <TableCell className="text-right">{formatCurrency(trialData.totalDebits)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(trialData.totalCredits)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Income Statement</CardTitle></CardHeader>
            <CardContent>
              {incomeLoading ? <div>Loading...</div> : incomeData && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Income</h3>
                    <Table>
                      <TableBody>
                        {incomeData.income.map((line) => (
                          <TableRow key={line.accountId}>
                            <TableCell>{line.accountCode} - {line.accountName}</TableCell>
                            <TableCell className="text-right">{formatCurrency(line.amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold">
                          <TableCell>Total Income</TableCell>
                          <TableCell className="text-right">{formatCurrency(incomeData.totalIncome)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Expenses</h3>
                    <Table>
                      <TableBody>
                        {incomeData.expenses.map((line) => (
                          <TableRow key={line.accountId}>
                            <TableCell>{line.accountCode} - {line.accountName}</TableCell>
                            <TableCell className="text-right">{formatCurrency(line.amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold">
                          <TableCell>Total Expenses</TableCell>
                          <TableCell className="text-right">{formatCurrency(incomeData.totalExpenses)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg font-bold text-lg">
                    <span>Net Income</span>
                    <span className={incomeData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(incomeData.netIncome)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Add page exports and routing**

```typescript
// src/features/ledger/pages/index.ts
// Add export:
export * from './ledger-reports-page';
```

```tsx
// src/app/(dashboard)/ledger/reports/page.tsx
import { LedgerReportsPage } from '@feature/ledger/pages';

export default function ReportsRoute() {
  return <LedgerReportsPage />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/ledger/pages/ledger-reports-page.tsx src/features/ledger/pages/index.ts src/app/\(dashboard\)/ledger/reports/page.tsx
git commit -m "feat(ledger): implement financial reports page"
```
