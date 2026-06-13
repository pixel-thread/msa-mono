export type ContributionStatus = 'DUE' | 'PAID' | 'PARTIAL' | 'WAIVED';

export type PaymentTransactionStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface ContributionPeriodPaymentTransaction {
  id: string;
  amount: number;
  method: string | null;
  status: PaymentTransactionStatus;
  paidAt: string | null;
}

export interface ContributionPeriodAllocation {
  id: string;
  allocatedAmount: number;
  paymentTransaction: ContributionPeriodPaymentTransaction;
}

export interface ContributionPeriod {
  id: string;
  associationId: string;
  userId: string;
  year: number;
  month: number;
  expectedAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: ContributionStatus;
  dueDate: string;
  waiver: {
    id: string;
    waivedAt: string;
    reason: string | null;
    waivedBy: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  allocations: ContributionPeriodAllocation[];
}
