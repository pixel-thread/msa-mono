import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type DbClient = Prisma.TransactionClient | typeof prisma;

type UpdateTransactionProps = {
  where: Prisma.PaymentTransactionWhereUniqueInput;
  data: Prisma.PaymentTransactionUpdateInput;
  db?: DbClient;
};

export async function updatePaymentTransaction({
  where,
  data,
  db = prisma,
}: UpdateTransactionProps) {
  return db.paymentTransaction.update({
    where,
    data,
  });
}
