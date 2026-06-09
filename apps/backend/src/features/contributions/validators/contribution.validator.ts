import { ContributionStatus, PaymentMethod } from '@prisma/client';
import { pageNumberValidation } from '@validator/common';
import { z } from 'zod';

// ---- Generate Monthly Contributions ----

export const GenerateUserContributionsSchema = z.object({
  year: z.number().int().min(2020).max(2100).default(new Date().getFullYear()).optional(),
  months: z.number().int().min(1).max(12).default(12).optional(),
});

export const GenerateContributionsSchema = z.object({
  year: z.number().int().min(2020).max(2100).default(new Date().getFullYear()),
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

export const RecordContributionSchema = z.object({
  userId: z.uuid('Invalid User'),
  contributionPeriodIds: z.array(z.uuid()),
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.CASH),
  referenceNumber: z.string().optional().nullable(),
  paidAt: z.coerce.date('Cash recieve date is required'),
  remarks: z.string().optional().nullable(),
});

export const ContributionsQuerySchema = z.object({
  page: pageNumberValidation,
  status: z.enum(Object.values(ContributionStatus) as [string, ...string[]]).optional(),
  userId: z.uuid().optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const ContributionIdParamsSchema = z.object({
  contributionId: z.uuid('Invalid contribution ID'),
});

export const UserContributionsQuerySchema = z.object({
  page: pageNumberValidation,
  fromYear: z.coerce.number().int().min(2020).max(2100).optional(),
  fromMonth: z.coerce.number().int().min(1).max(12).optional(),
  toYear: z.coerce.number().int().min(2020).max(2100).optional(),
  toMonth: z.coerce.number().int().min(1).max(12).optional(),
});

export type RecordContributionInput = z.infer<typeof RecordContributionSchema>;
