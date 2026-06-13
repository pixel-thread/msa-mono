'use client';

import { Link } from '@tanstack/react-router';

import { Plan } from '../../types';

interface PlanNameCellProps {
  plan: Plan;
}

export function PlanNameCell({ plan }: PlanNameCellProps) {
  return (
    <Link to="/plans/$planId" params={{ planId: plan.id }} className="flex flex-col">
      <span className="text-sm font-medium">{plan.name}</span>
      {plan.description && (
        <span className="text-xs text-muted-foreground line-clamp-1">{plan.description}</span>
      )}
    </Link>
  );
}
