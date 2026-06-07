// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { z } from 'zod';
import { pageNumberValidation } from '@validator/common';

// ---- Create subscription plan ------------------------------------------------

/** Schema for creating a new subscription plan. */
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

/** Input type inferred from CreateSubscriptionPlanSchema. */
export type CreateSubscriptionPlanInput = z.infer<typeof CreateSubscriptionPlanSchema>;

// ---- Subscribe ---------------------------------------------------------------

/** Schema for validating subscription signup requests. */
export const SubscribeSchema = z.object({
  planId: z.uuid(),
});

// ---- Waive subscription -----------------------------------------------------

/** Schema for validating subscription waiver requests. */
export const WaiveSubscriptionSchema = z.object({
  subscriptionId: z.uuid(),
  reason: z.string().min(1),
});

// ---- Upgrade subscription ----------------------------------------------------

/** Schema for validating subscription upgrade requests. */
export const UpgradeSubscriptionSchema = z.object({
  planId: z.uuid(),
  userId: z.uuid().optional(),
});

/** Input type inferred from UpgradeSubscriptionSchema. */
export type UpgradeSubscriptionInput = z.infer<typeof UpgradeSubscriptionSchema>;

// ---- Downgrade subscription ---------------------------------------------------

/** Schema for validating subscription downgrade requests. */
export const DowngradeSubscriptionSchema = z.object({
  planId: z.uuid(),
  userId: z.uuid().optional(),
});

/** Input type inferred from DowngradeSubscriptionSchema. */
export type DowngradeSubscriptionInput = z.infer<typeof DowngradeSubscriptionSchema>;

// ---- Update plan ------------------------------------------------------------

/** Schema for updating a subscription plan (all fields optional). */
export const UpdatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).optional(),
  features: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
  memberTypeId: z.uuid().optional().nullable(),
});

/** Schema for setting a default plan. */
export const SetDefaultPlanSchema = z.object({
  planId: z.uuid(),
});

/** Schema for plan ID path parameter. */
export const PlanParamsSchema = z.object({ planId: z.uuid() });

// ---- My subscription --------------------------------------------------------

/** Schema for paginated my-subscription query. */
export const MySubscriptionQuerySchema = z.object({
  page: pageNumberValidation,
});

// ---- Subscription payments --------------------------------------------------

/** Schema for subscription ID path parameter. */
export const SubscriptionParamsSchema = z.object({
  subscriptionId: z.uuid('Invalid subscription ID'),
});

/** Schema for paginated subscription payments query. */
export const SubscriptionQuerySchema = z.object({
  page: pageNumberValidation,
});
