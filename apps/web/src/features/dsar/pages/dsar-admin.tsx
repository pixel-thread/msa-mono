'use client';

import { useCallback,useState } from 'react';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';

import { DsarAssignDialog } from '../components/dsar-assign-dialog';
import { DsarDeleteDialog } from '../components/dsar-delete-dialog';
import { DsarDetailDialog } from '../components/dsar-detail-dialog';
import { DsarRejectDialog } from '../components/dsar-reject-dialog';
import { DsarRespondDialog } from '../components/dsar-respond-dialog';
import { DsarSlaCards } from '../components/dsar-sla-cards';
import { useDeleteDsarTicket, useDsarColumns,useDsarTickets } from '../hooks';
import type { DsarTicketRecord } from '../types';

const requestTypes = [
  'ACCESS',
  'DELETION',
  'PORTABILITY',
  'RECTIFICATION',
  'RESTRICTION',
  'OBJECTION',
];
const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];

export default function DsarAdminPage() {
  const [page, setPage] = useState(1);

  const [detailRecord, setDetailRecord] = useState<DsarTicketRecord | null>(null);
  const [respondRecord, setRespondRecord] = useState<DsarTicketRecord | null>(null);
  const [rejectRecord, setRejectRecord] = useState<DsarTicketRecord | null>(null);
  const [assignRecord, setAssignRecord] = useState<DsarTicketRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<DsarTicketRecord | null>(null);

  const { tickets, meta, isLoading } = useDsarTickets({
    page,
    limit: 10,
  });

  const deleteDsarTicket = useDeleteDsarTicket();

  const { columns } = useDsarColumns({
    onViewDetail: setDetailRecord,
    onRespond: (record) => {
      if (record.status === 'REJECTED' || record.status === 'COMPLETED') {
        setDetailRecord(record);
      } else {
        setRespondRecord(record);
      }
    },
    onAssign: setAssignRecord,
    onDelete: setDeletingRecord,
  });

  const handleDeleteConfirm = useCallback(() => {
    if (deletingRecord) {
      deleteDsarTicket.mutate(deletingRecord.id, {
        onSuccess: () => setDeletingRecord(null),
      });
    }
  }, [deletingRecord, deleteDsarTicket]);

  return (
    <>
      <SectionHeader
        title="DSAR Management"
        description="Manage data subject access requests across your association"
      />

      <DsarSlaCards />

      <DataTableFilters
        fields={[
          {
            type: 'select',
            id: 'requestType',
            label: 'Type',
            options: requestTypes.map((t) => ({
              value: t,
              label: t.charAt(0) + t.slice(1).toLowerCase(),
            })),
          },
          {
            type: 'select',
            id: 'status',
            label: 'Status',
            options: statuses.map((s) => ({
              value: s,
              label: s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase(),
            })),
          },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable
        loading={isLoading}
        data={tickets as unknown as DsarTicketRecord[]}
        columns={columns}
      />

      <DataTablePagination meta={meta} onPageChange={setPage} label="requests" />

      <DsarDetailDialog
        record={detailRecord}
        open={!!detailRecord}
        onOpenChange={(open) => {
          if (!open) setDetailRecord(null);
        }}
      />

      <DsarRespondDialog
        record={respondRecord}
        open={!!respondRecord}
        onOpenChange={(open) => {
          if (!open) setRespondRecord(null);
        }}
      />

      <DsarRejectDialog
        record={rejectRecord}
        open={!!rejectRecord}
        onOpenChange={(open) => {
          if (!open) setRejectRecord(null);
        }}
      />

      <DsarAssignDialog
        record={assignRecord}
        open={!!assignRecord}
        onOpenChange={(open) => {
          if (!open) setAssignRecord(null);
        }}
      />

      <DsarDeleteDialog
        open={!!deletingRecord}
        onOpenChange={(open) => {
          if (!open) setDeletingRecord(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteDsarTicket.isPending}
      />
    </>
  );
}
