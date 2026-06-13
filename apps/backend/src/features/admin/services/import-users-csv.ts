/**
 * @file CSV User Import Service
 * @description Parse, validate, and bulk-import users from a CSV file buffer.
 */

import { BadRequestError } from '@errors';
import { prisma } from '@lib/prisma';
import { logger } from '@src/shared/logger';
import csvParser from 'csv-parser';
import { Readable } from 'node:stream';

import type { CsvImportError } from '../types';
import type { CsvUserImportRowInput } from '../validators';
import { CsvUserImportRowSchema } from '../validators';

/**
 * Parse, validate, and bulk-import users from a CSV file buffer.
 *
 * Reads the buffer as a CSV stream, validates every row against
 * CsvUserImportRowSchema, checks for duplicate emails already in the DB
 * for the given association, and bulk-creates any valid non-duplicate users.
 *
 * @param fileBuffer - Raw CSV file bytes (from multer).
 * @param associationId - The association to scope the import to.
 * @param traceId - Request trace ID for structured logging.
 * @returns Summary with created count, skipped count, and per-row errors.
 * @throws {BadRequestError} If the CSV is empty, unparseable, or no valid
 *   rows remain after filtering duplicates.
 */
export async function importUsersCsvService(
  fileBuffer: Buffer,
  associationId: string,
  traceId: string,
): Promise<{ created: number; skipped: number; errors: CsvImportError[] }> {
  // CSV Parsing — create a Readable stream from the buffer and pipe through csv-parser
  const rows: Record<string, string>[] = [];

  await new Promise<void>((resolve, reject) => {
    Readable.from([fileBuffer])
      .pipe(csvParser())
      .on('data', (row: Record<string, string>) => rows.push(row))
      .on('end', () => resolve())
      .on('error', () =>
        reject(new BadRequestError('Failed to parse CSV file. Check the file format.')),
      );
  });

  if (rows.length === 0) throw new BadRequestError('CSV file is empty');

  logger.info({ traceId, totalRows: rows.length }, 'importUsersCsvService - CSV parsed');

  // Row Validation — validate every row with Zod, collecting all errors

  const errors: CsvImportError[] = [];
  const validRows: CsvUserImportRowInput[] = [];

  for (const [index, row] of rows.entries()) {
    const result = CsvUserImportRowSchema.safeParse(row);
    if (!result.success) {
      errors.push({
        row: index + 2,
        email: row.email || '(missing)',
        reason: result.error.issues[0]?.message || 'Invalid row',
      });
      return { created: 0, skipped: errors.length, errors };
    } else {
      validRows.push(result.data);
    }
  }

  // Early return on all-errors — if every row failed validation, bail out
  if (errors.length > 0 && validRows.length === 0) {
    return { created: 0, skipped: errors.length, errors };
  }

  // Duplicate check — query DB for existing emails within this association
  const existingEmails = await prisma.user.findMany({
    where: {
      associationId,
      email: { in: validRows.map((r) => r.email) },
    },
    select: { email: true },
  });

  const existingEmailSet = new Set(existingEmails.map((u) => u.email));

  // Filter duplicates — skip rows whose email already exists in the DB
  const toCreate = validRows.filter((r) => {
    if (existingEmailSet.has(r.email)) {
      errors.push({
        row: rows.findIndex((raw) => raw.email === r.email) + 2,
        email: r.email,
        reason: 'Email already exists',
      });
      return false;
    }
    return true;
  });

  // Early return if nothing to create — all valid rows were duplicates
  if (toCreate.length === 0) {
    return { created: 0, skipped: errors.length, errors };
  }

  // Bulk create — insert users with null password (forces first-login reset)
  await prisma.user.createMany({
    data: toCreate.map((r) => ({
      associationId,
      email: r.email,
      name: r.name,
      mobile: r.mobile ?? null,
      designation: r.designation ?? null,
      dateOfJoiningGovt: r.dateOfJoiningGovt ?? null,
      dateOfJoiningAssociation: r.dateOfJoiningAssociation ?? null,
      dateOfRetirement: r.dateOfRetirement ?? null,
      password: null,
      status: 'ACTIVE',
    })),
  });

  const created = toCreate.length;

  const skipped = errors.length;

  logger.info({ traceId, created, skipped }, 'importUsersCsvService - Completed');

  return { created, skipped, errors };
}
