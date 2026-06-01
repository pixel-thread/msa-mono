import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';

export interface IncomeStatementLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface IncomeStatementResponse {
  income: IncomeStatementLine[];
  expenses: IncomeStatementLine[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}

export function useIncomeStatement(startDate?: string, endDate?: string) {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set('startDate', startDate);
  if (endDate) queryParams.set('endDate', endDate);

  const { data, isLoading, error } = useQuery({
    queryKey: ['income-statement', startDate, endDate],
    queryFn: () => http.get<IncomeStatementResponse>(`${ledgerEndpoints.incomeStatement}?${queryParams.toString()}`),
  });

  return { data: data?.data, isLoading, error };
}
