import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

export function useSetDefaultPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => http.post(subscriptionEndpoints.default, { planId }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Default plan updated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to set default plan');
    },
  });
}
