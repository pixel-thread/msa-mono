'use client';

import { useState } from 'react';
import { useUrlFilters } from '@src/shared/hooks';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { useDeclarations } from '../hooks/declarations/use-declarations';
import { useDeclarationsColumns } from '../hooks/declarations/use-declarations-columns';
import { ApproveDialog } from '../components/declarations/approve-dialog';
import { RejectDialog } from '../components/declarations/reject-dialog';
import type { Declaration } from '../types';

export default function DeclarationsPage() {
  const { filters, page, setPage, setFilters } = useUrlFilters({
    basePath: '/contributions/declarations',
  });

  const [approveTarget, setApproveTarget] = useState<Declaration | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Declaration | null>(null);

  const { declarations, meta, isLoading } = useDeclarations({
    page,
    ...filters,
  });

  const { columns } = useDeclarationsColumns({
    onApprove: (declaration) => setApproveTarget(declaration),
    onReject: (declaration) => setRejectTarget(declaration),
  });

  return (
    <>
      <SectionHeader
        title="Declarations"
        description="View and manage member declarations"
      />

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search by member name or email...',
          },
          {
            type: 'select',
            id: 'status',
            label: 'Status',
            options: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ],
          },
        ]}
        onFilterChange={setFilters}
      />

      <DataTable columns={columns} data={declarations} loading={isLoading} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="declarations" />

      <ApproveDialog
        declaration={approveTarget}
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
      />

      <RejectDialog
        declaration={rejectTarget}
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      />
    </>
  );
}
