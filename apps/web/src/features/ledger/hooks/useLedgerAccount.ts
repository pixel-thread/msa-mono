import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Account } from '@src/shared/types';
import { ledgerEndpoints } from '../utils/constants/endpoints';
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
    queryFn: () => http.get<AccountDetailResponse>(ledgerEndpoints.accountsDetails(id)),
    enabled: !!id,
  });

  return {
    account: data?.data,
    isLoading,
    error,
  };
}
