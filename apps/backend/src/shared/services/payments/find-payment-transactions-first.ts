import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

export async function findPaymentTransactionsFirst(
  where: Prisma.PaymentTransactionWhereUniqueInput,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return db.paymentTransaction.findFirst({ where });
}
