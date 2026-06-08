# Transfer Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a "Transfer Payment" dialog in the All Payments page that allows users to transfer funds between accounts, showing account balances and a transfer preview, using mock data for now.

**Architecture:** A new React component `TransferPaymentDialog` in `src/features/payments/components` using shadcn UI components (Dialog, Form, Select). It will use mock data for accounts, React Hook Form + Zod for form state and validation, and present the "From" and "To" selections in a two-column layout. When submitted, it will fake an API call and simulate query invalidation.

**Tech Stack:** React, Tailwind CSS, shadcn/ui, react-hook-form, zod, lucide-react

---

### Task 1: Create the TransferPaymentDialog Component

**Files:**

- Create: `src/features/payments/components/transfer-payment-dialog.tsx`

- [ ] **Step 1: Write the component implementation**

```tsx
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@src/shared/components/ui/dialog';
import { Button } from '@src/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@src/shared/components/ui/form';
import { Input } from '@src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const MOCK_ACCOUNTS = [
  { id: 'acc_1', name: 'Main Account', balance: 15000 },
  { id: 'acc_2', name: 'Savings Account', balance: 50000 },
  { id: 'acc_3', name: 'Operations Account', balance: 2500 },
];

const transferSchema = z
  .object({
    fromAccountId: z.string().min(1, 'Please select source account'),
    toAccountId: z.string().min(1, 'Please select destination account'),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: 'Source and destination accounts must be different',
    path: ['toAccountId'],
  });

type TransferFormValues = z.infer<typeof transferSchema>;

interface TransferPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferPaymentDialog({ open, onOpenChange }: TransferPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
    },
  });

  const fromAccountId = form.watch('fromAccountId');
  const toAccountId = form.watch('toAccountId');
  const amount = form.watch('amount');

  const fromAccount = useMemo(
    () => MOCK_ACCOUNTS.find((a) => a.id === fromAccountId),
    [fromAccountId],
  );
  const toAccount = useMemo(() => MOCK_ACCOUNTS.find((a) => a.id === toAccountId), [toAccountId]);

  const onSubmit = async (data: TransferFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate updating the account and invalidating query
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    toast.success('Transfer successful');

    setIsSubmitting(false);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transfer Payment</DialogTitle>
          <DialogDescription>Transfer funds from one account to another.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* From Account */}
              <FormField
                control={form.control}
                name="fromAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_ACCOUNTS.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fromAccount && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Balance: ${fromAccount.balance.toLocaleString()}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* To Account */}
              <FormField
                control={form.control}
                name="toAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_ACCOUNTS.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {toAccount && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Balance: ${toAccount.balance.toLocaleString()}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Section */}
            {fromAccount && toAccount && amount > 0 && (
              <div className="p-3 bg-muted rounded-md text-sm text-center font-medium">
                Preview: {amount} will be transferred from {fromAccount.name} to {toAccount.name}.
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Transferring...' : 'Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/payments/components/transfer-payment-dialog.tsx
git commit -m "feat: add transfer payment dialog component"
```

### Task 2: Export TransferPaymentDialog

**Files:**

- Modify: `src/features/payments/components/index.ts:1-10`

- [ ] **Step 1: Export the component in index.ts**

```typescript
export * from './record-payment-dialog';
export * from './provider-form';
export * from './provider-detail';
export * from './provider-detail-dialog';
export * from './create-provider-dialog';
export * from './edit-provider-dialog';
export * from './test-payment-button';
export * from './transfer-payment-dialog';
```

- [ ] **Step 2: Commit**

```bash
git add src/features/payments/components/index.ts
git commit -m "feat: export transfer payment dialog component"
```

### Task 3: Integrate Dialog into AllPaymentsPage

**Files:**

- Modify: `src/features/payments/pages/all-payments.tsx:1-89`

- [ ] **Step 1: Update the page to include the dialog and trigger button**

```tsx
'use client';

import { useState } from 'react';
import { RecordPaymentDialog, TransferPaymentDialog } from '@src/features/payments/components';
import { usePayments } from '@src/features/payments/hooks/usePayments';
import { usePaymentTransactionColumns } from '@src/features/payments/hooks/usePaymentTransactionColumns';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@src/shared/hooks';
import { Plus, ArrowRightLeft } from 'lucide-react';

export default function AllPaymentsPage() {
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const { filters, page, setPage, setFilters } = useUrlFilters({
    basePath: '/payments',
  });

  const { payments, meta, isLoading } = usePayments({
    page,
    ...filters,
  });

  const { columns } = usePaymentTransactionColumns();

  return (
    <>
      <SectionHeader title="All Payments" description="View and manage all payment transactions">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTransferDialogOpen(true)} className="h-10">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer Payment
          </Button>
          <Button onClick={() => setRecordDialogOpen(true)} className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </SectionHeader>

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search member, reference, receipt...',
          },
          {
            type: 'select',
            id: 'status',
            label: 'Status',
            options: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'REFUNDED', label: 'Refunded' },
              { value: 'WAIVED', label: 'Waived' },
            ],
          },
          {
            type: 'select',
            id: 'method',
            label: 'Method',
            options: [
              { value: 'CASH', label: 'Cash' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { value: 'UPI', label: 'UPI' },
              { value: 'CHEQUE', label: 'Cheque' },
              { value: 'ONLINE', label: 'Online' },
            ],
          },
          {
            type: 'select',
            id: 'gateway',
            label: 'Gateway',
            options: [
              { value: 'RAZORPAY', label: 'Razorpay' },
              { value: 'MANUAL', label: 'Manual' },
            ],
          },
        ]}
        onFilterChange={setFilters}
      />

      <DataTable columns={columns} data={payments} loading={isLoading} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="payments" />

      <RecordPaymentDialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen} />
      <TransferPaymentDialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/payments/pages/all-payments.tsx
git commit -m "feat: integrate transfer payment dialog in all payments page"
```
