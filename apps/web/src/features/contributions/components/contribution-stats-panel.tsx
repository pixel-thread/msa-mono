'use client';

import { useState } from 'react';
import { Card, CardContent } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@components/ui/collapsible';
import { formattedAmount } from '@src/shared/utils';
import { getMonthName } from '@src/shared/utils/helper/get-month-name';
import { ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { ContributionStatusBadge } from './contribution-status-badge';
import type { ContributionPeriod, ContributionSummary } from '../types';

interface ContributionStatsPanelProps {
  summary: ContributionSummary | null;
  contributions: ContributionPeriod[];
}

export function ContributionStatsPanel({ summary, contributions }: ContributionStatsPanelProps) {
  const [open, setOpen] = useState(false);

  if (!summary) return null;

  const paidMonths = summary.paidMonths;
  const partialMonths = summary.partialMonths;
  const overdueMonths = summary.overdueMonths;
  const waivedMonths = summary.waivedMonths;
  const resolvedMonths = paidMonths + partialMonths + overdueMonths + waivedMonths;
  const complianceRate = resolvedMonths > 0 ? Math.round((paidMonths / resolvedMonths) * 100) : 0;

  const recentPeriods = [...contributions]
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .slice(0, 6);

  return (
    <Card className="border-hairline bg-surface-card">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Contribution Statistics
            </span>
          </div>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded border border-hairline bg-canvas p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Expected
                </p>
                <p className="text-xl font-bold text-ink mt-0.5">
                  {formattedAmount(summary.totalExpected)}
                </p>
              </div>
              <div className="rounded border border-hairline bg-canvas p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Paid
                </p>
                <p className="text-xl font-bold text-green-600 mt-0.5">
                  {formattedAmount(summary.totalPaid)}
                </p>
              </div>
              <div className="rounded border border-hairline bg-canvas p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Due
                </p>
                <p className="text-xl font-bold text-red-600 mt-0.5">
                  {formattedAmount(summary.totalDue)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Status Breakdown
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-green-600 bg-green-50 border-green-200"
                >
                  Paid {paidMonths}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-blue-600 bg-blue-50 border-blue-200"
                >
                  Partial {partialMonths}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-yellow-600 bg-yellow-50 border-yellow-200"
                >
                  Due {contributions.filter((c) => c.status === 'DUE').length}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-red-600 bg-red-50 border-red-200"
                >
                  Overdue {overdueMonths}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded px-2 py-1 text-gray-500 bg-gray-50 border-gray-200"
                >
                  Waived {waivedMonths}
                </Badge>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Payment Compliance
                </p>
                <span className="text-xs font-semibold">{complianceRate}%</span>
              </div>
              <Progress value={complianceRate} className="h-2" />
            </div>

            {recentPeriods.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Recent Periods
                </p>
                <div className="space-y-1">
                  {recentPeriods.map((period) => (
                    <div
                      key={period.id}
                      className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50"
                    >
                      <span className="text-sm text-ink">
                        {getMonthName(period.month)} {period.year}
                      </span>
                      <ContributionStatusBadge status={period.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
