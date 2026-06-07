import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UpdatePlanData {
  planId: string;
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  billingCycle?: 'MONTHLY' | 'YEARLY';
  features?: Record<string, unknown>;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  memberTypeId?: string | null;
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, ...data }: UpdatePlanData) =>
      http.patch(ENDPOINTS.SUBSCRIPTIONS.PLAN_DETAILS(planId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan updated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to update plan');
    },
  });
}
