import { ForbiddenError } from '@errors';
import { findUniqueMeeting } from '@feature/meetings/services';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';

const MeetingParamsSchema = z.object({
  meetingId: z.string('Invalid meeting ID'),
});

/** GET /api/meetings/[meetingId] - Get details of a single meeting. */
export const getMeeting: RequestHandler[] = [
  validate({ params: MeetingParamsSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: association.id },
      'GET /api/meetings/[meetingId] - Request started',
    );

    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id, role: user.role },
      'GET /api/meetings/[meetingId] - User authorized',
    );

    const userId = req.user?.id as string;

    const meeting = await findUniqueMeeting({ meetingId, associationId: association.id });

    if (!hasHighRoleAccess(user.role)) {
      const isAttendee = meeting.attendees.some(
        (a: { user: { id: string } }) => a.user.id === userId,
      );
      if (!isAttendee) {
        throw new ForbiddenError('You are not assigned to this meeting');
      }
    }

    logger.info({ traceId, meetingId: meeting.id }, 'GET /api/meetings/[meetingId] - Success');
    return success(res, { data: meeting });
  }),
];
