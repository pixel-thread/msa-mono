import { BadRequestError, NotFoundError, PaymentError } from '@errors';
import { decrypt } from '@lib/crypto';
import { prisma } from '@lib/prisma';
import type { DocumentReferenceType, Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;
import { PaymentMethod } from '@prisma/client';
import { AuditAction, ContributionStatus, PaymentGateway, PaymentStatus } from '@prisma/client';
import { recordMemberPayment } from '@services/accounting';
import { logAction } from '@services/audit-logs';
import { completePaymentInTransaction } from '@services/complete-payment-transaction';
import {
  createPaymentTransaction,
  findUniquePaymentTransactions,
  updatePaymentTransaction,
} from '@services/payments';
import { env } from '@src/env';
import { PAGE_SIZE } from '@src/shared/constants';
import { buildPagination } from '@utils/helper/build-pagination';

import type { RazorpayCheckoutOptions } from '../types';

import { getActiveProvider, getProviderById } from './payment-provider.service';
import { createRazorpayClient, verifyPaymentSignature } from './razorpay.service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TransactionFilters {
  page?: number;
  userId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  gateway?: PaymentGateway;
  search?: string;
  startDate?: string;
  endDate?: string | Date;
}

export interface CreateOrderInput {
  contributionPeriodId?: string;
  associationId: string;
  userId: string;
  /** Amount in INR (rupees, not paise). */
  amount: number;
  notes?: string;
}

export interface VerifyAndCompleteInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RecordManualPaymentInput {
  associationId: string;
  userId?: string | null;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  referenceType?: string;
  reference?: string;
  incomeAccountId: string;
  paidAt?: string;
  /** The user who recorded this payment (finance/admin). */
  createdById: string;
}

// ---------------------------------------------------------------------------
// 1. Create Razorpay Order
// ---------------------------------------------------------------------------

/**
 * Create a pending `PaymentTransaction` and a corresponding Razorpay order.
 *
 * Returns both the transaction ID and the Razorpay order details the frontend
 * needs to open checkout.
 */
