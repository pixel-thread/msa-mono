import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { trainingQueryKeys } from '../../utils/constants';

export function useDeleteTrainingSupplement(moduleId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplementId: string) =>
      http.delete(ENDPOINTS.TRAINING.MODULE_SUPPLEMENT_DETAIL(moduleId!, supplementId)),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: trainingQueryKeys.supplements.all(moduleId),
        });
        toast.success('Supplement deleted successfully');
        return res;
      }
      toast.error(res.message || 'Failed to delete supplement');
      return res;
    },
  });
}
