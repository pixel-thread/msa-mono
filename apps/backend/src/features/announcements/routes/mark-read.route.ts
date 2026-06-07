/**
 * @file mark-read.route.ts
 * @description Route handler for marking an announcement as read.
 *
 * @module features/announcements/routes
 */

import { BadRequestError } from '@errors';
// Services
import { markAnnouncementRead } from '@feature/announcements/services';
// Validators
import { AnnouncementRouteParams } from '@feature/announcements/validators';
import { validate } from '@lib/validate';
// Prisma
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
// Shared utilities
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

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

    const userId = req.user?.id as string;

    // Enforce MEMBER role — any authenticated member can mark as read
    await withRole(req, UserRole.MEMBER);

    logger.info(
      { traceId, userId, announcementId },
      'POST /api/announcements/[id]/read - User authorized',
    );

    // Wire up actual markAnnouncementRead service call
    const readReceipt = await markAnnouncementRead({
      announcementId: announcementId as string,
      userId,
      associationId: association.id,
    });

    logger.info({ traceId, announcementId }, 'POST /api/announcements/[id]/read - Success');

    return success(res, {
      data: readReceipt,
      message: 'Announcement marked as read',
    });
  }),
];
