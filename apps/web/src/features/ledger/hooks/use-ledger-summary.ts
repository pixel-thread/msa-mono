import { ENDPOINTS } from '@repo/shared';
import type { Account } from '@src/shared/types';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

export interface LedgerSummaryResponse {
  accounts: Account[];
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    totalIncome: number;
    totalExpenses: number;
    pendingCount: number;
    approvedCount: number;
    isBalanced: boolean;
  };
}

export function useLedgerSummary() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ledger-summary'],
    queryFn: () => http.get<LedgerSummaryResponse>(ENDPOINTS.LEDGER.SUMMARY),
  });

  return {
    summaryData: data?.data,
    isLoading,
    error,
    refetch,
  };
}
