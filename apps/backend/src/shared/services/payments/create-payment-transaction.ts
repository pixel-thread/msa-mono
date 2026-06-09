import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type DbClient = Prisma.TransactionClient | typeof prisma;

type UpdateTransactionProps = {
  data: Prisma.PaymentTransactionCreateInput;
  db?: DbClient;
};

export async function createPaymentTransaction({ data, db = prisma }: UpdateTransactionProps) {
  return db.paymentTransaction.create({
    data,
  });
}
