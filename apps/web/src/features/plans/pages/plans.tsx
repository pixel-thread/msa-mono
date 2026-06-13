'use client';

import { CreatePlanDialog } from '@src/features/plans/components/create-plan-dialog';
import { DeletePlanDialog } from '@src/features/plans/components/delete-plan-dialog';
import { EditPlanDialog } from '@src/features/plans/components/edit-plan-dialog';
import { usePlans } from '@src/features/plans/hooks/usePlans';
import { usePlanTableActions } from '@src/features/plans/hooks/usePlanTableActions';
import { usePlanTableColumns } from '@src/features/plans/hooks/usePlanTableColumns';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { useUrlFilters } from '@src/shared/hooks';

import { usePlanStore } from '../stores';

export default function PlansPage() {
  const { page, setPage } = useUrlFilters({ basePath: '/plans' });

  const { isDeletingConfirmOpen, plan, isEditing, setIsEditing, setIsDeletingConfirmOpen } =
    usePlanStore();

  const { plans, meta, isLoading } = usePlans({ page });
  const { onDelete, isPending } = usePlanTableActions();

  const { columns } = usePlanTableColumns();

  const handleDeleteConfirm = () => {
    if (plan && isDeletingConfirmOpen) {
      onDelete(plan.id);
    }
  };

  return (
    <>
      <SectionHeader
        title="Subscription Plans"
        description="Manage subscription plans for your association"
      >
        <CreatePlanDialog />
      </SectionHeader>

      <DataTableFilters
        fields={[
          {
            type: 'search',
            id: 'search',
            placeholder: 'Search plans...',
          },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable loading={isLoading} data={plans} columns={columns} />

      <DataTablePagination meta={meta} onPageChange={setPage} label="plans" />

      <EditPlanDialog
        planId={plan?.id || ''}
        open={isEditing}
        onOpenChange={(open) => setIsEditing(open)}
      />

      <DeletePlanDialog
        plan={plan}
        open={isDeletingConfirmOpen}
        onOpenChange={(open) => setIsDeletingConfirmOpen(open)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isPending}
      />
    </>
  );
}
