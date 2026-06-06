import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { Account } from '@src/shared/types';
import type { TrialBalanceLine } from './useTrialBalance';
import type { IncomeStatementLine } from './useIncomeStatement';

export interface AccountDetailResponse extends Account {
  report: {
    trailBalance: TrialBalanceLine;
    incomeStatement: IncomeStatementLine;
  };
}

export function useLedgerAccount(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ledger-account', id],
    queryFn: () => http.get<AccountDetailResponse>(ENDPOINTS.LEDGER.ACCOUNT_DETAIL(id)),
    enabled: !!id,
  });

  return {
    account: data?.data,
    isLoading,
    error,
  };
}
