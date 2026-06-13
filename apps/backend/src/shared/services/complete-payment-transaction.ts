import type { PaymentMethod, Prisma } from '@prisma/client';
import { AuditAction, PaymentStatus } from '@prisma/client';
import { recordMemberPayment } from '@services/accounting';
import { createAllocations } from '@services/allocate-contributions';
import { logAction } from '@services/audit-logs';
import { updatePaymentTransaction } from '@src/shared/services/payments';

export interface CompletePaymentOptions {
  transactionId: string;
  userId: string;
  associationId: string;
  amount: number;
  razorpayPaymentId?: string;
  method?: PaymentMethod | string;
  source?: string;
  description?: string;
  paidAt?: Date;
}

export async function completePaymentInTransaction(
  tx: Prisma.TransactionClient,
  options: CompletePaymentOptions,
) {
  const {
    transactionId,
    userId,
    associationId,
    amount,
    razorpayPaymentId,
    method,
    source,
    description,
    paidAt,
  } = options;
  const now = paidAt ?? new Date();

  const updated = await updatePaymentTransaction({
    db: tx,
    where: { id: transactionId },
    data: {
      status: PaymentStatus.COMPLETED,
      ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
      paidAt: now,
      ...(method ? { method: method as PaymentMethod } : {}),
    },
  });

  let periods: string[] = [];

  if (updated.contributionId) {
    periods = [...periods, updated.contributionId];
  }

  await createAllocations(tx, transactionId, userId, Number(amount), periods);

  await recordMemberPayment(tx, {
    associationId,
    paymentTransactionId: transactionId,
    amount: Number(amount),
    description: description ?? 'Online payment via Razorpay',
    createdById: userId,
    method: method ?? 'ONLINE',
  });

  await logAction(
    {
      associationId,
      actorId: userId,
      action: AuditAction.PAYMENT_COMPLETED,
      resourceType: 'PaymentTransaction',
      resourceId: transactionId,
      newValues: {
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        amount: Number(amount),
        ...(source ? { source } : {}),
      },
    },
    tx,
  );

  return updated;
}
