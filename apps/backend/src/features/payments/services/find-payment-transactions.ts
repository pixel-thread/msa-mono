import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';
import { buildPaginationParams } from '@utils/helper';

type Props = {
  where: Prisma.PaymentTransactionWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.PaymentTransactionInclude;
};

export async function findPaymentTransactions({ where, page = 1, include }: Props) {
  const { skip, take } = buildPaginationParams(page);
  const [transactions, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      include,
      orderBy: { paymentDate: 'desc' },
      take,
      skip,
    }),
    prisma.paymentTransaction.count({ where }),
  ]);
  return { transactions, total };
}
