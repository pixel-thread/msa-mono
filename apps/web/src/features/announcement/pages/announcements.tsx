'use client';

import { useMemo, useState } from 'react';
import { CreateAnnouncementDialog } from '@src/features/announcement/components/create-announcement-dialog';
import { DeleteAnnouncementDialog } from '@src/features/announcement/components/delete-announcement-dialog';
import { EditAnnouncementDialog } from '@src/features/announcement/components/edit-announcement-dialog';
import { useAnnouncementColumns } from '@src/features/announcement/hooks/use-announcement-columns';
import { useAnnouncementsList } from '@src/features/announcement/hooks/use-announcements-list';
import { useDeleteAnnouncement } from '@src/features/announcement/hooks/use-delete-announcement';
import type { Announcement } from '@src/features/announcement/types';
import { announcementListFilters } from '@src/features/announcement/utils/constants';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { useUrlFilters } from '@src/shared/hooks';

export default function AnnouncementsPage() {
  const basePath = useMemo(() => `/announcement`, []);
  const { page = 1, setPage, setFilters, filters } = useUrlFilters({ basePath });

  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  const { announcements, meta, isLoading } = useAnnouncementsList({ options: filters, page });
  const deleteAnnouncement = useDeleteAnnouncement();

  const { columns } = useAnnouncementColumns({
    onEdit: setEditingAnnouncement,
    onDelete: setDeletingAnnouncement,
  });

  const handleDeleteConfirm = () => {
    if (deletingAnnouncement) {
      deleteAnnouncement.mutate(deletingAnnouncement.id, {
        onSuccess: () => setDeletingAnnouncement(null),
      });
    }
  };

  return (
    <>
      <SectionHeader title="Announcements" description="Manage announcements for your association">
        <CreateAnnouncementDialog />
      </SectionHeader>

      <DataTableFilters
        fields={announcementListFilters}
        onFilterChange={(filters) => setFilters(filters)}
      />

      <DataTable loading={isLoading} data={announcements} columns={columns} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="announcements" />

      <EditAnnouncementDialog
        announcement={editingAnnouncement}
        open={!!editingAnnouncement}
        onOpenChange={(open) => {
          if (!open) setEditingAnnouncement(null);
        }}
      />

      <DeleteAnnouncementDialog
        announcement={deletingAnnouncement}
        open={!!deletingAnnouncement}
        onOpenChange={(open) => {
          if (!open) setDeletingAnnouncement(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteAnnouncement.isPending}
      />
    </>
  );
}
