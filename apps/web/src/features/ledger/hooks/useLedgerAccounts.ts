import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { Account } from '@src/shared/types';

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
