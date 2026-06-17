export const getNextPageParam = (nextPage: { meta?: { hasMore?: boolean; page: number } }) => {
  if (!nextPage.meta?.hasMore) return undefined;
  return nextPage.meta.page + 1;
};

export const getPreviousPageParam = (prev: { meta?: { page: number } }) => {
  if (!prev.meta || prev.meta.page <= 1) return undefined;
  return prev.meta.page - 1;
};

export const flattenPages = <T>(res: { pages: { data?: T[] }[] }) =>
  res.pages.flatMap((page) => page.data ?? []);
