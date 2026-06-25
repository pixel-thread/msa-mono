import { ENDPOINTS } from '@repo/shared';
import { useAuthStore } from '@src/shared/stores';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

export function useSignOut() {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: async () => http.post(ENDPOINTS.AUTH.LOGOUT, {}),
    onSuccess: (data) => {
      if (data.success) setUser(null);
    },
  });
}
