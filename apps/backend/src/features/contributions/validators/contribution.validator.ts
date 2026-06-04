import { z } from 'zod';

// ---- Generate Monthly Contributions ----

export const GenerateUserContributionsSchema = z.object({
  year: z.number().int().min(2020).max(2100).default(new Date().getFullYear()).optional(),
  months: z.number().int().min(1).max(12).default(12).optional(),
});

export const GenerateContributionsSchema = z.object({
  year: z.number().int().min(2020).max(2100).default(new Date().getFullYear()),
  months: z.number().int().min(1).max(12),
});

// ---- Waive Contribution ----

export const WaiveContributionSchema = z.object({
  contributionPeriodId: z.uuid(),
  reason: z.string().min(1, 'Waiver reason is required'),
});

// ---- Query Schemas ----

export const ContributionReportQuerySchema = z.object({
  userId: z.uuid(),
  fromYear: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(2020)),
  fromMonth: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(12)),
  toYear: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(2020)),
  toMonth: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(12)),
});

export const UserContributionsParamsSchema = z.object({
  userId: z.uuid('Invalid user ID'),
});
