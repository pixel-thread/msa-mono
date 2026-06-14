import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateUserInput } from '../validators';
import { toast } from 'sonner-native';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) => http.post<{ id: string }>(ENDPOINTS.USER.PROFILE, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_KEYS.ME() });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.MEMBERS_KEYS.DETAIL(data?.data?.id ?? ''),
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_KEYS.USER() });
        toast.success(data.message);
        return;
      }
      toast.error(data.message);
      return;
    },
  });
}
