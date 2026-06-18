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
          {row.original.contributionPeriod
            ? `${row.original.contributionPeriod.year}-${String(row.original.contributionPeriod.month).padStart(2, '0')}`
            : '—'}
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
        const isPositive = amount >= 0;
        return (
          <Badge variant={isPositive ? 'default' : 'destructive'}>
            {isPositive ? '+' : ''}
            {formattedAmount(amount)}
          </Badge>
        );
      },
    },
    {
      id: 'effectiveDates',
      header: 'Effective',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.retroactiveAdjustment.effectiveFrom)} —{' '}
          {formatDate(row.original.retroactiveAdjustment.effectiveTo)}
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
