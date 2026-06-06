import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

interface ChangePlanData {
  planId: string;
  userId: string;
}

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, userId }: ChangePlanData) =>
      http.post(subscriptionEndpoints.upgrade, { planId, userId }),
    onSuccess: (data, variables) => {
      const { userId } = variables;
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.USER(userId, 1) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS() });
        toast.success(data.message);
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to change plan');
    },
  });
}
