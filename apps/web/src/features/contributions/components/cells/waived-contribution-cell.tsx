'use client';

import { useState } from 'react';
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
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { formattedAmount } from '@src/shared/utils';
import { getMonthName } from '@src/shared/utils/helper/get-month-name';
import { toast } from 'sonner';

import { useWaiveContribution } from '../../hooks/use-waive-contribution';
import { ContributionPeriod } from '../../types';
import { ContributionStatusBadge } from '../contribution-status-badge';

type WaivedContributionCellProps = {
  contributionPeriod: ContributionPeriod;
};

export const WaivedContributionCell = ({ contributionPeriod }: WaivedContributionCellProps) => {
  const [reason, setReason] = useState('');
  const id = contributionPeriod.id;

  const { mutate, isPending } = useWaiveContribution();

  const handleCancel = () => {
    setReason('');
  };

  const handleWaive = () => {
    if (contributionPeriod.status === 'WAIVED' || contributionPeriod.status === 'PAID') {
      return;
    }
    mutate(
      { contributionPeriodId: id, reason },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(data.message);
            return data;
          }
          toast.error(data.message);
          return data;
        },
      },
    );
  };
  const disabled = isPending
    ? contributionPeriod.id === id
    : contributionPeriod.status === 'WAIVED' || contributionPeriod.status === 'PAID';
  return (
    <AlertDialog onOpenChange={(open) => !open && setReason('')}>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled} size="sm" variant="destructive">
          Waive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[450px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Waive Contribution</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark the contribution as waived. Please provide a reason for the waiver.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="border border-hairline bg-surface-soft p-4 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Period</span>
            <span className="text-sm text-ink">
              {getMonthName(contributionPeriod.month)} {contributionPeriod.year}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Due Amount</span>
            <span className="text-sm text-destructive font-semibold">
              {formattedAmount(parseInt(contributionPeriod.dueAmount))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Due Date</span>
            <span className="text-sm text-ink">
              {new Date(contributionPeriod.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status</span>
            <ContributionStatusBadge status={contributionPeriod.status} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="waive-reason">Waiver Reason</Label>
          <Textarea
            id="waive-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for waiving this contribution..."
            rows={3}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={!reason.trim()} onClick={handleWaive}>
            Waive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
