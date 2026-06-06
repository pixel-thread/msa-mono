import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';

interface WaiveSubscriptionData {
  subscriptionId: string;
  reason: string;
}

export function useWaiveSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, reason }: WaiveSubscriptionData) =>
      http.post(ENDPOINTS.SUBSCRIPTIONS.WAIVE, { subscriptionId, reason }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Subscription waived successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.MY() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to waive subscription');
    },
  });
}
