import { DsarRequestType, DsarStatus } from '@sharedType/enums';
import { pageNumberValidation } from '@src/shared/validators/common';
import { z } from 'zod';

export const SubmitDsarSchema = z.object({
  requestType: z.nativeEnum(DsarRequestType),
  requestedData: z.array(z.string()).min(1, 'At least one data category required'),
  description: z
    .string()
    .max(500)
    .optional()
    .transform((v) => v?.trim()),
});

export const RespondDsarSchema = z.object({
  status: z.nativeEnum(DsarStatus),
  notes: z.string().max(1000).optional(),
  rejectedReason: z.string().max(500).optional(),
  responseType: z.string().optional(),
  storageKey: z.string().optional(),
  deliveryMethod: z.string().default('secure_download'),
});

export const DsarQuerySchema = z.object({
  page: pageNumberValidation,
  status: z.nativeEnum(DsarStatus).optional(),
  requestType: z.nativeEnum(DsarRequestType).optional(),
  userId: z.string().optional(),
});
