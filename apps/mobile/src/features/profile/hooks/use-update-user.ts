import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateUserInput } from '../validators';
import { toast } from 'sonner-native';

export function useUpdateUser() {
  const queryKey = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) => http.post<{ id: string }>('/user', data),
    onSuccess: (data) => {
      if (data.success) {
        queryKey.invalidateQueries({ queryKey: ['auth', 'me'] });
        queryKey.invalidateQueries({ queryKey: ['member', data?.data?.id] });
        queryKey.invalidateQueries({ queryKey: ['user'] });
        toast.success(data.message);
        return;
      }
      toast.error(data.message);
      return;
    },
  });
}
