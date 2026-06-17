'use client';

import { useState } from 'react';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import { useUrlFilters } from '@src/shared/hooks';

import { ApplicationReviewDialog } from '../components/application-review-dialog';
import { useMembershipApplicationColumns } from '../hooks/use-membership-application-columns';
import { useMembershipApplications } from '../hooks/use-membership-applications';
import { useRejectApplication } from '../hooks/use-reject-application';
import { MembershipApplicationListItem } from '../types';

export function MembershipApplicationsPage() {
  const { page, setPage } = useUrlFilters({
    basePath: '/members/applications',
  });
  const [selectedApplication, setSelectedApplication] =
    useState<MembershipApplicationListItem | null>(null);

  const rejectApplication = useRejectApplication();

  const { applications, pagination, isLoading } = useMembershipApplications({
    page,
    status: 'PENDING',
  });

  const { columns } = useMembershipApplicationColumns({
    onReview: setSelectedApplication,
    onReject: (applicationId: string) =>
      rejectApplication.mutate({
        applicationId,
        rejectionReason: 'Application rejected by admin',
      }),
    isRejecting: rejectApplication.isPending,
  });

  return (
    <>
      <SectionHeader
        title="Membership Applications"
        description="Review and manage new membership applications"
      />

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search applications...',
          },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable loading={isLoading} data={applications} columns={columns} />

      {pagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} applications
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ApplicationReviewDialog
        application={selectedApplication}
        open={!!selectedApplication}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplication(null);
          }
        }}
      />
    </>
  );
}
