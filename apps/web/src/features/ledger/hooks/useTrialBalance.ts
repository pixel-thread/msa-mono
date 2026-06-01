import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';

export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceResponse {
  lines: TrialBalanceLine[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export function useTrialBalance() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: () => http.get<TrialBalanceResponse>(ledgerEndpoints.trialBalance),
  });

  return { data: data?.data, isLoading, error };
}
