import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function findPaymentTransactionsFirst(
  where: Prisma.PaymentTransactionWhereInput,
  db: DbClient = prisma,
) {
  return db.paymentTransaction.findFirst({ where });
}
