import { usePlanStore } from '../stores';

import { useDeletePlan } from './use-delete-plan';
import { useSetDefaultPlan } from './use-set-default-plan';
import { useUpdatePlan } from './use-update-plan';

export function usePlanTableActions() {
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const setDefaultPlan = useSetDefaultPlan();
  const { setPlan, setIsDeletingConfirmOpen } = usePlanStore();

  return {
    onStatusChange: (planId: string, isActive: boolean) => {
      updatePlan.mutate({ planId, isActive });
    },
    onDelete: (planId: string) => {
      deletePlan.mutate(planId, {
        onSuccess: (data) => {
          if (data.success) {
            setPlan(null);
            setIsDeletingConfirmOpen(false);
          }
        },
      });
    },
    onSetDefault: (planId: string) => {
      setDefaultPlan.mutate(planId);
    },
    isPending: updatePlan.isPending || deletePlan.isPending,
  };
}
