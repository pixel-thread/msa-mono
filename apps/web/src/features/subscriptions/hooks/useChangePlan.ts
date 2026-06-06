import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
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
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan changed successfully');
        queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to change plan');
    },
  });
}
