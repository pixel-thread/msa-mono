import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { CreatePlanInput } from '../validators';

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanInput) => http.post(ENDPOINTS.PLANS.PLANS, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan created successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLANS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to create plan');
    },
  });
}
