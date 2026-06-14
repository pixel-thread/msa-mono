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
  revenueOverTime: {
    month: string;
    revenue: number;
    pending: number;
    refunded: number;
  }[];
  memberGrowth: {
    month: string;
    newMembers: number;
    totalMembers: number;
  }[];
  memberRoleDistribution: {
    role: string;
    count: number;
  }[];
  paymentMethodDistribution: {
    method: string;
    count: number;
    total: number;
  }[];
  recentPayments: {
    id: string;
    userName: string;
    amount: number;
    status: string;
    method: string | null;
    paymentDate: string;
  }[];
};
