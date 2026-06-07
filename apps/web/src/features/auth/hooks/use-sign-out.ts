import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

export function useSignOut() {
  return useMutation({
    mutationFn: async () => http.post(ENDPOINTS.AUTH.LOGOUT, {}),
  });
}
