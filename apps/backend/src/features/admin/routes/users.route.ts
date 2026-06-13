/**
 * @file CSV User Import Route Handler
 * @description Handles bulk import of users via CSV file upload.
 */

import { BadRequestError } from '@errors';
import { UserRole } from '@prisma/client';
import { rbac } from '@src/middleware';
import { createUploadMiddleware } from '@src/middleware/file-upload';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { Request, Response } from 'express';

import { importUsersCsvService } from '../services/import-users-csv';

const csvUpload = createUploadMiddleware({
  maxFileSizeMB: 10,
  allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
});

/**
 * POST /api/v1/admin/users/import-csv
 *
 * Bulk-import users from a CSV file upload. Accepts a multipart form with a
 * "file" field containing CSV data. Delegates parsing, validation, dedup, and
 * creation to importUsersCsvService.
 */
export const importUsersCsv: RequestHandler[] = [
  rbac(UserRole.PRESIDENT),
  csvUpload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';

    const associationId = req.user?.associationId;

    if (!associationId) throw new BadRequestError('Association not found');

    const file = req.file;

    if (!file) throw new BadRequestError('CSV file is required');

    if (!file.size) throw new BadRequestError('CSV file is empty');

    const result = await importUsersCsvService(file.buffer, associationId, traceId);

    return success(
      res,
      {
        data: { created: result.created, skipped: result.skipped, errors: result.errors },
        message: `${result.created} user(s) imported. ${result.skipped} row(s) skipped.`,
      },
      201,
    );
  }),
];
