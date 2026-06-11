import { BadRequestError, NotFoundError } from '@errors';
import { prisma } from '@lib/prisma';
import { uploadToBucket } from '@lib/supabase/storage';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { env } from '@src/env';
import { fileUpload } from '@src/middleware/file-upload';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';

const TransferEntryParamsSchema = z.object({
  entryId: z.string().uuid('Invalid ledger entry ID'),
});

export const postTransferReferenceFile: RequestHandler[] = [
  fileUpload.single('file'),
  validate({ params: TransferEntryParamsSchema }),

  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';
    const entryId = req.params.entryId as string;

    logger.info(
      { traceId, entryId },
      'POST /api/v1/payments/transfer/{entryId}/references/files - Request started',
    );

    const user = await withRole(req, UserRole.FINANCE);

    logger.info(
      { traceId, userId: user.id },
      'POST /api/v1/payments/transfer/{entryId}/references/files - User authorized',
    );

    const entry = await prisma.ledgerEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundError('Ledger entry not found');
    }

    const file = req.file;
    if (!file || !file.size || file.size === 0) {
      throw new BadRequestError('File is required and must not be empty');
    }

    const uploadResult = await uploadToBucket(
      file,
      `transfers/${req.user!.associationId}/${entryId}`,
      traceId,
    );

    const fileRecord = await prisma.file.create({
      data: {
        associationId: req.user!.associationId,
        originalName: file.originalname,
        storedName: uploadResult.key,
        mimeType: uploadResult.mimeType,
        extension: file.originalname.split('.').pop() || null,
        sizeBytes: uploadResult.sizeBytes,
        bucket: env.STORAGE_BUCKET,
        storageKey: uploadResult.key,
        url: uploadResult.url,
        uploadedById: user.id,
      },
    });

    const reference = await prisma.ledgerEntryReference.create({
      data: {
        ledgerEntryId: entryId,
        type: 'FILE',
        fileId: fileRecord.id,
        remarks: (req.body.remarks as string) ?? null,
      },
      include: { file: true },
    });

    logger.info(
      { traceId, referenceId: reference.id },
      'POST /api/v1/payments/transfer/{entryId}/references/files - Success',
    );

    return success(
      res,
      { data: reference, message: 'File attached to transfer successfully.' },
      201,
    );
  }),
];
