import http from '@src/shared/utils/http';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, ENDPOINTS, buildUrlWithQuery } from '@repo/shared';
import { PaymentSummary, Transaction } from '../types/payment';
import { useAuthStore } from '@src/shared/store';

type PaymentHistory = {
  transactions: Transaction[];
  summary: PaymentSummary;
};

export function usePaymentHistory() {
  const { isAuthenticated } = useAuthStore();
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.LIST(),
    queryFn: ({ pageParam }) =>
      http.get<PaymentHistory>(buildUrlWithQuery(ENDPOINTS.PAYMENTS.HISTORY, { page: pageParam })),
    initialPageParam: 1,
    enabled: isAuthenticated,

    getNextPageParam: (nextPage) => {
      if (!nextPage.meta?.hasMore) {
        return undefined;
      }

      return nextPage.meta.page + 1;
    },

    getPreviousPageParam: (prev) => {
      if (!prev.meta || prev.meta.page <= 1) {
        return undefined;
      }

      return prev.meta.page - 1;
    },

    select: (res) => {
      const data = res.pages.flatMap((page) => page.data ?? []);
      const transactions = data.flatMap((item) => item.transactions);
      const summary = data.flatMap((item) => item.summary)[0];
      const meta = res.pages[res.pages.length - 1]?.meta;
      return {
        transactions,
        summary,
        meta,
      };
    },
  });

  return {
    ...query,
    transactions: query.data?.transactions ?? [],
    summary: query.data?.summary ?? {},
    meta: query.data?.meta,
  };
}
