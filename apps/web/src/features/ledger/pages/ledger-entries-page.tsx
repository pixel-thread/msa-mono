'use client';

import { useCallback, useState } from 'react';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@src/shared/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { ApproveEntryDialog } from '../components/approve-entry-dialog';
import { CreateEntryDialog } from '../components/create-entry-dialog';
import { RejectEntryDialog } from '../components/reject-entry-dialog';
import { type LedgerEntryResponse, useLedgerEntries } from '../hooks/useLedgerEntries';
import { useLedgerEntriesColumns } from '../hooks/useLedgerEntriesColumns';

export default function LedgerEntriesPage() {
  const navigate = useNavigate();
  const { page, setPage } = useUrlFilters({ basePath: '/ledger/entries' });

  const [createOpen, setCreateOpen] = useState(false);

  const [approveTarget, setApproveTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const [rejectTarget, setRejectTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const { entries, meta, isLoading } = useLedgerEntries({
    page,
  });

  const handleViewDetails = useCallback(
    (entry: LedgerEntryResponse) => {
      navigate({ to: `/ledger/entries/${entry.id}` });
    },
    [navigate],
  );

  const handleApprove = useCallback((entry: LedgerEntryResponse) => {
    setApproveTarget({ id: entry.id, description: entry.description });
  }, []);

  const handleReject = useCallback((entry: LedgerEntryResponse) => {
    setRejectTarget({ id: entry.id, description: entry.description });
  }, []);

  const { columns } = useLedgerEntriesColumns({
    onViewDetails: handleViewDetails,
    onApprove: handleApprove,
    onReject: handleReject,
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[36px] font-normal leading-tight tracking-tight text-ink">
            Ledger Entries
          </h1>
          <p className="mt-1 text-base text-body">View and manage all ledger transactions</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Entry
        </Button>
      </div>

      <DataTableFilters
        fields={[
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
        onFilterChange={() => {}}
      />

      <DataTable loading={isLoading} data={entries} columns={columns} />

      <DataTablePagination meta={meta} onPageChange={setPage} />

      <CreateEntryDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ApproveEntryDialog
        entryId={approveTarget?.id ?? null}
        entryDescription={approveTarget?.description ?? ''}
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
      />
      <RejectEntryDialog
        entryId={rejectTarget?.id ?? null}
        entryDescription={rejectTarget?.description ?? ''}
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      />
    </>
  );
}
