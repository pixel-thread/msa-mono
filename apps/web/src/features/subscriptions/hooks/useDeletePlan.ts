import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => http.delete(subscriptionEndpoints.planById(planId)),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan deleted successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to delete plan');
    },
  });
}
