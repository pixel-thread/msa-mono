import { ForbiddenError } from '@errors';
import { findManyMeetings } from '@feature/meetings/services';
import { MeetingQuerySchema } from '@feature/meetings/validators/meetings';
import { validate } from '@lib/validate';
import { MeetingStatus, UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** GET /api/meetings - List all meetings for the association. */
export const getMeetings: RequestHandler[] = [
  validate({ query: MeetingQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    logger.info({ traceId, associationId: association.id }, 'GET /api/meetings - Request started');

    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id, role: user.role },
      'GET /api/meetings - User authorized',
    );

    const query = req.query as { page?: number; type?: string; status?: string };
    if (!query) throw new ForbiddenError('Invalid query parameters');

    const userId = req.user?.id as string;
    const { page, type, status } = query;

    if (hasHighRoleAccess(user.role)) {
      const result = await findManyMeetings({
        role: user.role,
        associationId: association.id,
        filters: { type, status } as any,
        pagination: { page: page ?? 1 },
      });
      logger.info({ traceId, count: result.meetings.length }, 'GET /api/meetings - Success');
      return success(res, { data: result.meetings, meta: result.pagination });
    }

    const result = await findManyMeetings({
      role: user.role,
      userId,
      associationId: association.id,
      filters: { status: MeetingStatus.SCHEDULED } as any,
      pagination: { page: page ?? 1 },
    });
    logger.info({ traceId, count: result.meetings.length }, 'GET /api/meetings - Success');
    return success(res, { data: result.meetings, meta: result.pagination });
  }),
];
