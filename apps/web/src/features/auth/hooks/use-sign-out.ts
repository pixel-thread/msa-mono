import { useMutation } from '@tanstack/react-query';

import http from '@src/shared/utils/http';
import { ENDPOINTS } from '@repo/shared';

export function useSignOut() {
  return useMutation({
    mutationFn: async () => http.post(ENDPOINTS.AUTH.LOGOUT, {}),
  });
}
