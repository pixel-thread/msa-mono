import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function findUniquePaymentTransactions(
  where: Prisma.PaymentTransactionWhereUniqueInput,
  db: DbClient = prisma,
) {
  return db.paymentTransaction.findUnique({ where });
}
