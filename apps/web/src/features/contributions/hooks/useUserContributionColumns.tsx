'use client';
import { ColumnDef, Table } from '@tanstack/react-table';
import { Badge } from '@src/shared/components/ui/badge';
import { formatDate, formattedAmount } from '@src/shared/utils';
import { getMonthName } from '@src/shared/utils/helper/get-month-name';
import { ContributionStatusBadge } from '../components/contribution-status-badge';
import type { ContributionPeriod } from '../types';
import Link from 'next/link';
import { Checkbox } from '@components/ui/checkbox';
import { WaivedContributionCell } from '../components/cells/waived-contribution-cell';

type Props = {
  onCheck?: (data: ContributionPeriod[]) => void;
  checkValues?: ContributionPeriod[];
};

export function useUserContributionColumns({ onCheck, checkValues }: Props = {}) {
  const isRowSelected = (data: ContributionPeriod) => checkValues?.some((id) => id.id === data.id);

  const onSelectAllChange = (table: Table<ContributionPeriod>) => {
    if (!onCheck) return;

    const rows = table.getRowModel().rows.filter((val) => val.original.status !== 'PAID');

    const allSelected = rows.every((row) => isRowSelected(row.original));

    if (allSelected) {
      const remaining =
        checkValues?.filter(
          (selected) => !rows.some((pageItem) => pageItem.original.id === selected.id),
        ) ?? [];
      onCheck(remaining);
      return;
    }

    const next = [...(checkValues ?? []), ...rows.map((row) => row.original)];

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
                disabled={row.original.status === 'PAID' || row.original.status === 'WAIVED'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onCheck?.([...(checkValues ?? []), row.original]);
                  } else {
                    onCheck?.(checkValues?.filter((item) => item.id !== row.original.id) ?? []);
                  }
                }}
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
      cell: ({ row }) => <ContributionStatusBadge status={row.original.status} />,
    },
    {
      header: 'Paid At',
      cell: ({ row }) => {
        const contribution = row.original;
        const contributionId = contribution.id;
        const payments = contribution.allocations.find(
          (allocation) => allocation.contributionPeriodId === contributionId,
        );
        const paidAt = payments?.paymentTransaction.paidAt;
        return <span className="text-sm text-muted-foreground">{formatDate(paidAt)}</span>;
      },
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
    {
      header: 'WAIVED',
      cell: ({ row }) => <WaivedContributionCell contributionPeriod={row.original} />,
    },
  ];
  return { columns };
}
