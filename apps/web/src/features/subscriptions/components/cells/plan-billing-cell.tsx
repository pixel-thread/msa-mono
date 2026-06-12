'use client';

import { Badge } from '@src/shared/components/ui/badge';

import { Plan } from '../../types';

interface PlanBillingCellProps {
  plan: Plan;
}

export function PlanBillingCell({ plan }: PlanBillingCellProps) {
  const billingCycle = plan.activeVersion?.billingCycle ?? 'MONTHLY';
  const variant = billingCycle === 'YEARLY' ? 'default' : 'secondary';

  return (
    <Badge variant={variant} className="capitalize">
      {billingCycle.toLowerCase()}
    </Badge>
  );
}
