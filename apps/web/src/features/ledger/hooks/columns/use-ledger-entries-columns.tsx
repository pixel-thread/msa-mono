import type { LedgerEntryResponse } from '@feature/ledger/hooks/use-ledger-entries';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { formatDate } from '@src/shared/utils/format';
import { Link } from '@tanstack/react-router';
import { type ColumnDef } from '@tanstack/react-table';

interface UseLedgerEntriesColumnsOptions {
  onViewDetails?: (entry: LedgerEntryResponse) => void;
  onApprove?: (entry: LedgerEntryResponse) => void;
  onReject?: (entry: LedgerEntryResponse) => void;
}

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  APPROVED: 'default',
  PENDING: 'secondary',
  REJECTED: 'destructive',
};

export function useLedgerEntriesColumns({
  onApprove,
  onReject,
}: UseLedgerEntriesColumnsOptions = {}) {
  const columns: ColumnDef<LedgerEntryResponse>[] = [
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <Link
          to={`/ledger/entries/$entryId`}
          params={{ entryId: row.original.id }}
          className="text-sm text-ink max-w-[300px] block truncate hover:underline"
        >
          {row.original.description}
        </Link>
      ),
    },
    {
      accessorKey: 'approvalStatus',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant[row.original.approvalStatus] ?? 'outline'}>
          {row.original.approvalStatus}
        </Badge>
      ),
    },
    {
      accessorKey: 'lines',
      header: 'Lines',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.lines.length}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.approvalStatus === 'PENDING' && (
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
