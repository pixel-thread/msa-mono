// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { pageNumberValidation } from '@validator/common';
import { z } from 'zod';

// ---- Create plan ------------------------------------------------------------

/** Schema for creating a new plan. */
export const CreatePlanSchema = z.object({
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

/** Input type inferred from CreatePlanSchema. */
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

// ---- Update plan ------------------------------------------------------------

/** Schema for updating a plan (all fields optional). */
export const UpdatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).optional(),
  features: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
  memberTypeId: z.uuid().optional().nullable(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
});

/** Input type inferred from UpdatePlanSchema. */
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;

/** Schema for setting a default plan. */
export const SetDefaultPlanSchema = z.object({
  planId: z.uuid(),
});

/** Schema for plan ID path parameter. */
export const PlanParamsSchema = z.object({ planId: z.uuid() });

export const PlanQuerySchema = z.object({
  page: pageNumberValidation,
});
