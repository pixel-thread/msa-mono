'use client';

import { useUrlFilters } from '@hooks/use-url-filters';
import { useUserContributionColumns } from '@src/features/contributions/hooks/useUserContributionColumns';
import { useUserContributions } from '@src/features/contributions/hooks/useUserContributions';
import { DataTable } from '@src/shared/components/data-table';
import { DataTableFilters } from '@src/shared/components/data-table-filters';
import { DataTablePagination } from '@src/shared/components/data-table-pagination';
import { SectionHeader } from '@src/shared/components/section-header';
import { Button } from '@src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { formattedAmount } from '@src/shared/utils';
import { useParams } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { AlertCircle, CalendarDays, CreditCard, Receipt } from 'lucide-react';

export function UserContributionsPage() {
  const params = useParams({ strict: false });
  const userId = params.userId as string;

  const { setPage } = useUrlFilters({
    basePath: `/payments/users/${userId}/contributions`,
    pageKey: 'page',
  });

  const { user, contributions, summary, isLoading, meta } = useUserContributions({
    userId,
  });

  const currentYear = new Date().getFullYear();

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const { columns } = useUserContributionColumns();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-body">Loading user contributions...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg text-body">User not found</p>
        <Button
          variant="outline"
          className="mt-4 h-11 border-hairline bg-canvas px-5 text-sm font-medium text-ink hover:bg-surface-strong"
          onClick={() => window.history.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title={`${user.name} - Contributions`}
        description={
          <>
            Monthly contribution breakdown
            {user.email && <span className="ml-2 text-muted-foreground">({user.email})</span>}
          </>
        }
      />

      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className=" border-hairline bg-surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Expected</p>
                  <p className="text-lg font-medium text-ink mt-1">
                    {formattedAmount(summary.totalExpected)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=" border-hairline bg-surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-medium text-green-600 mt-1">
                    {formattedAmount(summary.totalPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=" border-hairline bg-surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Due</p>
                  <p className="text-lg font-medium text-red-600 mt-1">
                    {formattedAmount(summary.totalDue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=" border-hairline bg-surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Overdue</p>
                  <p className="text-lg font-medium text-ink mt-1">
                    {summary.overdueMonths} months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className=" border border-hairline bg-surface-card p-4">
        <DataTableFilters
          fields={[
            {
              type: 'select',
              id: 'fromYear',
              label: 'Year',
              options: Array.from({ length: 6 }, (_, i) => ({
                value: String(currentYear - 5 + i),
                label: String(currentYear - 5 + i),
              })),
            },
            {
              type: 'select',
              id: 'fromMonth',
              label: 'Month',
              options: months.map((m) => ({
                value: m.value,
                label: m.label,
              })),
            },
          ]}
          onFilterChange={() => {}}
        />
      </div>

      <Card className=" border-hairline bg-surface-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Contribution Periods ({contributions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={contributions} loading={false} />
          <DataTablePagination onPageChange={setPage} meta={meta} />
        </CardContent>
      </Card>

      <div className="mt-4">
        <Link to={`/payments/users/${userId}`} className="text-sm text-primary hover:underline">
          ← Back to Payment History
        </Link>
      </div>
    </>
  );
}
