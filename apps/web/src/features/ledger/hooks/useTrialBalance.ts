import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export type TrialBalanceAccount = {
  accountId: string;

  code: string;

  name: string;

  type: AccountType;

  debitTotal: string;

  creditTotal: string;

  balance: string;
};

export type TrialBalanceLine = {
  balances: TrialBalanceAccount[];

  totalDebits: string;

  totalCredits: string;

  isBalanced: boolean;
};

export function useTrialBalance() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: () => http.get<TrialBalanceLine>(ledgerEndpoints.trialBalance),
  });

  return { data: data?.data, isLoading, error };
}
