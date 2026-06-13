'use client';

import { useMembers } from '@src/features/members/hooks/useMembers';
import { useMemberTableActions } from '@src/features/members/hooks/useMemberTableActions';
import { useMemberTableColumns } from '@src/features/members/hooks/useMemberTableColumns';
import { Button } from '@src/shared/components/ui/button';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { useUrlFilters } from '@src/shared/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Upload } from 'lucide-react';

export default function MembersPage() {
  const navigate = useNavigate();
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
      <SectionHeader title="Members" description="Manage and view all association members">
        <Button onClick={() => navigate({ to: '/members/import' })}>
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </SectionHeader>

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
