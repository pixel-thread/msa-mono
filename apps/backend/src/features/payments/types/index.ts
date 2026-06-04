// ---------------------------------------------------------------------------
// Payment Types — shared domain interfaces used across the payments feature
// ---------------------------------------------------------------------------

import { ContributionSummary } from '@src/features/contributions/types';

export interface ProviderResponse {
  id: string;
  associationId: string;
  provider: string;
  keyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertProviderInput {
  provider: string;
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  isActive?: boolean;
}

export interface UpdateProviderInput {
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
  isActive?: boolean;
}

export interface PaymentAllocation {
  id: string;
  allocatedAmount: number;
  contributionPeriod: {
    year: number;
    month: number;
    expectedAmount: number;
    status: string;
  };
}

export interface PaymentTransaction {
  id: string;
  associationId: string;
  userId: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  method: string | null;
  referenceNumber: string | null;
  receiptNumber: string | null;
  notes: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  razorpayRefundId: string | null;
  paidAt: string | null;
  failedAt: string | null;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  allocations: PaymentAllocation[];
  user?: {
    name: string;
    email: string;
    membershipNumber: string | null;
  };
}

export interface UserPaymentData {
  user: {
    id: string;
    name: string;
    email: string;
    membershipNumber: string | null;
  };
  transactions: PaymentTransaction[];
  summary: ContributionSummary;
}

// ---- Re-export Razorpay checkout types ----
export * from './razorpay-checkout';
