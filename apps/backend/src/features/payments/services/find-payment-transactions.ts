import { Prisma } from '@prisma/client';
import { prisma } from '@lib/prisma';
import { buildPaginationParams } from '@src/shared/utils/helper/build-pagination-params';

type Props = {
  where: Prisma.PaymentTransactionWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.PaymentTransactionInclude;
};

export async function findPaymentTransactions({ where, page = 1, pageSize = 20, include }: Props) {
  const { skip, take } = buildPaginationParams(page, pageSize);
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
