// ---------------------------------------------------------------------------
// Shared imports
// ---------------------------------------------------------------------------
import { ContributionStatus, DocumentReferenceType, PaymentMethod } from '@prisma/client';
import { pageNumberValidation, pageSizeValidation } from '@validator/common';
import { z } from 'zod';

// ---- Create Order (Razorpay) ----

export const CreateOrderSchema = z.object({
  notes: z.string().optional(),
});

// ---- Verify Payment (Client callback from Razorpay Checkout) ----

export const VerifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

// ---- Record Manual Payment (cash/UPI/bank transfer) ----

export const RecordManualPaymentSchema = z
  .object({
    notes: z.string("Notes/Remark can't be empty").min(10, 'Remark should be atleast 10 character'),
    amount: z
      .number()
      .positive('Amount must be positive')
      .min(1, 'Amount is required')
      .max(99999999, 'Amount must be less than 99999999'),
    method: z.enum(PaymentMethod, 'Invalid payment method').default(PaymentMethod.CASH),
    receiptNumber: z.string("Receipt number can't be empty").optional(),
    incomeAccountId: z.uuid('Invalid income account ID'),
    paidAt: z.coerce.date('Invalid Payment date'),
    reference: z.string("Instrument can't be empty").optional(),
    referenceType: z
      .enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'PAYSLIP', 'ONLINE_PAYMENT', 'TEXT', 'FILE'])
      .optional(),
  })
  .strict();

// ---- Query Schemas ----

export const PaymentHistoryQuerySchema = z.object({
  page: pageNumberValidation,
  pageSize: pageSizeValidation,
});

export const GetTransactionsQuerySchema = z.object({
  userId: z.uuid().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'WAIVED']).optional(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'ONLINE']).optional(),
  gateway: z.enum(['RAZORPAY', 'MANUAL']).optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: pageNumberValidation,
  pageSize: pageSizeValidation,
});

export const CollectionReportQuerySchema = z.object({
  page: pageNumberValidation,
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  status: z.enum(ContributionStatus).optional(),
});

// ---- Payment Provider CRUD ----

export const UpsertPaymentProviderSchema = z.object({
  provider: z.enum(['RAZORPAY', 'STRIPE', 'PAYU', 'CASHFREE']),
  keyId: z.string().min(1, 'keyId is required'),
  keySecret: z.string().min(1, 'keySecret is required'),
  webhookSecret: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const UpdatePaymentProviderSchema = z.object({
  keyId: z.string().min(1).optional(),
  keySecret: z.string().min(1).optional(),
  webhookSecret: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const ProviderIdParamSchema = z.object({
  providerId: z.uuid('Invalid provider ID'),
});

export const UserPaymentsParamsSchema = z.object({
  userId: z.uuid('Invalid user ID'),
});

export const PaymentIdParamSchema = z.object({ paymentId: z.uuid() });

export const UserPaymentsQuerySchema = z.object({
  page: pageNumberValidation,
});

// ---- Transfer Balance Between Ledger Accounts ----

export const TransferBalanceSchema = z
  .object({
    fromAccountId: z.uuid('Invalid source account ID'),
    toAccountId: z.uuid('Invalid destination account ID'),
    amount: z
      .number()
      .positive('Amount must be positive')
      .max(99999999, 'Amount must be less than 99999999'),
    remark: z
      .string()
      .min(5, 'Description must be at least 5 characters')
      .max(500, 'Description must be at most 500 characters'),
    reference: z.string("Instrument can't be empty"),
    paidAt: z.coerce.date('Invalid Payment date'),
    referenceType: z.enum(DocumentReferenceType),
  })
  .strict()
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: 'from and to accounts must be different',
    path: ['destinationAccountId'],
  });

export type TransferBalanceInput = z.infer<typeof TransferBalanceSchema>;
