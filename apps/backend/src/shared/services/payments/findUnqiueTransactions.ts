import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type Props = {
  where: Prisma.PaymentTransactionWhereUniqueInput;
  tx?: Prisma.TransactionClient;
};

export async function findUniqueTransactions({ where, tx }: Props) {
  const client = tx ? tx : prisma;
  return await client.paymentTransaction.findUnique({ where });
}
