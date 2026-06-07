import { PAGE_SIZE } from '@src/shared/constants';
import { PaginationMeta } from '@src/shared/types';

export const buildPagination = (total: number, page: number, pageSize?: number): PaginationMeta => {
  const size = pageSize || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / size));

  return {
    page,
    pageSize: size,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
};
