import { Button } from '@src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/components/ui/dialog';
import { formattedAmount } from '@src/shared/utils/format';
import { ArrowRight, Info,Loader2 } from 'lucide-react';

import { Subscription, SubscriptionPlan } from '../types';

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  currentPlan: Subscription | null;
  newPlan: SubscriptionPlan | null;
}

export function ChangePlanDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  currentPlan,
  newPlan,
}: ChangePlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Plan Change</DialogTitle>
          <DialogDescription>
            Review the changes before confirming the plan switch.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="border border-hairline bg-surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Current Plan
            </p>
            <p className="text-sm font-medium text-ink">{currentPlan?.plan?.name ?? '-'}</p>
            <p className="text-sm text-body mt-1">
              {currentPlan?.planVersion
                ? formattedAmount(currentPlan.planVersion.amount, currentPlan.planVersion.currency)
                : '-'}
              <span className="text-xs text-muted-foreground ml-1">
                /{currentPlan?.planVersion?.billingCycle?.toLowerCase() ?? ''}
              </span>
            </p>
          </div>

          <div className="border border-hairline bg-surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              New Plan
            </p>
            <p className="text-sm font-medium text-ink">{newPlan?.name ?? '-'}</p>
            <p className="text-sm text-body mt-1">
              {newPlan?.activeVersion
                ? formattedAmount(newPlan.activeVersion.amount, newPlan.activeVersion.currency)
                : '-'}
              <span className="text-xs text-muted-foreground ml-1">
                /{newPlan?.activeVersion?.billingCycle?.toLowerCase() ?? ''}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Feature Comparison
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
              <span className="text-right text-body">{currentPlan?.plan?.name}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-left text-ink font-medium">{newPlan?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Billing Cycle Impact</p>
            <p className="text-xs text-amber-700 mt-1">
              {currentPlan
                ? `This change will take effect from the next billing cycle (next ${currentPlan.planVersion?.billingCycle?.toLowerCase() ?? 'cycle'}). The member will be charged the new plan amount starting then.`
                : 'The member will be subscribed to the selected plan and charged according to its billing cycle.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing Plan...
              </>
            ) : (
              'Confirm Change'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
