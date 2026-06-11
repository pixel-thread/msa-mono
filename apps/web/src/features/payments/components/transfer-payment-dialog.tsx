import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLedgerAccounts } from '@hooks/useLedgerAccounts';
import { Button, buttonVariants } from '@src/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@src/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@src/shared/components/ui/form';
import { Input } from '@src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import { Textarea } from '@src/shared/components/ui/textarea';
import { cn } from '@src/shared/lib';
import { formatCurrency } from '@src/shared/utils/format';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowRightLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { z } from 'zod';
import { useTransferAccountBalance } from '../hooks/useTransferAccountBalance';
import { TransferAccountBalanceSchema } from '../validators';
import { PAYMENT_REFERENCE } from '@src/shared/types';
import { ConfirmTransferDialog } from './confirm-transfer-dialog';

export function TransferPaymentDialog() {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const { accounts } = useLedgerAccounts();

  const form = useForm<z.input<typeof TransferAccountBalanceSchema>>({
    resolver: zodResolver(TransferAccountBalanceSchema),
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
      reference: '',
      referenceType: 'CASH' as const,
      remark: '',
      paidAt: new Date().toISOString(),
    },
  });

  const fromAccountId = form.watch('fromAccountId');
  const toAccountId = form.watch('toAccountId');
  const amount = form.watch('amount');

  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === fromAccountId),
    [fromAccountId, accounts],
  );

  const toAccount = useMemo(
    () => accounts.find((a) => a.id === toAccountId),
    [toAccountId, accounts],
  );

  const fromBalance = Number(fromAccount?.balance.balance ?? 0);

  const toBalance = Number(toAccount?.balance.balance ?? 0);

  const { mutate, isPending } = useTransferAccountBalance();

  const onSubmit = () => {
    if (!fromAccount || !toAccount) return;
    if (fromBalance < amount) {
      form.setError('amount', { message: 'Insufficient balance' });
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmTransfer = async () => {
    setShowConfirm(false);
    const formValues = TransferAccountBalanceSchema.parse(form.getValues());
    mutate(
      formValues,
      {
        onSuccess: (data) => {
          if (data.success) {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            toast.success('Transfer successful');
            form.reset();
            return;
          }
          toast.error(data.message);
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Transfer Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transfer Payment</DialogTitle>
          <DialogDescription>Transfer funds from one account to another.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between flex-row gap-4 items-start">
              <FormField
                control={form.control}
                name="fromAccountId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>From Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex w-full">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts
                          .filter((acc) => acc.id !== toAccountId)
                          .map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {fromAccount && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Balance: </span>
                          <span className="font-semibold">{formatCurrency(fromBalance)}</span>
                        </p>
                        {amount > 0 && (
                          <p className="text-sm text-red-600">
                            - {formatCurrency(amount)}
                            <span className="text-muted-foreground ml-1">
                              → {formatCurrency(fromBalance - amount)}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center pt-8">
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              </div>

              <FormField
                control={form.control}
                name="toAccountId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>To Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex w-full">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts
                          .filter((a) => a.id !== fromAccountId)
                          .map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {toAccount && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Balance: </span>
                          <span className="font-semibold">{formatCurrency(toBalance)}</span>
                        </p>
                        {amount > 0 && (
                          <p className="text-sm text-green-600">
                            + {formatCurrency(amount)}
                            <span className="text-muted-foreground ml-1">
                              → {formatCurrency(toBalance + amount)}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-x-2">
              <FormField
                control={form.control}
                name="referenceType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Reference Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select reference type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PAYMENT_REFERENCE).map((ref) => (
                          <SelectItem key={ref} value={ref}>
                            {ref}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Transfer Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional reference number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Required remark" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose className={cn(buttonVariants({ variant: 'outline' }))}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Transferring...' : 'Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <ConfirmTransferDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          isPending={isPending}
          onConfirm={handleConfirmTransfer}
          amount={amount}
          fromAccount={fromAccount}
          toAccount={toAccount}
          fromBalance={fromBalance}
          toBalance={toBalance}
          remark={form.watch('remark')}
        />
      </DialogContent>
    </Dialog>
  );
}
