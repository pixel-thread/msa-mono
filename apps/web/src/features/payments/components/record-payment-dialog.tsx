'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLedgerAccounts } from '@hooks/useLedgerAccounts';
import { QUERY_KEYS } from '@repo/shared';
import { RecordManualPaymentSchema } from '@src/features/payments/validators';
import { Button } from '@src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { PAYMENT_REFERENCE } from '@src/shared/types';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type RecordManualPaymentInput = z.infer<typeof RecordManualPaymentSchema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({ open, onOpenChange }: RecordPaymentDialogProps) {
  const queryClient = useQueryClient();
  const { accounts } = useLedgerAccounts();
  const incomeAccounts = accounts.filter((a) => a.type === 'INCOME');

  const form = useForm({
    resolver: zodResolver(RecordManualPaymentSchema),
    defaultValues: {
      amount: 0,
      notes: '',
      receiptNumber: '',
      reference: '',
      referenceType: 'CASH',
      method: 'CASH',
      incomeAccountId: '',
      paidAt: new Date().toISOString(),
    },
  });

  const recordPayment = useMutation({
    mutationFn: (data: RecordManualPaymentInput) => http.post('/payments/record', data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Payment recorded successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.ALL() });
        form.reset();
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to record payment');
      }
    },
  });

  const onSubmit = (data: RecordManualPaymentInput) => {
    recordPayment.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
          <DialogDescription>
            Record an offline payment made via cash, UPI, bank transfer, or cheque.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes / Remark</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Optional notes about this payment" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (INR) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      placeholder="0.00"
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
                  <FormItem className="w-full flex flex-col">
                    <FormLabel className="">Instrument Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select income account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PAYMENT_REFERENCE).map((acc) => (
                          <SelectItem key={acc} value={acc}>
                            {acc}
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
                    <FormLabel>Payment Recieved at</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={(field.value as string) ?? ''}
                        type="date"
                        placeholder="Optional paid at date"
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
                  <FormLabel>Instrument Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional reference number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incomeAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Account *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select income account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incomeAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
