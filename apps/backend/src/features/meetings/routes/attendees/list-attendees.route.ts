import { ForbiddenError } from '@errors';
import { findUniqueMeeting } from '@feature/meetings/services';
import { MeetingQuerySchema } from '@feature/meetings/validators';
import { MeetingParamsSchema } from '@feature/meetings/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';

/** GET /api/meetings/[meetingId]/attendees - List all attendees for a meeting. */
export const getAttendees: RequestHandler[] = [
  validate({ params: MeetingParamsSchema, query: MeetingQuerySchema }),
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: req.user!.associationId },
      'GET /api/meetings/[meetingId]/attendees - Request started',
    );

    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'GET /api/meetings/[meetingId]/attendees - User authorized',
    );

    const meeting = await findUniqueMeeting({ meetingId, associationId: req.user!.associationId });

    if (!hasHighRoleAccess(user.role)) {
      const myAttendance = meeting.attendees.find(
        (a: { user: { id: string } }) => a.user.id === user.id,
      );
      if (!myAttendance) {
        throw new ForbiddenError('You are not assigned to this meeting');
      }
    }

    logger.info(
      { traceId, meetingId: meeting.id, attendeeCount: meeting.attendees.length },
      'GET /api/meetings/[meetingId]/attendees - Success',
    );
    return success(res, { data: meeting.attendees });
  }),
];
