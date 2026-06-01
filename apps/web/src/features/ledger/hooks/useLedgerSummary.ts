import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';
import type { Account } from '@src/shared/types';

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
    queryFn: () => http.get<LedgerSummaryResponse>(ledgerEndpoints.summary),
  });

  return {
    summaryData: data?.data,
    isLoading,
    error,
    refetch,
  };
}