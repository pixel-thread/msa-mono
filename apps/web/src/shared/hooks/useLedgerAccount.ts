import { ENDPOINTS } from '@repo/shared';
import type { Account } from '@src/shared/types';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { IncomeStatementLine } from './useIncomeStatement';
import type { TrialBalanceLine } from './useTrialBalance';

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
