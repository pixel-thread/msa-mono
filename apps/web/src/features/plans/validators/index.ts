import { z } from 'zod';

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

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

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

export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
