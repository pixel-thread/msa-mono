import { AssociationCell } from '@src/features/members/components/cells/association-cell';
import { NameCell } from '@src/features/members/components/cells/name-cell';
import { RoleCell } from '@src/features/members/components/cells/role-cell';
import { StatusCell } from '@src/features/members/components/cells/status-cell';
import type { User } from '@src/shared/types';
import { formatDate } from '@src/shared/utils';
import { ColumnDef } from '@tanstack/react-table';

import { MemberTypeCell } from '../components/cells/type-cell';

interface UseMemberTableColumnsOptions {
  onRoleChange: (memberId: string, role: string, action: 'add' | 'remove') => void;
  onStatusChange: (memberId: string, status: string) => void;
  onAssociationChange: (memberId: string, associationId: string) => void;
}

export const useMemberTableColumns = ({
  onRoleChange,
  onStatusChange,
  onAssociationChange,
}: UseMemberTableColumnsOptions): { columns: ColumnDef<User>[] } => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Member',
      cell: ({ row }) => <NameCell member={row.original} />,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <RoleCell member={row.original} onRoleChange={onRoleChange} />,
    },
    {
      accessorKey: 'associationId',
      header: 'Association',
      cell: ({ row }) => (
        <AssociationCell member={row.original} onAssociationChange={onAssociationChange} />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusCell member={row.original} onStatusChange={onStatusChange} />,
    },
    {
      accessorKey: 'memberTypeId',
      header: 'Level',
      cell: ({ row }) => <MemberTypeCell member={row.original} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-right text-muted-foreground text-sm block ml-auto">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];

  return { columns };
};
