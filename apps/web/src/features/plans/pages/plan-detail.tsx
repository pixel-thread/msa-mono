'use client';

import { usePlans } from '@src/features/plans/hooks/usePlans';
import { DataTable } from '@src/shared/components/data-table';
import { SectionHeader } from '@src/shared/components/section-header';
import { Badge } from '@src/shared/components/ui/badge';
import { Button } from '@src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Separator } from '@src/shared/components/ui/separator';
import { BILLING_CYCLE } from '@src/shared/types';
import { formatDate, formattedAmount } from '@src/shared/utils';

import { usePlanVersionColumns } from '../hooks/usePlanVersionColumns';
import { planRouteApi } from '../lib/route';

export function PlanDetailPage() {
  const params = planRouteApi.useParams();
  const { columns } = usePlanVersionColumns();
  const planId = params.planId as string;

  const { plans, isLoading } = usePlans();
  const plan = plans.find((p) => p.id === planId);

  const amount = plan?.activeVersion?.amount ?? 0;
  const currency = plan?.activeVersion?.currency ?? 'INR';
  const billingCycle = plan?.activeVersion?.billingCycle ?? BILLING_CYCLE.MONTHLY;
  const features = plan?.activeVersion?.features as Record<string, unknown> | undefined;
  const effectiveFrom = plan?.activeVersion?.effectiveFrom ?? plan?.createdAt;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-body">Loading plan details...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg text-body">Plan not found</p>
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
      <SectionHeader title={plan.name} description="Plan details">
        <Badge variant={plan.isActive ? 'default' : 'secondary'}>
          {plan.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </SectionHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className=" border-hairline bg-surface-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Plan Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.description && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                    <p className="text-sm text-ink mt-1">{plan.description}</p>
                  </div>
                  <Separator className="bg-hairline" />
                </>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-medium text-ink mt-1">{formattedAmount(amount)}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Billing Cycle</p>
                  <p className="text-sm text-ink mt-1 capitalize">{billingCycle.toLowerCase()}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Currency</p>
                  <p className="text-sm text-ink mt-1">{currency}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Effective From</p>
                  <p className="text-sm text-ink mt-1">{formatDate(effectiveFrom)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className=" border-hairline bg-surface-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              {features && Object.keys(features).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(features).map(([key, value]) => (
                    <li key={key} className="text-sm text-ink">
                      <span className="font-medium">{key}:</span> {String(value)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No features defined</p>
              )}
            </CardContent>
          </Card>

          <Card className=" border-hairline bg-surface-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Created</p>
                  <p className="text-sm text-ink mt-1">{formatDate(plan.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm text-ink mt-1">{formatDate(plan.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-4">Version History</h2>
        <DataTable data={plan.versions ?? []} columns={columns} />
      </div>
    </>
  );
}
