import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useSetDefaultPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => http.post(ENDPOINTS.PLANS.PLANS_DEFAULT, { planId }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Default plan updated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLANS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to set default plan');
    },
  });
}
