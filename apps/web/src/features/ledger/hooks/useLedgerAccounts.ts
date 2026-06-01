import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Account } from '@src/shared/types';
import { ledgerEndpoints } from '../utils/constants/endpoints';

type UseLedgerAccounts = {
  page?: number;
};

export function useLedgerAccounts({ page }: UseLedgerAccounts = { page: 1 }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ledger-accounts', page],
    queryFn: () => http.get<Account[]>(`${ledgerEndpoints.accounts}?page=${page}`),
  });

  return {
    accounts: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
