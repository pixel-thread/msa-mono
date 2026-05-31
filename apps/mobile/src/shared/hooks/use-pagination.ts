import { router, useLocalSearchParams } from 'expo-router';
import { PaginationMeta } from '@sharedTypes/pagination';

export function usePagination(meta?: PaginationMeta | null) {
  const params = useLocalSearchParams();

  const page = Number(params.page ?? 1);

  const next = () => {
    if (!meta?.hasMore) return;

    router.setParams({
      page: String(page + 1),
    });
  };

  const prev = () => {
    if (page <= 1) return;

    router.setParams({
      page: String(page - 1),
    });
  };

  return {
    page,
    next,
    prev,
    hasNext: meta?.hasMore ?? false,
    hasPrev: page > 1,
  };
}
