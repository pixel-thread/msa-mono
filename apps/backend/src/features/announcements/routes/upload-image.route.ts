/**
 * @file upload-image.route.ts
 * @description Route handler for uploading an image for an announcement.
 *
 * @module features/announcements/routes
 */

import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

// Shared utilities
import { success } from '@utils/responses';
import { validate } from '@lib/validate';
import { withRole } from '@utils/with-role';
import { asyncHandler } from '@utils/async-handler';
import { logger } from '@src/shared/logger';

// Prisma
import { UserRole } from '@prisma/client';

// Storage
import { deleteFromBucket } from '@lib/supabase/storage';

// Validators
import { AnnouncementRouteParams } from '@feature/announcements/validators';
import { uploadAnnouncementImage } from '@feature/announcements/services';
import { BadRequestError } from '@src/shared/errors';
import { fileUpload } from '@middleware/file-upload';

/**
 * POST /api/announcements/:announcementId/upload
 * Upload an image for an announcement.
 * Security: SECRETARY role or higher required.
 *
 * @type {RequestHandler[]}
 */
export const postUploadImage: RequestHandler[] = [
  fileUpload.single('file'),
  validate({ params: AnnouncementRouteParams }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const announcementId = req.params.announcementId;

    logger.info(
      { traceId, announcementId },
      'POST /api/announcements/[id]/upload - Request started',
    );

    // Enforce SECRETARY role — only secretaries and above may upload images
    const user = await withRole(req, UserRole.SECRETARY);

    logger.info(
      { traceId, userId: user.id, announcementId },
      'POST /api/announcements/[id]/upload - User authorized',
    );

    logger.info(
      { traceId, announcementId },
      'POST /api/announcements/[id]/upload - Uploading image',
    );

    const file = req.file;

    if (!file) {
      throw new BadRequestError('Invalid request body');
    }

    // Wire up actual uploadAnnouncementImage service call
    const { announcement, oldStorageKey } = await uploadAnnouncementImage({
      announcementId: announcementId as string,
      associationId: user.associationId,
      file: file,
      uploadedById: user.id,
    });

    // Clean up the previous image from storage if one existed
    if (oldStorageKey) {
      try {
        await deleteFromBucket(oldStorageKey);
      } catch (error) {
        logger.error(
          { error, traceId },
          'POST /api/announcements/[id]/upload - Failed to delete old image',
        );
      }
    }

    logger.info({ traceId, announcementId }, 'POST /api/announcements/[id]/upload - Success');

    return success(res, { data: announcement }, 200);
  }),
];
