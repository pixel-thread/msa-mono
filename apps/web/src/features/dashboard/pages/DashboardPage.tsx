// @ts-nocheck
'use client';

import { useDashboard } from '@hooks/useDashboard';
import { SectionHeader } from '@components/section-header';
import { StatsCards } from '@components/dashboard/stats-cards';
import { RevenueAreaChart } from '@components/dashboard/revenue-area-chart';
import { MemberBarChart } from '@components/dashboard/member-bar-chart';
import { RevenueLineChart } from '@components/dashboard/revenue-line-chart';
import { PaymentPieChart } from '@components/dashboard/payment-pie-chart';
import { RolesRadarChart } from '@components/dashboard/roles-radar-chart';
import { RecentPaymentsTable } from '@components/dashboard/recent-payments-table';
import { DashboardSkeleton } from '@components/dashboard/dashboard-skeleton';

/**
 * Main dashboard page component.
 * Fetches and displays association analytics and overview stats.
 */
export function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Dashboard" description="Association analytics and overview" />
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-ink">Failed to load dashboard</h2>
          <p className="mt-2 text-sm text-body">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-active"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" description="Association analytics and overview" />
      <StatsCards stats={data.stats} />
      <RevenueAreaChart data={data.revenueOverTime} />
      <div className="grid gap-4 md:grid-cols-2">
        <MemberBarChart data={data.memberGrowth} />
        <RevenueLineChart revenueData={data.revenueOverTime} memberData={data.memberGrowth} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <PaymentPieChart data={data.paymentMethodDistribution} />
        <RolesRadarChart data={data.memberRoleDistribution} />
      </div>
      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">Recent Payments</h2>
        <RecentPaymentsTable payments={data.recentPayments} />
      </div>
    </div>
  );
}
