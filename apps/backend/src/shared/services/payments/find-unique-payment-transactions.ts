import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

export async function findUniquePaymentTransactions(
  where: Prisma.PaymentTransactionWhereUniqueInput,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return db.paymentTransaction.findUnique({ where });
}
