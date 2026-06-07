import { ENDPOINTS } from '@repo/shared';
import type { Account } from '@src/shared/types';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

type UseLedgerAccounts = {
  page?: number;
};

export function useLedgerAccounts({ page }: UseLedgerAccounts = { page: 1 }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ledger-accounts', page],
    queryFn: () => http.get<Account[]>(`${ENDPOINTS.LEDGER.ACCOUNTS}?page=${page}`),
  });

  return {
    accounts: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
