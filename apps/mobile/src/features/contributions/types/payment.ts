import type { ContributionPeriod } from './contribution-period.types';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export type Allocation = {
  id: string;
  createdAt: Date;
  paymentTransactionId: string;
  contributionPeriodId: string;
  allocatedAmount: number;

  contributionPeriod: ContributionPeriod;
};

export type Transaction = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: PaymentStatus;
  associationId: string;
  amount: number;
  currency: string;
  createdById: string | null;
  paymentDate: Date;

  allocations: Allocation[];
};

export type PaymentSummary = {
  userId: string;
  totalExpected: number;
  totalPaid: number;
  totalDue: number;
  overdueMonths: number;
  paidMonths: number;
  partialMonths: number;
  waivedMonths: number;
};
