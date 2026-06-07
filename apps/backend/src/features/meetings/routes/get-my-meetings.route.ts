import { findManyMeetings } from '@feature/meetings/services';
import { MeetingQuerySchema } from '@feature/meetings/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** GET /api/meetings/my - Get meetings assigned to the current user. */
export const getMyMeetings: RequestHandler[] = [
  validate({ query: MeetingQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    logger.info(
      { traceId, associationId: req.user!.associationId },
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
      associationId: req.user!.associationId,
      userId,
      role: user.role,
      pagination: { page },
    });

    logger.info({ traceId, count: meetings.length }, 'GET /api/meetings/my - Success');
    return success(res, { data: meetings, meta: pagination });
  }),
];
