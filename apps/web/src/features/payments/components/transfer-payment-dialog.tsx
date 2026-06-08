import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLedgerAccounts } from '@hooks/useLedgerAccounts';
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
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRightLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const transferSchema = z
  .object({
    fromAccountId: z.string().min(1, 'Please select source account'),
    toAccountId: z.string().min(1, 'Please select destination account'),
    amount: z.number().positive('Amount must be greater than 0'),
    remark: z.string().optional(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: 'Source and destination accounts must be different',
    path: ['toAccountId'],
  });

type TransferFormValues = z.infer<typeof transferSchema>;

export function TransferPaymentDialog() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { accounts } = useLedgerAccounts();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
      remark: '',
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

  const onSubmit = () => {
    if (!fromAccount || !toAccount) return;
    if (parseInt(fromAccount.balance.balance) <= amount)
      return toast.error(fromAccount.name + ' does not have enough balance');
    setShowConfirm(true);
  };

  const handleConfirmTransfer = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    queryClient.invalidateQueries({ queryKey: ['payments'] });
    toast.success('Transfer successful');

    setIsSubmitting(false);
    form.reset();
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {accounts && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Balance: {fromAccount?.balance.balance}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {toAccount && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Balance: ${toAccount.balance.balance}
                      </p>
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

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Optional remark" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {fromAccount && toAccount && amount > 0 && (
              <div className="p-3 bg-muted rounded-md text-sm text-center font-medium">
                Note: {amount} will be transferred from {fromAccount.name} to {toAccount.name}.
              </div>
            )}

            <DialogFooter>
              <DialogClose className={cn(buttonVariants({ variant: 'outline' }))}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Transferring...' : 'Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
              <AlertDialogDescription>
                Transfer {amount} from{' '}
                <span className="text-primary font-bold"> "{fromAccount?.name}" </span>to{' '}
                <span className="text-primary font-bold">"{toAccount?.name}"</span>?{' '}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmTransfer}
                variant={'destructive'}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
