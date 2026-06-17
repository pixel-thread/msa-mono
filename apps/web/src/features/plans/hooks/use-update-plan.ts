import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@utils/http';
import { toast } from 'sonner';

import { UpdatePlanInput } from '../validators';

interface UpdatePlanData extends UpdatePlanInput {
  planId: string;
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, ...data }: UpdatePlanData) =>
      http.patch(ENDPOINTS.PLANS.PLAN_DETAILS(planId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan updated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLANS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to update plan');
    },
  });
}
