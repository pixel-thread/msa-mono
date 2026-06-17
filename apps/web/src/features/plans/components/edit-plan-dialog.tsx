import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemberTypes } from '@src/features/members/hooks/use-member-types';
import { useUpdatePlan } from '@src/features/plans/hooks/use-update-plan';
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
import { Switch } from '@src/shared/components/ui/switch';
import { BILLING_CYCLE } from '@src/shared/types';
import { useForm } from 'react-hook-form';

import { usePlan } from '../hooks/use-plan';
import { usePlanStore } from '../stores';
import { UpdatePlanInput, UpdatePlanSchema } from '../validators';

interface EditPlanDialogProps {
  planId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanDialog({ planId, open, onOpenChange }: EditPlanDialogProps) {
  const updatePlan = useUpdatePlan();
  const { data: plan } = usePlan({ planId: planId });
  const { memberTypes } = useMemberTypes();
  const { setPlan } = usePlanStore();

  const form = useForm({
    resolver: zodResolver(UpdatePlanSchema),
    defaultValues: {
      name: '',
      description: '',
      amount: 0,
      currency: 'INR',
      billingCycle: 'MONTHLY',
      features: {},
      memberTypeId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (plan && open) {
      const activeVersion = plan.activeVersion;
      form.reset({
        name: plan.name,
        description: plan.description || '',
        amount: activeVersion?.amount ?? 0,
        currency: activeVersion?.currency ?? 'INR',
        billingCycle: (activeVersion?.billingCycle ?? 'YEARLY') as 'MONTHLY' | 'YEARLY',
        features: (activeVersion?.features as Record<string, unknown>) || {},
        memberTypeId: plan.memberTypeId || '',
        effectiveTo: activeVersion?.effectiveTo ? new Date(activeVersion.effectiveTo) : undefined,
        effectiveFrom: activeVersion?.effectiveFrom
          ? new Date(activeVersion.effectiveFrom)
          : undefined,
        isActive: plan.isActive,
      });
    }
  }, [plan, open, form]);

  const onSubmit = (data: UpdatePlanInput) => {
    if (!plan) return;

    const { memberTypeId, effectiveTo, effectiveFrom, isActive, ...rest } = data;
    updatePlan.mutate(
      {
        planId: plan.id,
        ...rest,
        effectiveTo: effectiveTo || undefined,
        effectiveFrom: effectiveFrom,
        memberTypeId: memberTypeId || undefined,
        isActive,
      },
      {
        onSuccess: ({ success }) => {
          if (success) {
            onOpenChange(false);
            setPlan(null);
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Edit Plan</DialogTitle>
          <DialogDescription>Update the details of the plan.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective To</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={
                        field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''
                      }
                      onChange={(e) =>
                        field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective From</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={
                        field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''
                      }
                      onChange={(e) =>
                        field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Cycle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(BILLING_CYCLE).map((cycle) => (
                          <SelectItem key={cycle} value={cycle}>
                            {cycle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="memberTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member Type (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {memberTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          Level {type.level}
                          {type.description ? ` - ${type.description}` : ''}
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
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="mb-0">Active</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePlan.isPending}>
                {updatePlan.isPending ? 'Updating...' : 'Update Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
