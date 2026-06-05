'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { formattedAmount } from '@src/shared/utils';
import { getMonthName } from '@src/shared/utils/helper/get-month-name';
import { Loader2 } from 'lucide-react';
import { ContributionStatusBadge } from './contribution-status-badge';
import type { ContributionPeriod, ContributionSummary } from '../types';
import {
  AlertDialogContent,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@src/shared/components/ui/alert-dialog';

interface PaymentSummaryBarProps {
  selectedPeriods: ContributionPeriod[];
  selectedTotal: number;
  summary: ContributionSummary | null;
  isAdding: boolean;
  onSubmit: () => void;
}

type ConfirmSavingContributionsProps = {
  loading: boolean;
  disable: boolean;
  onClick: () => void;
  periods: ContributionPeriod[];
};

const ConfirmSavingContributions = ({
  onClick,
  loading,
  disable,
  periods,
}: ConfirmSavingContributionsProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={disable || loading}>Save Contribution</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure u want to continue</AlertDialogTitle>
          <AlertDialogDescription>
            Please confirm you want to save contributions for the selected periods
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 p-5 bg-muted">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Periods</p>
            </div>
            <div>
              <p className="font-semibold">Amount</p>
            </div>
          </div>

          {periods.map((period) => (
            <div key={period.id} className="flex justify-between">
              <div>
                <p>
                  {getMonthName(period.month)} {period.year}
                </p>
              </div>
              <div>
                <p>{formattedAmount(parseInt(period.dueAmount))}</p>
              </div>
            </div>
          ))}
          <div className="h-0.5 bg-hairline" />
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Total</p>
            </div>
            <div>
              <p className="font-semibold">
                {formattedAmount(
                  periods.reduce((acc, period) => acc + parseInt(period.dueAmount), 0),
                )}
              </p>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export function PaymentSummaryBar({
  selectedPeriods,
  selectedTotal,
  summary,
  isAdding,
  onSubmit,
}: PaymentSummaryBarProps) {
  if (selectedPeriods.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="pt-6">
        <div className="grid gap-6 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Selected Periods</p>
            <p className="text-3xl font-bold tracking-tight">{selectedPeriods.length}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Due (All)</p>
            <p className="text-3xl font-bold tracking-tight text-destructive">
              {formattedAmount(summary?.totalDue ?? 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Selected Total</p>
            <p className="text-3xl font-bold tracking-tight text-destructive">
              {formattedAmount(selectedTotal ?? 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Paying Today</p>
            <p className="text-3xl font-bold tracking-tight text-green-600">
              {formattedAmount(selectedTotal)}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-hairline pt-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Selected Periods Breakdown
          </p>
          <div className="space-y-1">
            {selectedPeriods.map((period) => (
              <div
                key={period.id}
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink">
                    {getMonthName(period.month)} {period.year}
                  </span>
                  <ContributionStatusBadge status={period.status} />
                </div>
                <span className="text-sm font-medium text-red-600">
                  {formattedAmount(parseInt(period.dueAmount, 10))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <ConfirmSavingContributions
            periods={selectedPeriods}
            loading={isAdding}
            disable={isAdding || selectedTotal === 0}
            onClick={onSubmit}
          />
        </div>
      </CardContent>
    </Card>
  );
}
