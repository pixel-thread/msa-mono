import { PAGE_SIZE } from '@src/shared/constants';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function buildPaginationParams(page: number = 1): PaginationParams {
  const p = Math.max(1, page);
  const pageSize = PAGE_SIZE;
  return {
    skip: (p - 1) * pageSize,
    take: pageSize,
    page: p,
    pageSize,
  };
}
