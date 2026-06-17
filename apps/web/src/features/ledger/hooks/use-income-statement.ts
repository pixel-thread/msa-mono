import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export type IncomeStatementDetail = {
  accountId: string;

  code: string;

  name: string;

  type: Extract<AccountType, 'INCOME' | 'EXPENSE'>;

  balance: string;
};

export type IncomeStatementLine = {
  details: IncomeStatementDetail[];

  totalIncome: string;

  totalExpense: string;

  netIncome: string;
};

export function useIncomeStatement(startDate?: string, endDate?: string) {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set('startDate', startDate);
  if (endDate) queryParams.set('endDate', endDate);

  const { data, isLoading, error } = useQuery({
    queryKey: ['income-statement', startDate, endDate],
    queryFn: () =>
      http.get<IncomeStatementLine>(
        `${ENDPOINTS.LEDGER.INCOME_STATEMENT}?${queryParams.toString()}`,
      ),
  });

  return { data: data?.data, isLoading, error };
}
