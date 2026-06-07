import { findUniqueMeeting } from '@feature/meetings/services';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { MeetingParamsSchema } from '@feature/meetings/validators';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** GET /api/meetings/[meetingId]/agenda - List all agenda items for a meeting. */
export const getAgendaItems: RequestHandler[] = [
  validate({ params: MeetingParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: req.user!.associationId },
      'GET /api/meetings/[meetingId]/agenda - Request started',
    );

    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'GET /api/meetings/[meetingId]/agenda - User authorized',
    );

    const meeting = await findUniqueMeeting({ meetingId, associationId: req.user!.associationId });
    const agenda = meeting.agendaItems;

    logger.info(
      { traceId, meetingId: meeting.id },
      'GET /api/meetings/[meetingId]/agenda - Success',
    );
    return success(res, { data: agenda });
  }),
];
