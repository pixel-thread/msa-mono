import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

export async function findPaymentTransactions(
  where: Prisma.PaymentTransactionWhereUniqueInput,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return db.paymentTransaction.findMany({ where });
}
