'use client';

import { useState } from 'react';
import { Card, CardContent } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@components/ui/collapsible';
import { formattedAmount } from '@src/shared/utils';
import { ChevronDown, ChevronRight, User, Mail, Fingerprint } from 'lucide-react';
import type { ContributionSummary } from '../types';

interface MemberProfileCardProps {
  name: string;
  email: string;
  membershipNumber: string | null;
  userId: string;
  summary: ContributionSummary | null;
  totalPeriods: number;
}

export function MemberProfileCard({
  name,
  email,
  membershipNumber,
  userId,
  summary,
  totalPeriods,
}: MemberProfileCardProps) {
  const [open, setOpen] = useState(false);

  const paidMonths = summary?.paidMonths ?? 0;
  const partialMonths = summary?.partialMonths ?? 0;
  const overdueMonths = summary?.overdueMonths ?? 0;
  const waivedMonths = summary?.waivedMonths ?? 0;
  const resolvedMonths = paidMonths + partialMonths + overdueMonths + waivedMonths;
  const complianceRate = resolvedMonths > 0 ? Math.round((paidMonths / resolvedMonths) * 100) : 0;

  return (
    <Card className="border-hairline bg-surface-card">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Member Profile
            </span>
          </div>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-ink">{name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {email}
                  </div>
                  {membershipNumber && (
                    <Badge variant="secondary" className="text-[10px]">
                      <Fingerprint className="h-3 w-3 mr-0.5" />
                      #{membershipNumber}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ID: {userId.slice(0, 8)}...
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded border border-hairline bg-canvas p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Periods</p>
                  <p className="text-xl font-bold text-ink mt-0.5">{totalPeriods}</p>
                </div>
                <div className="rounded border border-hairline bg-canvas p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Paid</p>
                  <p className="text-xl font-bold text-green-600 mt-0.5">
                    {formattedAmount(summary?.totalPaid ?? 0)}
                  </p>
                </div>
                <div className="rounded border border-hairline bg-canvas p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Compliance</p>
                  <p className="text-xl font-bold text-ink mt-0.5">{complianceRate}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
