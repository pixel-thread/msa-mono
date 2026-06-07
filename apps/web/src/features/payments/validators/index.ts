import { PaymentMethod } from '@sharedType/enums';
import { pageNumberValidation, pageSizeValidation } from '@src/shared/validators/common';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Create Order (Razorpay)
// ---------------------------------------------------------------------------

export const CreateOrderSchema = z.object({
  notes: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Verify Payment (Client callback from Razorpay Checkout)
// ---------------------------------------------------------------------------

export const VerifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

// ---------------------------------------------------------------------------
// Record Manual Payment (cash/UPI/bank transfer)
// ---------------------------------------------------------------------------

export const RecordManualPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(PaymentMethod).default(PaymentMethod.CASH),
  notes: z.string(),
  receiptNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Query Schemas
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Payment Provider CRUD
// ---------------------------------------------------------------------------

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
