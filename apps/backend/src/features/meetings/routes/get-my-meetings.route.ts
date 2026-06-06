import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';
import { validate } from '@lib/validate';
import { success } from '@utils/responses';
import { UserRole } from '@prisma/client';
import { findManyMeetings } from '@feature/meetings/services';
import { pageNumberValidation } from '@src/shared/validators/common';
import { logger } from '@src/shared/logger';
import { z } from 'zod';
import { getAssociation } from '@services/association/get-association';
import { withRole } from '@utils/with-role';
import { asyncHandler } from '@utils/async-handler';

const QuerySchema = z.object({
  page: pageNumberValidation,
});

/** GET /api/meetings/my - Get meetings assigned to the current user. */
export const getMyMeetings: RequestHandler[] = [
  validate({ query: QuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/meetings/my - Request started',
    );

    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id, role: user.role },
      'GET /api/meetings/my - User authorized',
    );

    const userId = req.user?.id as string;
    const page = (req.query as any)?.page || 1;

    const { meetings, pagination } = await findManyMeetings({
      associationId: association.id,
      userId,
      role: user.role,
      pagination: { page },
    });

    logger.info({ traceId, count: meetings.length }, 'GET /api/meetings/my - Success');
    return success(res, { data: meetings, meta: pagination });
  }),
];
