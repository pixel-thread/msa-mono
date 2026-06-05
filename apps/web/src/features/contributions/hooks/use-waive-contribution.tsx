import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WaiveContributionInput } from '../validators';

export const useWaiveContribution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WaiveContributionInput) => http.patch(ENDPOINTS.CONTRIBUTION.WAIVE, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['all-contributions'] });
        queryClient.invalidateQueries({ queryKey: ['user-contributions'] });
      }
    },
  });
};
