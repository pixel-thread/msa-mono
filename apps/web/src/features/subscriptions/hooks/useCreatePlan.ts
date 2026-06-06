import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import type { CreateSubscriptionPlanInput } from '../validators';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanInput) => http.post(subscriptionEndpoints.plans, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan created successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to create plan');
    },
  });
}
