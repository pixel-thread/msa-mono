import { BILLING_CYCLE } from '@src/shared/types';
import { z } from 'zod';

export const CreateSubscriptionPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().default('INR'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('YEARLY'),
  features: z.record(z.string(), z.any()).default({}),
  memberTypeId: z.string().optional(),
  isActive: z.boolean().default(true),
  effectiveTo: z.coerce.date().optional(),
  effectiveFrom: z.coerce.date().optional(),
});

export type CreateSubscriptionPlanInput = z.infer<typeof CreateSubscriptionPlanSchema>;

export const SubscribeSchema = z.object({
  planId: z.uuid(),
});

export const WaiveSubscriptionSchema = z.object({
  subscriptionId: z.uuid(),
  reason: z.string().min(1),
});

export const UpgradeSubscriptionSchema = z.object({
  planId: z.uuid(),
  userId: z.string().optional(),
});
export type UpgradeSubscriptionInput = z.infer<typeof UpgradeSubscriptionSchema>;

export const EditPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string(),
  billingCycle: z.enum(BILLING_CYCLE),
  features: z.record(z.string(), z.any()),
  memberTypeId: z.string().optional(),
  effectiveTo: z.string().optional(),
  effectiveFrom: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type EditPlanInput = z.infer<typeof EditPlanSchema>;
