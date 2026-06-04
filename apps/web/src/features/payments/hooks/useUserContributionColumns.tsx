'use client';
import { ColumnDef, Table } from '@tanstack/react-table';
import { Badge } from '@src/shared/components/ui/badge';
import { formattedAmount } from '@src/shared/utils';
import { getMonthName } from '@src/shared/utils/helper/get-month-name';
import { getStatusBadge } from '@src/shared/utils/helper/get-status-badge';
import type { ContributionPeriod } from '../types';
import Link from 'next/link';
import { Checkbox } from '@components/ui/checkbox';

type Props = {
  onCheck?: (data: ContributionPeriod[]) => void;
  checkValues?: ContributionPeriod[];
};

export function useUserContributionColumns({ onCheck, checkValues }: Props = {}) {
  const isRowSelected = (data: ContributionPeriod) => checkValues?.some((id) => id.id === data.id);

  const onRowChange = (data: ContributionPeriod[]) => {
    onCheck?.(data);
  };

  const onSelectAllChange = (table: Table<ContributionPeriod>) => {
    if (!onCheck) return;

    const rows = table.getRowModel().rows;

    const pageValues = rows.map((row) => ({
      id: row.original.id,
      month: row.original.month,
    }));

    const allSelected = rows.every((row) => isRowSelected(row.original));

    if (allSelected) {
      // remove all visible rows
      const remaining =
        checkValues?.filter(
          (selected) => !pageValues.some((pageItem) => pageItem.id === selected.id),
        ) ?? [];

      onCheck(remaining);
      return;
    }

    // add missing visible rows
    const existingIds = new Set(checkValues?.map((item) => item.id) ?? []);

    const next = [
      ...(checkValues ?? []),
      ...pageValues.filter((item) => !existingIds.has(item.id)),
    ];

    onCheck(next);
  };

  const columns: ColumnDef<ContributionPeriod>[] = [
    ...(onCheck
      ? [
          {
            id: 'select',
            header: ({ table }) => {
              const rows = table.getRowModel().rows;
              const allSelected =
                rows.length > 0 && rows.every((row) => isRowSelected(row.original));
              return (
                <Checkbox checked={allSelected} onCheckedChange={() => onSelectAllChange(table)} />
              );
            },
            cell: ({ row }) => (
              <Checkbox
                checked={isRowSelected(row.original)}
                onCheckedChange={() => onRowChange((data) => [...data, row.original])}
              />
            ),
          } satisfies ColumnDef<ContributionPeriod>,
        ]
      : []),
    {
      id: 'period',
      header: 'Period',
      cell: ({ row }) => (
        <Link href={`/payments/contributions/${row.original.id}`} className="text-sm font-medium">
          {getMonthName(row.original.month)} {row.original.year}
        </Link>
      ),
    },
    {
      accessorKey: 'expectedAmount',
      header: 'Expected',
      cell: ({ row }) => (
        <span className="text-sm">{formattedAmount(row.original.expectedAmount)}</span>
      ),
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid',
      cell: ({ row }) => (
        <span className="text-sm text-green-600">{formattedAmount(row.original.paidAmount)}</span>
      ),
    },
    {
      accessorKey: 'dueAmount',
      header: 'Due',
      cell: ({ row }) => (
        <span className="text-sm text-red-600">
          {formattedAmount(parseInt(row.original.dueAmount))}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.dueDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      id: 'payments',
      header: 'Payments',
      cell: ({ row }) => {
        const allocations = row.original.allocations;
        return allocations.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {allocations.map((alloc) => (
              <Badge key={alloc.id} variant="secondary" className="text-xs">
                {formattedAmount(alloc.allocatedAmount)}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No payments</span>
        );
      },
    },
  ];
  return { columns };
}
