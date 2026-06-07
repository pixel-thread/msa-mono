import { findUniqueMeeting } from '@feature/meetings/services/findUniqueMeeting';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** GET /api/meetings/[meetingId]/report - Generate a meeting report. */
export const getMeetingReport: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const user = await withRole(req, UserRole.SECRETARY);

    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'GET /api/meetings/[meetingId]/report - User authorized',
    );
    logger.info(
      { traceId, meetingId },
      'GET /api/meetings/[meetingId]/report - Fetching meeting report',
    );

    const meeting = await findUniqueMeeting({ meetingId, associationId: req.user!.associationId });

    logger.info(
      { traceId, meetingId: meeting.id },
      'GET /api/meetings/[meetingId]/report - Success',
    );
    return success(res, { data: meeting });
  }),
];
