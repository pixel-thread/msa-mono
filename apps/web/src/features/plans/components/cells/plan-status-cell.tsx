'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import { Plan_STATUS } from '@src/shared/types';

import { usePlanTableActions } from '../../hooks/usePlanTableActions';
import { Plan } from '../../types';
import { getPlanStatusBadge } from '../../utils/helper/get-plan-status-badge';

interface PlanStatusCellProps {
  plan: Plan;
}

export function PlanStatusCell({ plan }: PlanStatusCellProps) {
  const { onStatusChange } = usePlanTableActions();
  return (
    <Select
      value={plan.isActive ? 'ACTIVE' : 'INACTIVE'}
      onValueChange={(newStatus) => {
        onStatusChange(plan.id, newStatus === 'ACTIVE');
      }}
    >
      <SelectTrigger className="h-8 w-35 border-hairline">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Plan_STATUS).map((status) => (
          <SelectItem key={status} value={status}>
            {getPlanStatusBadge(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
