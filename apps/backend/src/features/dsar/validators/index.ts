// ---- DSAR - Validators

// ---- Imports

// ---- External Libraries

// ---- Prisma Types
import { DsarRequestType, DsarStatus } from '@prisma/client';
// ---- Shared Validators
import { pageNumberValidation } from '@validator/common';
import { z } from 'zod';

// ---- Submit DSAR Schema

/**
 * Schema for validating DSAR ticket submission requests.
 */
export const SubmitDsarSchema = z
  .object({
    requestType: z.enum(DsarRequestType),
    requestedData: z.array(z.string()).min(1, 'At least one data category required'),
    description: z
      .string()
      .max(500)
      .optional()
      .transform((v) => v?.trim()),
  })
  .strict();

// ---- Respond to DSAR Schema

/**
 * Schema for validating DSAR ticket response requests.
 */
export const RespondDsarSchema = z
  .object({
    status: z.enum(DsarStatus),
    notes: z.string().max(1000).optional(),
    rejectedReason: z.string().max(500).optional(),
    responseType: z.string().optional(),
    storageKey: z.string().optional(),
    deliveryMethod: z.string().default('secure_download'),
  })
  .strict();

// ---- DSAR Query Schema

/**
 * Schema for validating DSAR list query parameters.
 */
export const DsarQuerySchema = z
  .object({
    page: pageNumberValidation,
    status: z.enum(DsarStatus).optional(),
    requestType: z.enum(DsarRequestType).optional(),
    userId: z.string().optional(),
  })
  .strict();

/** Schema for ticket ID path parameter. */
export const DsarTicketParamsSchema = z.object({ ticketId: z.string().uuid() });

/** Schema for assigning a ticket to a user. */
export const AssignDsarSchema = z.object({ assignedToId: z.string().uuid() });

/** Schema for rejecting a ticket with a reason. */
export const RejectDsarSchema = z.object({ reason: z.string().min(1).max(500) });
