export type Overview = {
  stats: {
    totalMembers: number;
    activeMembers: number;
    newMembersThisMonth: number;

    totalRevenueMonth: number;
    totalRevenueYear: number;

    pendingDuesAmount: number;
    pendingDuesCount: number;
  };

  revenueOverTime: RevenueOverTimeItem[];

  memberGrowth: MemberGrowthItem[];

  memberRoleDistribution: MemberRoleDistributionItem[];

  paymentMethodDistribution: PaymentMethodDistributionItem[];

  recentPayments: RecentPaymentItem[];
};

export type RevenueOverTimeItem = {
  month: string;
  revenue: number;
  pending: number;
  refunded: number;
};

export type MemberGrowthItem = {
  month: string;
  newMembers: number;
  totalMembers: number;
};

export type MemberRoleDistributionItem = {
  role: 'PRESIDENT' | 'SECRETARY' | 'FINANCE' | 'DPO' | 'MEMBER' | 'SUPER_ADMIN';

  count: number;
};

export type PaymentMethodDistributionItem = {
  method: 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE';

  count: number;
  total: number;
};

export type RecentPaymentItem = {
  id: string;

  userName: string;

  amount: number;

  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

  method: 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE';

  paymentDate: string;
};
