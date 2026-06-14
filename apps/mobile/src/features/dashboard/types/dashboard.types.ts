export type DashboardOverview = {
  stats: {
    totalMembers: number;
    activeMembers: number;
    newMembersThisMonth: number;
    totalRevenueMonth: number;
    totalRevenueYear: number;
    pendingDuesAmount: number;
    pendingDuesCount: number;
  };
  revenueOverTime: Array<{
    month: string;
    revenue: number;
    pending: number;
    refunded: number;
  }>;
  memberGrowth: Array<{
    month: string;
    newMembers: number;
    totalMembers: number;
  }>;
  memberRoleDistribution: Array<{
    role: string;
    count: number;
  }>;
  paymentMethodDistribution: Array<{
    method: string;
    count: number;
    total: number;
  }>;
  recentPayments: Array<{
    id: string;
    userName: string;
    amount: number;
    status: string;
    method: string | null;
    paymentDate: string;
  }>;
};
