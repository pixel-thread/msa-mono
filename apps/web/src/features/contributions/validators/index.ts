import { z } from 'zod';
import { ContributionStatus } from '@sharedType/enums';
import { pageNumberValidation, pageSizeValidation } from '@src/shared/validators/common';

export const GenerateContributionsSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

export const WaiveContributionSchema = z.object({
  contributionPeriodId: z.uuid(),
  reason: z.string().min(1, 'Waiver reason is required'),
});

export type WaiveContributionInput = z.infer<typeof WaiveContributionSchema>;

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

export const CollectionReportQuerySchema = z.object({
  page: pageNumberValidation,
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  status: z.nativeEnum(ContributionStatus).optional(),
});

export const UserContributionsParamsSchema = z.object({
  userId: z.uuid('Invalid user ID'),
});
