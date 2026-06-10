import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';
import { findPaginated } from '@services/find-paginated';

type Props = {
  where: Prisma.PaymentTransactionWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.PaymentTransactionInclude;
};

export async function findPaginatedPaymentTransactions({ where, page = 1, include }: Props) {
  const { items, total } = await findPaginated(
    prisma.paymentTransaction,
    { where, include, orderBy: { paymentDate: 'desc' }, page },
  );
  return { transactions: items, total };
}
