import { getMeetingMinuites } from '@feature/meetings/services/minutes';
import { MeetingParamsSchema } from '@feature/meetings/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** GET /api/meetings/[meetingId]/minutes - List all minutes for a meeting. */
export const getMinutes: RequestHandler[] = [
  validate({ params: MeetingParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: req.user!.associationId },
      'GET /api/meetings/[meetingId]/minutes - Request started',
    );

    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'GET /api/meetings/[meetingId]/minutes - User authorized',
    );

    const minutes = await getMeetingMinuites({ where: { meetingId } });

    logger.info(
      { traceId, meetingId, count: minutes.length },
      'GET /api/meetings/[meetingId]/minutes - Success',
    );
    return success(res, { data: minutes, message: 'Meeting minutes fetch successfully' });
  }),
];
