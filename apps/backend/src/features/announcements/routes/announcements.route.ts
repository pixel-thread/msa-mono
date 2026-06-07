/**
 * @file announcements.route.ts
 * @description Route handlers for the announcements collection.
 * Provides endpoints for listing and creating announcements.
 *
 * @module features/announcements/routes
 */

import { ForbiddenError } from '@errors';
import { createAnnouncement,findManyAnnouncements } from '@feature/announcements/services';
// Validators
import {
  AnnouncementQuerySchema,
  CreateAnnouncementSchema,
} from '@feature/announcements/validators';
import { validate } from '@lib/validate';
// Prisma
import { AnnouncementStatus,UserRole } from '@prisma/client';
// Services
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
// Shared utilities
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import { NextFunction, Request, Response } from 'express';

/**
 * GET /api/announcements
 * List announcements with optional filters and pagination.
 * Security: MEMBER role required. High-role users receive pagination metadata.
 *
 * @type {RequestHandler[]}
 */
export const getAnnouncements: RequestHandler[] = [
  validate({ query: AnnouncementQuerySchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    logger.info({ traceId, query: req.query }, 'GET /api/announcements - Request started');

    // Enforce MEMBER role — any authenticated member can view announcements
    const user = await withRole(req, UserRole.MEMBER);

    logger.info(
      { traceId, userId: user.id, roles: user.role },
      'GET /api/announcements - User authorized',
    );

    const query = req.query as any;

    // Reject requests with invalid query parameters
    if (!query) {
      throw new ForbiddenError('Invalid query parameters');
    }

    // High-role users (secretaries, admins) get full pagination support
    if (hasHighRoleAccess(user.role)) {
      const result = await findManyAnnouncements({
        associationId: user.associationId,
        filters: {
          status: 'PUBLISHED',
          priority: query.priority,
          search: query.search,
        },
        pagination: {
          page: query.page,
        },
      });

      logger.info(
        {
          traceId,
          total: result.pagination.total,
          page: result.pagination.page,
          pageSize: result.pagination.pageSize,
        },
        'GET /api/announcements - Success',
      );

      return success(res, {
        data: result.announcements,
        meta: result.pagination,
      });
    }

    // Regular members — no pagination, just the default page
    const result = await findManyAnnouncements({
      associationId: user.associationId,
      filters: {
        status: 'PUBLISHED',
        priority: query.priority,
        search: query.search,
      },
    });

    logger.info(
      { traceId, count: result.announcements?.length },
      'GET /api/announcements - Success',
    );

    return success(res, {
      data: result.announcements,
      meta: result.pagination,
    });
  }),
];

/**
 * POST /api/announcements
 * Create a new announcement.
 * Security: SECRETARY role or higher required.
 *
 * @type {RequestHandler[]}
 */
export const postAnnouncement: RequestHandler[] = [
  validate({ body: CreateAnnouncementSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // Resolve the association from the request context
    const association = await getAssociation(req);

    logger.info({ traceId }, 'POST /api/announcements - Request started');

    // Enforce SECRETARY role — only secretaries and above may create announcements
    const user = await withRole(req, UserRole.SECRETARY);

    logger.info(
      { traceId, userId: user.id, roles: user.role },
      'POST /api/announcements - User authorized',
    );

    // Guard against empty request body
    if (!req.body) {
      throw new ForbiddenError('Invalid request body');
    }

    const isPublishing = req.body.status === AnnouncementStatus.PUBLISHED;

    logger.info(
      {
        traceId,
        associationId: association.id,
        title: req.body.title,
        status: req.body.status,
        isPublishing,
      },
      'POST /api/announcements - Creating announcement',
    );

    const announcement = await createAnnouncement({
      associationId: association.id,
      authorId: user.id,
      data: req.body,
      sendNotification: isPublishing, // Assuming notifications only on publish
    });

    logger.info({ traceId, announcementId: announcement.id }, 'POST /api/announcements - Success');

    return success(res, { data: announcement }, 201);
  }),
];
