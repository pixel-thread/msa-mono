/**
 * @file CSV User Import Route Handler
 * @description Handles bulk import of users via CSV file upload.
 */

import { BadRequestError } from '@errors';
import { prisma } from '@lib/prisma';
import { UserRole } from '@prisma/client';
import { createUploadMiddleware } from '@src/middleware/file-upload';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import csvParser from 'csv-parser';
import type { RequestHandler } from 'express';
import type { Request, Response } from 'express';
import { Readable } from 'node:stream';
import { z } from 'zod';

const csvUpload = createUploadMiddleware({
  maxFileSizeMB: 10,
  allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
});

const CsvUserImportRowSchema = z.object({
  email: z.email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')
    .optional()
    .nullable(),
  designation: z.string().optional().nullable(),
  dateOfJoiningGovt: z.coerce.date().optional().nullable(),
  dateOfJoiningAssociation: z.coerce.date().optional().nullable(),
  membershipNumber: z.string().optional().nullable(),
});

type CsvImportError = { row: number; email: string; reason: string };

export const importUsersCsv: RequestHandler[] = [
  csvUpload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';
    const user = await withRole(req, UserRole.MEMBER);

    const file = req.file;
    if (!file) throw new BadRequestError('CSV file is required');
    if (!file.size) throw new BadRequestError('CSV file is empty');

    logger.info(
      { traceId, size: file.size },
      'POST /api/v1/admin/users/import-csv - File received',
    );

    // Parse CSV rows using streaming parser
    const rows: Record<string, string>[] = [];
    await new Promise<void>((resolve, reject) => {
      Readable.from([file.buffer])
        .pipe(csvParser())
        .on('data', (row: Record<string, string>) => rows.push(row))
        .on('end', () => resolve())
        .on('error', () =>
          reject(new BadRequestError('Failed to parse CSV file. Check the file format.')),
        );
    });

    if (rows.length === 0) throw new BadRequestError('CSV file is empty');

    logger.info(
      { traceId, totalRows: rows.length },
      'POST /api/v1/admin/users/import-csv - CSV parsed',
    );

    // Validate every row with Zod, collecting all errors
    const errors: CsvImportError[] = [];
    const validRows: z.output<typeof CsvUserImportRowSchema>[] = [];

    for (const [index, row] of rows.entries()) {
      const result = CsvUserImportRowSchema.safeParse(row);
      if (!result.success) {
        errors.push({
          row: index + 2,
          email: row.email || '(missing)',
          reason: result.error.issues[0]?.message || 'Invalid row',
        });
      } else {
        validRows.push(result.data);
      }
    }

    // Check for existing emails in DB within the same association
    const existingEmails = await prisma.user.findMany({
      where: {
        associationId: user.associationId,
        email: { in: validRows.map((r) => r.email) },
      },
      select: { email: true },
    });
    const existingEmailSet = new Set(existingEmails.map((u) => u.email));

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

    if (toCreate.length === 0) {
      throw new BadRequestError('No valid rows to import', { errors });
    }

    // Bulk create users with password=null (forces first-login reset)
    await prisma.user.createMany({
      data: toCreate.map((r) => ({
        associationId: user.associationId,
        email: r.email,
        name: r.name,
        mobile: r.mobile ?? null,
        designation: r.designation ?? null,
        dateOfJoiningGovt: r.dateOfJoiningGovt ?? null,
        dateOfJoiningAssociation: r.dateOfJoiningAssociation ?? null,
        membershipNumber: r.membershipNumber ?? null,
        role: ['MEMBER'],
        password: null,
        status: 'ACTIVE',
      })),
    });

    const created = toCreate.length;
    const skipped = errors.length;

    logger.info({ traceId, created, skipped }, 'POST /api/v1/admin/users/import-csv - Completed');

    return success(
      res,
      {
        data: { created, skipped, errors },
        message: `${created} user(s) imported. ${skipped} row(s) skipped.`,
      },
      201,
    );
  }),
];
