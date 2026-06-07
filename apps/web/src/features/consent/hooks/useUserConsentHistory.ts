import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import type { ApiResponse } from '@src/shared/utils/http';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { ConsentReceiptRecord } from '../types/consent.types';

export function useUserConsentHistory(userId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.HISTORY(userId),
    queryFn: async () => http.get<ConsentReceiptRecord[]>(ENDPOINTS.CONSENT.USER_CONSENTS(userId!)),
    enabled: !!userId,
  });

  return {
    records: ((data as ApiResponse<ConsentReceiptRecord[]>)?.data as ConsentReceiptRecord[]) ?? [],
    isLoading,
    error,
  };
}
