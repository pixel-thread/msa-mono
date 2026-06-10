import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';
import { buildPaginationParams } from '@utils/helper';

type DbClient = Prisma.TransactionClient | typeof prisma;

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type PrismaDelegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: any) => Promise<number>;
};

type FindPaginatedArgs<W, I, O> = {
  where: W;
  include?: I;
  orderBy?: O;
  page?: number;
  pageSize?: number;
};

export async function findPaginated<T, W, I, O>(
  delegate: PrismaDelegate,
  args: FindPaginatedArgs<W, I, O>,
  db: DbClient = prisma,
): Promise<PaginatedResult<T>> {
  const { where, include, orderBy, page = 1 } = args;
  const { skip, take } = buildPaginationParams(page);

  const [items, total] = await Promise.all([
    delegate.findMany({ where, include, orderBy, skip, take }),
    delegate.count({ where }),
  ]);

  return { items, total };
}
