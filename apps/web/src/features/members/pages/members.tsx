'use client';

import { useMembers } from '@src/features/members/hooks/useMembers';
import { useMemberTableActions } from '@src/features/members/hooks/useMemberTableActions';
import { useMemberTableColumns } from '@src/features/members/hooks/useMemberTableColumns';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { useUrlFilters } from '@src/shared/hooks';

export default function MembersPage() {
  const { page, setPage } = useUrlFilters({ basePath: '/members' });

  const { members, meta, isLoading } = useMembers({ page });
  const { onRoleChange, onStatusChange, onAssociationChange } = useMemberTableActions();
  const { columns } = useMemberTableColumns({
    onRoleChange,
    onStatusChange,
    onAssociationChange,
  });

  return (
    <>
      <SectionHeader title="Members" description="Manage and view all association members" />

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search members...',
          },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable loading={isLoading} data={members} columns={columns} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="members" />
    </>
  );
}
