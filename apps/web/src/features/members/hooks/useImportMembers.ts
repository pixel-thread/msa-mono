import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface ImportResult {
  created: number;
  skipped: number;
  errors: Array<{ row: number; email: string; reason: string }>;
}

export function useImportMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return http.post<ImportResult>(ENDPOINTS.ADMIN.IMPORT_USERS_CSV, formData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS_KEYS.ALL() });
        return;
      }
      toast.error(data.message);
    },
  });
}
