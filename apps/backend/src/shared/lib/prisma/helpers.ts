import { PAGE_SIZE } from '@src/shared/constants';

export interface PaginatedQueryResult {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function paginatedQuery(page: number = 1, pageSize: number = PAGE_SIZE): PaginatedQueryResult {
  const p = Math.max(1, page);
  return {
    skip: (p - 1) * pageSize,
    take: pageSize,
    page: p,
    pageSize,
  };
}
