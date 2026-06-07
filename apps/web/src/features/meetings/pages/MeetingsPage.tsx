'use client';

import { useState } from 'react';
import { DataTable } from '@components/data-table';
import { DataTableFilters } from '@components/data-table-filters';
import { DataTablePagination } from '@components/data-table-pagination';
import { SectionHeader } from '@components/section-header';
import { Button } from '@components/ui/button';
import { CreateMeetingDialog } from '@feature/meetings/components/CreateMeetingDialog';
import { useMeetings } from '@feature/meetings/hooks';
import { useMeetingTableColumns } from '@feature/meetings/hooks/useMeetingTableColumns';
import { useUrlFilters } from '@hooks/use-url-filters';
import { Plus } from 'lucide-react';

/**
 * Meetings List Page component.
 * Displays a list of all meetings with filtering and pagination.
 */
export function MeetingsPage() {
  const { page, setPage } = useUrlFilters({ basePath: '/meetings' });

  const [createOpen, setCreateOpen] = useState(false);

  const { meetings, meta, isLoading } = useMeetings({
    page,
  });
  const { columns } = useMeetingTableColumns();

  return (
    <>
      <SectionHeader title="Meetings" description="Manage and view all association meetings">
        <Button onClick={() => setCreateOpen(true)} variant={'default'}>
          <Plus className="mr-2 h-4 w-4" />
          Create Meeting
        </Button>
      </SectionHeader>

      <CreateMeetingDialog open={createOpen} onOpenChange={setCreateOpen} />

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search meetings...',
          },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable loading={isLoading} data={meetings} columns={columns} />

      <DataTablePagination meta={meta} onPageChange={setPage} />
    </>
  );
}
