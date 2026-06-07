import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import type { ConsentReceiptRecord } from '../types/consent.types';
import type { PaginationMeta } from '@src/shared/types/api.types';
import type { ApiResponse } from '@src/shared/utils/http';
import { ENDPOINTS, buildUrlWithQuery } from '@repo/shared';

interface UseConsentRecordsOptions {
  page?: number;
  pageSize?: number;
  purpose?: string;
  status?: string;
  search?: string;
}

export function useConsentRecords(options?: UseConsentRecordsOptions) {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.pageSize) params.set('pageSize', String(options.pageSize));
  if (options?.purpose) params.set('purpose', options.purpose);
  if (options?.status) params.set('status', options.status);
  if (options?.search) params.set('search', options.search);

  const qs = params.toString();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.RECORDS(options),
    queryFn: async () =>
      http.get<ConsentReceiptRecord[]>(
        qs
          ? buildUrlWithQuery(ENDPOINTS.CONSENT.ALL, Object.fromEntries(params))
          : ENDPOINTS.CONSENT.ALL,
      ),
  });

  return {
    records: (data as ApiResponse<ConsentReceiptRecord[]>)?.data ?? [],
    meta: (data as ApiResponse<ConsentReceiptRecord[]>)?.meta as PaginationMeta | undefined,
    isLoading,
    error,
    refetch,
  };
}
