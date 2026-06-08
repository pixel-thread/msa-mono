// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

import { pageNumberValidation, uuidValidiation } from '@validator/common';
// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import z from 'zod';

// ---------------------------------------------------------------------------
// Ledger validators
//
// Schemas for ledger route params, query strings, and request bodies.
// ---------------------------------------------------------------------------

/** Schema for ledger route parameters containing a member ID. */
export const LedgerRouteParams = z.object({ memberId: uuidValidiation });

/** Schema for paginated ledger query parameters. */
export const LedgerQueryParams = z.object({
  page: pageNumberValidation,
});

/** Schema for a single ledger entry line (debit/credit). */
export const CreateLedgerLineSchema = z.object({
  accountId: z.uuid(),
  isDebit: z.boolean(),
  amount: z.number().positive(),
});

/** Schema for creating a new ledger entry with multiple lines. */
export const CreateLedgerEntrySchema = z.object({
  description: z.string().min(1),
  paymentId: z.uuid().optional().nullable(),
  lines: z.array(CreateLedgerLineSchema).min(2),
});

/** Schema for rejecting a ledger entry. */
export const RejectEntrySchema = z.object({
  reason: z.string().optional(),
});

/** Schema for paginated member ledger query. */
export const MemberLedgerQuerySchema = z.object({
  page: pageNumberValidation,
});

/** Schema for report queries with optional dates. */
export const ReportQuerySchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ---- Account schemas

/** Schema for creating a new ledger account. */
export const CreateLedgerAccountSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional(),
});

/** Schema for paginated account query. */
export const LedgerAccountQuerySchema = z.object({
  page: pageNumberValidation,
});

/** Schema for account route parameters (UUID). */
export const LedgerAccountParamsSchema = z.object({
  id: z.uuid('Invalid Ledger Account ID'),
});

export type CreateLedgerAccountInput = z.infer<typeof CreateLedgerAccountSchema>;
export type LedgerAccountQueryInput = z.infer<typeof LedgerAccountQuerySchema>;
export type LedgerAccountParamsInput = z.infer<typeof LedgerAccountParamsSchema>;
