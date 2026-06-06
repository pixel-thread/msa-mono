'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { formatDate } from '@src/shared/utils';
import type { Declaration } from '../../types';
import { Link } from '@tanstack/react-router';

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
            to={`/contributions/declarations/${row.original.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {row.original.member.name}
          </Link>
          <span className="text-xs text-muted-foreground">{row.original.member.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'lastDeclarationDate',
      header: 'Last Declaration',
      cell: ({ row }) => formatDate(row.original.lastDeclarationDate),
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
