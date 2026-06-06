import { type ColumnDef } from '@tanstack/react-table';
import type { Account } from '@src/shared/types';
import { DeleteAccountCell } from '../components/account/cell/delete-cell';
import { Button } from '@src/shared/components/ui/button';
import { Edit2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function useLedgerAccountColumns(onEdit: (account: Account) => void) {
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="text-sm font-mono text-ink">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          href={`/ledger/accounts/${row.original.id}`}
          className="text-sm text-ink hover:underline font-medium"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
              type === 'ASSET'
                ? 'bg-blue-50 text-blue-700'
                : type === 'LIABILITY'
                  ? 'bg-orange-50 text-orange-700'
                  : type === 'EQUITY'
                    ? 'bg-green-50 text-green-700'
                    : type === 'INCOME'
                      ? 'bg-purple-50 text-purple-700'
                      : type === 'EXPENSE'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-50 text-gray-700'
            }`}
          >
            {type.charAt(0) + type.slice(1).toLowerCase()}
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
