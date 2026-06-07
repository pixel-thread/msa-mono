import { PAGE_SIZE } from '@src/shared/constants';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function buildPaginationParams(page: number = 1, pageSize: number = PAGE_SIZE): PaginationParams {
  const p = Math.max(1, page);
  return {
    skip: (p - 1) * pageSize,
    take: pageSize,
    page: p,
    pageSize,
  };
}
