import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { ENDPOINTS } from '@repo/shared';
import { MemberCombobox } from '@src/shared/components/members/member-combobox';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const CreateManualContributionSchema = z.object({
  amount: z.string('Amount must be greater than 0'),
  memberId: z.uuid('Invalid member id'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

type CreateManualContributionInput = z.infer<typeof CreateManualContributionSchema>;

export const ManualContributionDialog = () => {
  const form = useForm({
    resolver: zodResolver(CreateManualContributionSchema),
    defaultValues: {
      amount: '0',
      memberId: '',
      paymentMethod: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateManualContributionInput) =>
      http.post(ENDPOINTS.CONTRIBUTION.CREATE_PAYMENT, data),

    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Contribution created successfully');
        form.reset();
        return;
      }

      toast.error(data.message || 'Contribution failed');
    },
  });

  const onSubmit: SubmitHandler<CreateManualContributionInput> = (data) => {
    mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Contribution</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offline Contribution</DialogTitle>
          <DialogDescription>Create a manual contribution payment.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <MemberCombobox value={field.value} onValueChange={field.onChange} />
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Contribution'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
