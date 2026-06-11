import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import type { PaginationMeta } from '@src/shared/types';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

export interface LedgerLineResponse {
  id: string;
  ledgerEntryId: string;
  accountId: string;
  isDebit: boolean;
  amount: number;
  createdAt: string;
}

export interface LedgerEntryResponse {
  id: string;
  paymentTransactionId: string | null;
  description: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdById: string;
  approvedById: string | null;
  createdAt: string;
  updatedAt: string;
  lines: LedgerLineResponse[];
}

interface UseLedgerEntriesParams {
  page?: number;
}

export function useLedgerEntries(params: UseLedgerEntriesParams = {}) {
  const { page = 1 } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.LEDGER_KEYS.ENTRIES_LIST(page),
    queryFn: () =>
      http.get<LedgerEntryResponse[]>(buildUrlWithQuery(ENDPOINTS.LEDGER.ENTRIES, { page })),
  });

  return {
    entries: data?.data ?? [],
    meta: data?.meta as PaginationMeta | undefined,
    isLoading,
    error,
    refetch,
  };
}
