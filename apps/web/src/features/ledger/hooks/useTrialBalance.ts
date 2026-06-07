import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

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
    queryFn: () => http.get<TrialBalanceLine>(ENDPOINTS.LEDGER.TRIAL_BALANCE),
  });

  return { data: data?.data, isLoading, error };
}
