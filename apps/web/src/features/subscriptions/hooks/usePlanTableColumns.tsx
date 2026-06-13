import { PlanActionsCell } from '@src/features/subscriptions/components/cells/plan-actions-cell';
import { PlanAmountCell } from '@src/features/subscriptions/components/cells/plan-amount-cell';
import { PlanBillingCell } from '@src/features/subscriptions/components/cells/plan-billing-cell';
import { PlanDefaultCell } from '@src/features/subscriptions/components/cells/plan-default-cell';
import { PlanNameCell } from '@src/features/subscriptions/components/cells/plan-name-cell';
import { PlanStatusCell } from '@src/features/subscriptions/components/cells/plan-status-cell';
import { formatDate } from '@src/shared/utils';
import { ColumnDef } from '@tanstack/react-table';

import { Plan } from '../types';

export const usePlanTableColumns = (): { columns: ColumnDef<Plan>[] } => {
  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }) => <PlanDefaultCell plan={row.original} />,
    },
    {
      accessorKey: 'name',
      header: 'Plan',
      cell: ({ row }) => <PlanNameCell plan={row.original} />,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <PlanAmountCell plan={row.original} />,
    },
    {
      accessorKey: 'billingCycle',
      header: 'Billing Cycle',
      cell: ({ row }) => <PlanBillingCell plan={row.original} />,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <PlanStatusCell plan={row.original} />,
    },
    {
      header: 'Effective From',
      cell: ({ row }) => (
        <span className="text-right text-muted-foreground text-sm block ml-auto">
          {formatDate(row.original.activeVersion?.effectiveFrom)}
        </span>
      ),
    },
    {
      header: 'Effective TO',
      cell: ({ row }) => (
        <span className="text-right text-muted-foreground text-sm block ml-auto">
          {row.original.activeVersion?.effectiveTo
            ? formatDate(row.original.activeVersion?.effectiveTo)
            : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => <PlanActionsCell plan={row.original} />,
    },
  ];

  return { columns };
};
