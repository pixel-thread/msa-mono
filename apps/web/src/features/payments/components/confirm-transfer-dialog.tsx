'use client';

import type { Account } from '@src/shared/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@src/shared/components/ui/alert-dialog';
import { formatCurrency } from '@src/shared/utils/format';
import { ArrowRightLeft } from 'lucide-react';

interface ConfirmTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
  amount: number;
  fromAccount?: Account;
  toAccount?: Account;
  fromBalance: number;
  toBalance: number;
  remark: string;
}

export function ConfirmTransferDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
  amount,
  fromAccount,
  toAccount,
  fromBalance,
  toBalance,
  remark,
}: ConfirmTransferDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
          <AlertDialogDescription>
            Please review the transfer details before confirming.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(amount)}</p>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-md border p-4">
            <div className="text-center space-y-1">
              <p className="font-medium">{fromAccount?.name}</p>
              <p className="text-sm text-muted-foreground">
                Balance:{' '}
                <span className="text-foreground font-semibold">
                  {formatCurrency(fromBalance)}
                </span>
              </p>
              <p className="text-xs text-red-600">
                - {formatCurrency(amount)} → {formatCurrency(fromBalance - amount)}
              </p>
            </div>

            <ArrowRightLeft className="h-5 w-5 text-muted-foreground shrink-0" />

            <div className="text-center space-y-1">
              <p className="font-medium">{toAccount?.name}</p>
              <p className="text-sm text-muted-foreground">
                Balance:{' '}
                <span className="text-foreground font-semibold">
                  {formatCurrency(toBalance)}
                </span>
              </p>
              <p className="text-xs text-green-600">
                + {formatCurrency(amount)} → {formatCurrency(toBalance + amount)}
              </p>
            </div>
          </div>

          {remark && (
            <div className="text-sm">
              <span className="text-muted-foreground">Remark: </span>
              {remark}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            variant="destructive"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
