import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

interface SubscribeData {
  planId: string;
}

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId }: SubscribeData) => http.post(subscriptionEndpoints.subscribe, { planId }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Subscribed successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.MY() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to subscribe');
    },
  });
}
