export interface ContributionPeriod {
  id: string;
  associationId: string;
  userId: string;
  year: number;
  month: number;
  expectedAmount: number;
  paidAmount: number;
  dueAmount: string;
  status: string;
  dueDate: string;
  waivedAt: string | null;
  waivedReason: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    membershipNumber: string | null;
  };
  allocations: {
    id: string;
    allocatedAmount: number;
    paymentTransaction: {
      id: string;
      amount: number;
      method: string | null;
      status: string;
      paidAt: string | null;
      receiptNumber: string | null;
    };
  }[];
}

export interface ContributionSummary {
  userId: string;
  totalExpected: number;
  totalPaid: number;
  totalDue: number;
  overdueMonths: number;
  paidMonths: number;
  partialMonths: number;
  waivedMonths: number;
}

export interface UserContributionData {
  user: {
    id: string;
    name: string;
    email: string;
    membershipNumber: string | null;
  };
  contributions: ContributionPeriod[];
  summary: ContributionSummary;
}

export interface DeclarationMember {
  name: string;
  email: string;
  mobile: string;
}

export const DeclarationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type DeclarationStatus = (typeof DeclarationStatus)[keyof typeof DeclarationStatus];

export interface Declaration {
  id: string;
  memberId: string;
  associationId: string;
  declerationStartDate: string; // ISO date string
  declerationEndDate: string; // ISO date string
  amount: string;
  status: DeclarationStatus;
  lastDeclarationDate: string | null;
  reviewBy: string | null;
  reviewAt: string | null;
  remark: string | null;

  member: DeclarationMember;
}
