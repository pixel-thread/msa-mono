import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';

export const useCreateDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { amount: number }) => http.post(ENDPOINTS.CONTRIBUTION.DECLARATIONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS() });
    },
  });
};
