import { usePlanStore } from '../stores';

import { useDeletePlan } from './useDeletePlan';
import { useSetDefaultPlan } from './useSetDefaultPlan';
import { useUpdatePlan } from './useUpdatePlan';

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