export async function createPaymentOrder(input: CreateOrderInput) {
  const amountInPaise = Math.round(input.amount * 100);

  const provider = await getActiveProvider(input.associationId, 'RAZORPAY');

  let keyId: string;
  let keySecret: string;

  if (provider) {
    keyId = provider.keyId;
    try {
      keySecret = decrypt(provider.encryptedKeySecret);
    } catch {
      throw new PaymentError('Failed to decrypt payment provider credentials');
    }
  } else {
    keyId = env.RAZORPAY_KEY_ID ?? '';
    keySecret = env.RAZORPAY_KEY_SECRET ?? '';

    if (!keyId || !keySecret) {
      throw new NotFoundError('No payment provider configured and no env vars set');
    }
  }

  const razorpayClient = createRazorpayClient(keyId, keySecret);

  // Create pending transaction first
  const transaction = await createPaymentTransaction({
    data: {
      association: { connect: { id: input.associationId } },
      user: { connect: { id: input.userId || '' } },
      amount: input.amount,
      currency: 'INR',
      gateway: PaymentGateway.RAZORPAY,
      status: PaymentStatus.PENDING,
      notes: input.notes,
      contributionPeriod: { connect: { id: input.contributionPeriodId } },
    },
  });

  // Create Razorpay order
  let razorpayOrder;

  try {
    razorpayOrder = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: transaction.id,
      notes: {
        transactionId: transaction.id,
        contributionPeriodId: input.contributionPeriodId || '',
        userId: input.userId,
        associationId: input.associationId,
      },
    });
  } catch (error: any) {
    throw new PaymentError(
      error?.error?.description || 'Payment failed',
      error?.error?.code,
      error?.statusCode,
    );
  }

  // Link Razorpay order ID to our transaction
  await updatePaymentTransaction({
    where: { id: transaction.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  const options: RazorpayCheckoutOptions = {
    name: env.NEXT_PUBLIC_ASSOCIATION_SLUG.toUpperCase(),
    transaction_id: transaction.id,
    description: 'Membership payment',
    order_id: razorpayOrder.id,
    amount: amountInPaise,
    currency: 'INR',
    key: keyId,
  };

  return options;
}

// ---------------------------------------------------------------------------
// 1b. Create Test Razorpay Order (Admin)
// ---------------------------------------------------------------------------

export interface CreateTestOrderInput {
  associationId: string;
  userId: string;
  providerId: string;
}

/**
 * Create a test payment order for ₹1 using a specific provider.
 * Skips subscription plan lookup — uses a fixed amount.
 * Returns RazorpayOptions for the frontend checkout.
 */
export async function createTestPaymentOrder(input: CreateTestOrderInput) {
  const provider = await getProviderById(input.providerId, input.associationId);

  if (!provider || provider.provider !== 'RAZORPAY') {
    throw new BadRequestError('Provider must be a Razorpay provider');
  }

  const fullProvider = await prisma.paymentProvider.findUnique({
    where: { id: input.providerId },
  });

  if (!fullProvider) {
    throw new NotFoundError('Provider not found');
  }

  let keySecret: string;
  try {
    keySecret = decrypt(fullProvider.encryptedKeySecret);
  } catch {
    throw new PaymentError('Failed to decrypt payment provider credentials');
  }

  const razorpayClient = createRazorpayClient(provider.keyId, keySecret);

  const testAmount = 1;
  const amountInPaise = 100;

  const transaction = await createPaymentTransaction({
    data: {
      association: { connect: { id: input.associationId } },
      user: { connect: { id: input.userId } },
      amount: testAmount,
      currency: 'INR',
      gateway: PaymentGateway.RAZORPAY,
      status: PaymentStatus.PENDING,
      notes: 'Test payment',
    },
  });

  let razorpayOrder;
  try {
    razorpayOrder = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: transaction.id,
      notes: {
        transactionId: transaction.id,
        userId: input.userId,
        associationId: input.associationId,
        isTest: 'true',
      },
    });
  } catch (error: any) {
    throw new PaymentError(
      error?.error?.description || 'Payment failed',
      error?.error?.code,
      error?.statusCode,
    );
  }

  await updatePaymentTransaction({
    where: { id: transaction.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  const options: RazorpayCheckoutOptions = {
    name: env.NEXT_PUBLIC_ASSOCIATION_SLUG.toUpperCase(),
    transaction_id: transaction.id,
    description: 'Test payment (₹1)',
    order_id: razorpayOrder.id,
    amount: amountInPaise,
    currency: 'INR',
    key: provider.keyId,
  };

  return options;
}

// ---------------------------------------------------------------------------
// 2. Verify & Complete Online Payment (Client-side callback)
// ---------------------------------------------------------------------------

/**
 * Called after the frontend Razorpay checkout succeeds.
 *
 * 1. Verifies the payment signature
 * 2. Marks the transaction as COMPLETED
 * 3. Allocates payment across outstanding contribution periods (FIFO)
 * 4. Creates ledger entries
 * 5. Writes audit logs
 */
export async function verifyAndCompletePayment(input: VerifyAndCompleteInput) {
  const transaction = await findUniquePaymentTransactions({
    razorpayOrderId: input.razorpayOrderId,
  });

  if (!transaction) {
    throw new NotFoundError(`No transaction found for Razorpay order: ${input.razorpayOrderId}`);
  }

  if (transaction.status === PaymentStatus.COMPLETED) {
    return transaction;
  }

  const provider = await getActiveProvider(transaction.associationId, 'RAZORPAY');

  let keySecret: string | undefined;

  if (provider) {
    try {
      keySecret = decrypt(provider.encryptedKeySecret);
    } catch {
      throw new PaymentError('Failed to decrypt payment provider credentials');
    }
  }

  const isValid = verifyPaymentSignature(
    {
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
    },
    keySecret,
  );

  return prisma.$transaction(async (tx) => {
    if (!transaction.userId) {
      throw new NotFoundError('User not found on transaction');
    }

    if (!isValid) {
      return await updatePaymentTransaction({
        where: { id: transaction.id },
        data: {
          status: PaymentStatus.FAILED,
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          paidAt: new Date(),
          method: PaymentMethod.ONLINE as PaymentMethod,
        },
        db: tx,
      });
    }

    return await completePaymentInTransaction(tx, {
      transactionId: transaction.id,
      userId: transaction.userId,
      associationId: transaction.associationId,
      amount: Number(transaction.amount),
      razorpayPaymentId: input.razorpayPaymentId,
      method: 'ONLINE',
      description: 'Online payment via Razorpay',
    });
  });
}

// ---------------------------------------------------------------------------
// 2b. Verify Test Payment (Admin — skips allocation & ledger)
// ---------------------------------------------------------------------------

/**
 * Verify a test Razorpay payment and mark the transaction COMPLETED.
 * Unlike verifyAndCompletePayment, this does NOT allocate to contributions
 * or create ledger entries — it's purely for testing provider connectivity.
 */
export async function verifyTestPayment(input: VerifyAndCompleteInput) {
  const transaction = await findUniquePaymentTransactions({
    razorpayOrderId: input.razorpayOrderId,
  });

  if (!transaction) {
    throw new NotFoundError(`No transaction found for Razorpay order: ${input.razorpayOrderId}`);
  }

  if (transaction.status === PaymentStatus.COMPLETED) {
    return transaction;
  }

  const provider = await getActiveProvider(transaction.associationId, 'RAZORPAY');

  let keySecret: string | undefined;

  if (provider) {
    try {
      keySecret = decrypt(provider.encryptedKeySecret);
    } catch {
      throw new PaymentError('Failed to decrypt payment provider credentials');
    }
  }

  const isValid = verifyPaymentSignature(
    {
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
    },
    keySecret,
  );

  if (!isValid) {
    throw new BadRequestError('Invalid Razorpay payment signature');
  }

  const now = new Date();

  const updatedTransaction = await updatePaymentTransaction({
    where: { id: transaction.id },
    data: {
      status: PaymentStatus.COMPLETED,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
      paidAt: now,
      method: 'ONLINE' as PaymentMethod,
      notes: transaction.notes ? `${transaction.notes} (completed)` : 'Test payment (completed)',
    },
  });

  // Minimal audit log
  await logAction({
    associationId: transaction.associationId,
    actorId: transaction.userId || '',
    action: AuditAction.PAYMENT_COMPLETED,
    resourceType: 'PaymentTransaction',
    resourceId: transaction.id,
    newValues: {
      razorpayPaymentId: input.razorpayPaymentId,
      amount: Number(transaction.amount),
      isTest: true,
    },
  });

  return updatedTransaction;
}

// ---------------------------------------------------------------------------
// 3. Record Manual Payment (cash/UPI/bank transfer by finance officer)
// ---------------------------------------------------------------------------

/**
 * Record a manual (offline) payment and allocate it immediately.
 */
export async function recordManualPayment(input: RecordManualPaymentInput) {
  return prisma.$transaction(async (tx) => {
    // Create completed transaction
    const transaction = await createPaymentTransaction({
      data: {
        association: { connect: { id: input.associationId } },
        amount: input.amount,
        currency: 'INR',
        gateway: PaymentGateway.MANUAL,
        status: PaymentStatus.COMPLETED,
        method: input.method,
        notes: input.notes,
        createdById: input.createdById,
        verifiedById: input.createdById,
        paidAt: input.paidAt,
        paymentDate: input.paidAt,
      },
      db: tx,
    });

    await tx.documentReference.create({
      data: {
        paymentTransaction: { connect: { id: transaction.id } },
        reference: input.reference,
        paidAt: input.paidAt,
        type: input.referenceType as DocumentReferenceType,
        remarks: input.notes ?? 'N/A',
      },
    });

    // Look up income account code
    const incomeAccount = await tx.account.findUnique({
      where: { id: input.incomeAccountId },
    });

    if (!incomeAccount) {
      throw new NotFoundError(`Income account not found: ${input.incomeAccountId}`);
    }

    // Create ledger entry
    await recordMemberPayment(tx, {
      associationId: input.associationId,
      paymentTransactionId: transaction.id,
      amount: input.amount,
      description: input.notes || 'Manual payment',
      createdById: input.createdById,
      method: input.method,
      incomeAccountCode: incomeAccount.code,
    });

    // Audit log
    await logAction({
      associationId: input.associationId,
      actorId: input.createdById,
      action: AuditAction.PAYMENT_CREATED,
      resourceType: 'PaymentTransaction',
      resourceId: transaction.id,
      newValues: {
        amount: input.amount,
        method: input.method,
        userId: input.userId,
      },
    });

    return transaction;
  });
}

// ---------------------------------------------------------------------------
// 5. Mark Payment as Failed
// ---------------------------------------------------------------------------

export async function markPaymentFailed(
  razorpayOrderId: string,
  reason?: string,
  db: DbClient = prisma,
) {
  const transaction = await db.paymentTransaction.findUnique({
    where: { razorpayOrderId },
  });

  if (!transaction) return null;

  const updated = await updatePaymentTransaction({
    where: { id: transaction.id },
    data: {
      status: PaymentStatus.FAILED,
      failedAt: new Date(),
      notes: reason ? `${transaction.notes ?? ''}\nFailure: ${reason}`.trim() : transaction.notes,
    },
  });

  // Audit log
  await logAction({
    associationId: transaction.associationId,
    actorId: transaction.userId || '',
    action: AuditAction.PAYMENT_FAILED,
    resourceType: 'PaymentTransaction',
    resourceId: transaction.id,
    newValues: { reason },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// 6. Get Payment History
// ---------------------------------------------------------------------------

export async function getUserPaymentHistory(userId: string, page = 1, db: DbClient = prisma) {
  const validPage = Math.max(1, page);
  const skip = (validPage - 1) * PAGE_SIZE;

  const [transactions, total] = await Promise.all([
    db.paymentTransaction.findMany({
      where: { userId },
      include: {
        allocations: {
          include: {
            contributionPeriod: {
              select: {
                year: true,
                month: true,
                expectedAmount: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    db.paymentTransaction.count({ where: { userId } }),
  ]);

  return {
    transactions,
    pagination: buildPagination(total, page),
  };
}

// ---------------------------------------------------------------------------
// 7. Admin Transaction Management
// ---------------------------------------------------------------------------

/**
 * List all transactions with advanced filtering for admin dashboard.
 */
export async function getAllTransactions(
  associationId: string,
  filters: TransactionFilters,
  db: DbClient = prisma,
) {
  const { page = 1, userId, status, method, gateway, search, startDate, endDate } = filters;

  const validPage = Math.max(1, page);
  const skip = (validPage - 1) * PAGE_SIZE;

  const where: Prisma.PaymentTransactionWhereInput = { associationId };

  if (userId) where.userId = userId;
  if (status) where.status = status;
  if (method) where.method = method;
  if (gateway) where.gateway = gateway;

  if (startDate || endDate) {
    const createdAt: Prisma.DateTimeFilter = {};

    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        createdAt.gte = start;
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        createdAt.lte = end;
      }
    }

    if (Object.keys(createdAt).length > 0) {
      where.createdAt = createdAt;
    }
  }

  if (search) {
    where.OR = [
      // { reference: { contains: search, mode: 'insensitive' } },
      // { receiptNumber: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { membershipNumber: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [transactions, total] = await Promise.all([
    db.paymentTransaction.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, membershipNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    db.paymentTransaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: buildPagination(total, validPage, PAGE_SIZE),
  };
}

/**
 * Fetch a specific transaction with its full context (user, allocations, ledger).
 */
export async function getTransactionById(id: string, associationId: string, db: DbClient = prisma) {
  return db.paymentTransaction.findFirst({
    where: { id, associationId },
    include: {
      user: { select: { name: true, email: true, membershipNumber: true } },
      allocations: { include: { contributionPeriod: true } },
      ledgerEntries: { include: { lines: true } },
      references: true,
    },
  });
}

// ---------------------------------------------------------------------------
// 8. Financial Statistics
// ---------------------------------------------------------------------------

/**
 * Get top-level financial summary for an association dashboard.
 */
export async function getFinancialStats(associationId: string, db: DbClient = prisma) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthTotal, duesSum, uniqueUsersWithDues] = await Promise.all([
    db.paymentTransaction.aggregate({
      where: {
        associationId,
        status: PaymentStatus.COMPLETED,
        paidAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    db.contributionPeriod.aggregate({
      where: {
        associationId,
        status: {
          in: [ContributionStatus.DUE, ContributionStatus.PARTIAL, ContributionStatus.OVERDUE],
        },
      },
      _sum: { dueAmount: true },
    }),
    db.contributionPeriod.groupBy({
      by: ['userId'],
      where: {
        associationId,
        status: {
          in: [ContributionStatus.DUE, ContributionStatus.PARTIAL, ContributionStatus.OVERDUE],
        },
      },
    }),
  ]);

  return {
    stats: {
      totalCollectedMonth: Number(monthTotal._sum.amount || 0),
      pendingDuesAmount: Number(duesSum._sum.dueAmount || 0),
      pendingDuesCount: uniqueUsersWithDues.length,
    },
    pagination: buildPagination(uniqueUsersWithDues.length, 1),
  };
}
