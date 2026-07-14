import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { UpdateSupplementInput } from '../../validators/training';

export function useUpdateTrainingSupplement(moduleId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      supplementId,
      data,
    }: {
      supplementId: string;
      data: UpdateSupplementInput | FormData;
    }) => http.patch(ENDPOINTS.TRAINING.MODULE_SUPPLEMENT_DETAIL(moduleId!, supplementId), data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.SUPPLEMENTS(moduleId),
        });
        toast.success('Supplement updated successfully');
        return res;
      }
      toast.error(res.message || 'Failed to update supplement');
      return res;
    },
  });
}
