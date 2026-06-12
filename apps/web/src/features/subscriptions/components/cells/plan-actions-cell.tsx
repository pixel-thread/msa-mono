'use client';

import { Button } from '@src/shared/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

import { Plan } from '../../types';

interface PlanActionsCellProps {
  plan: Plan;
  onDelete: (planId: string) => void;
  onEdit: (plan: Plan) => void;
}

export function PlanActionsCell({ plan, onDelete, onEdit }: PlanActionsCellProps) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <Button size="sm" variant="ghost" onClick={() => onEdit(plan)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onDelete(plan.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
