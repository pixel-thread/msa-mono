'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@src/shared/components/ui/alert-dialog';
import { Calendar } from '@src/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@src/shared/components/ui/popover';
import { cn } from '@src/shared/lib/utils';
import { formattedAmount } from '@src/shared/utils';
import { formatDate } from '@src/shared/utils/format';
import { getMonthName } from '@src/shared/utils/helper/get-month-name';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { ContributionPeriod, ContributionSummary } from '../types';

import { ContributionStatusBadge } from './contribution-status-badge';

interface PaymentSummaryBarProps {
  selectedPeriods: ContributionPeriod[];
  selectedTotal: number;
  summary: ContributionSummary | null;
  paidAt: Date | undefined;
  onPaidAtChange: (date: Date | undefined) => void;
  userId: string;
  onRecordingSuccess: () => void;
}

type ConfirmSavingContributionsProps = {
  periods: ContributionPeriod[];
  paidAt: Date | undefined;
  userId: string;
  selectedTotal: number;
  onSuccess: () => void;
};

type ContributionValue = {
  userId: string;
  contributionPeriodIds: string[];
  amount: string;
  paidAt: string;
};
const ConfirmSavingContributions = ({
  periods,
  paidAt,
  userId,
  selectedTotal,
  onSuccess,
}: ConfirmSavingContributionsProps) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ContributionValue) =>
      http.post(ENDPOINTS.CONTRIBUTION.RECORD_CONTRIBUTION, data),
  });

  const handleConfirm = () => {
    mutate(
      {
        userId,
        contributionPeriodIds: periods.map((p) => p.id),
        amount: selectedTotal.toString(),
        paidAt: paidAt?.toISOString() || new Date().toISOString(),
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL() });
            onSuccess();
            return;
          }
          toast.error(data.message || 'Failed to add contributions');
        },
      },
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={isPending || selectedTotal === 0}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Contribution
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="min-w-[600px]">
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
          <div className="flex justify-between">
            <p className="font-semibold">Cash Received Date</p>
            <p>{paidAt ? formatDate(paidAt.toISOString()) : '-'}</p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export function PaymentSummaryBar({
  selectedPeriods,
  selectedTotal,
  summary,
  paidAt,
  onPaidAtChange,
  userId,
  onRecordingSuccess,
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
            Cash Received Date
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('pl-3 text-left font-normal', !paidAt && 'text-muted-foreground')}
              >
                {paidAt ? formatDate(paidAt.toISOString()) : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={paidAt}
                onSelect={onPaidAtChange}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
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
            paidAt={paidAt}
            userId={userId}
            selectedTotal={selectedTotal}
            onSuccess={onRecordingSuccess}
          />
        </div>
      </CardContent>
    </Card>
  );
}
