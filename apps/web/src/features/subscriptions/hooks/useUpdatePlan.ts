import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@utils/http';
import { toast } from 'sonner';

import { EditPlanInput } from '../validators';

interface UpdatePlanData extends EditPlanInput {
  planId: string;
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, ...data }: UpdatePlanData) =>
      http.patch(ENDPOINTS.SUBSCRIPTIONS.PLAN_DETAILS(planId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan updated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to update plan');
    },
  });
}
