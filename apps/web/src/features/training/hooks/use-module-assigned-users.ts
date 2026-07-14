import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { AssignedUserWithCompletion } from '../types';

export function useModuleAssignedUsers(moduleId: string | null, page?: number) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.TRAINING_KEYS.ASSIGNED_USERS(moduleId, page),
    queryFn: async () =>
      http.get<AssignedUserWithCompletion[]>(
        buildUrlWithQuery(ENDPOINTS.TRAINING.MODULE_ASSIGNED_USERS(moduleId!), { page }),
      ),
    enabled: !!moduleId,
  });

  const completeAssignmentMutation = useMutation({
    mutationFn: ({
      userId,
      scorePercent,
      certificateOption,
      certificateFile,
    }: {
      userId: string;
      scorePercent?: number;
      certificateOption?: 'none' | 'global' | 'custom';
      certificateFile?: File | null;
    }) => {
      const metadata = {
        scorePercent,
        certificateOption: certificateOption || 'none',
      };

      if (certificateOption === 'custom' && certificateFile) {
        const formData = new FormData();
        formData.append('file', certificateFile);
        formData.append('metadata', JSON.stringify(metadata));
        return http.post(ENDPOINTS.TRAINING.MODULE_COMPLETE_USER(moduleId!, userId), formData);
      }

      return http.post(ENDPOINTS.TRAINING.MODULE_COMPLETE_USER(moduleId!, userId), metadata);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.ASSIGNED_USERS_BASE(),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_ADMIN(),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_MY(),
        });
        toast.success('User marked as completed successfully');
        return res;
      }
      toast.error(res.message || 'Failed to mark as completed');
      return res;
    },
  });

  const meta = data?.meta;
  const users = data?.data;
  return {
    assignedUsers: users ?? [],
    isLoading,
    meta: meta,
    completeAssignment: completeAssignmentMutation.mutate,
    isCompleting: completeAssignmentMutation.isPending,
    refetch,
  };
}
