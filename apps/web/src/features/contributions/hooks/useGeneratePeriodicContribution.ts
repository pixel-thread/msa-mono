import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useGeneratePeriodicContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { year: number }) => http.post(ENDPOINTS.CONTRIBUTION.GENERATE, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL() });
      }
    },
  });
}
