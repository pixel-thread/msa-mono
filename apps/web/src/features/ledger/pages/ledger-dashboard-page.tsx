'use client';

import { useLedgerSummary } from '../hooks/useLedgerSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { SectionHeader } from '@src/shared/components/section-header';
import { ArrowUpRight, ArrowDownRight, Scale, Clock } from 'lucide-react';

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function LedgerDashboardPage() {
  const { summaryData, isLoading } = useLedgerSummary();

  if (isLoading || !summaryData) {
    return <div>Loading dashboard...</div>;
  }

  const { summary } = summaryData;

  return (
    <div className="space-y-6">
      <SectionHeader title="Ledger Overview" description="Financial summary and ledger status." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalAssets)}</div>
            <p className="text-xs text-muted-foreground mt-1">Balanced: {summary.isBalanced ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalLiabilities)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle className="text-lg flex items-center"><Clock className="mr-2 h-5 w-5" /> Pending Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.pendingCount}</div>
            <p className="text-sm text-muted-foreground mt-2">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="text-lg flex items-center"><Scale className="mr-2 h-5 w-5" /> Approved Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.approvedCount}</div>
            <p className="text-sm text-muted-foreground mt-2">Fully posted to ledger</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}