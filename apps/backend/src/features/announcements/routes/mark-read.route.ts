/**
 * @file mark-read.route.ts
 * @description Route handler for marking an announcement as read.
 *
 * @module features/announcements/routes
 */

import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

// Shared utilities
import { success } from '@src/shared/utils/responses';
import { validate } from '@src/shared/lib/validate';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { logger } from '@src/shared/logger';
import { BadRequestError } from '@src/shared/errors';

// Prisma
import { UserRole } from '@prisma/client';

// Services
import { markAnnouncementRead } from '@feature/announcements/services';
import { getAssociation } from '@src/shared/services/association/get-association';

// Validators
import { AnnouncementRouteParams } from '@src/features/announcements/validators';

/**
 * POST /api/announcements/:announcementId/read
 * Mark an announcement as read by the authenticated user.
 * Security: MEMBER role required.
 *
 * @type {RequestHandler[]}
 */
export const postMarkRead: RequestHandler[] = [
  validate({ params: AnnouncementRouteParams }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const announcementId = req.params.announcementId;

    if (!announcementId) {
      throw new BadRequestError('Invalid announcement id');
    }

    const association = await getAssociation(req);

    logger.info(
      { traceId, announcementId, associationId: association.id },
      'POST /api/announcements/[id]/read - Request started',
    );

    const userId = req.userId as string;

    // Enforce MEMBER role — any authenticated member can mark as read
    await withRole(req, UserRole.MEMBER);

    logger.info(
      { traceId, userId, announcementId },
      'POST /api/announcements/[id]/read - User authorized',
    );

    // Wire up actual markAnnouncementRead service call
    const readReceipt = await markAnnouncementRead({
      announcementId,
      userId,
      associationId: association.id,
    });

    logger.info(
      { traceId, announcementId },
      'POST /api/announcements/[id]/read - Success',
    );

    return success(res, {
      data: readReceipt,
      message: 'Announcement marked as read',
    });
  }),
];
