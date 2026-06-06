import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';
import { validate } from '@lib/validate';
import { success } from '@utils/responses';
import { ForbiddenError } from '@errors';
import { UserRole } from '@prisma/client';
import { assignAttendee } from '@feature/meetings/services';
import { AssignAttendeeSchema } from '@feature/meetings/validators';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { logger } from '@src/shared/logger';
import { z } from 'zod';
import { getAssociation } from '@services/association/get-association';
import { withRole } from '@utils/with-role';
import { asyncHandler } from '@utils/async-handler';

const MeetingParamsSchema = z.object({
  meetingId: z.string('Invalid meeting ID'),
});

/** POST /api/meetings/[meetingId]/attendees - Assign an attendee to a meeting. */
export const postAddAttendee: RequestHandler[] = [
  validate({ params: MeetingParamsSchema, body: AssignAttendeeSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: association.id },
      'POST /api/meetings/[meetingId]/attendees - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    if (!hasHighRoleAccess(user.role)) {
      throw new ForbiddenError('Only secretary, president, or super admin can assign attendees');
    }

    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'POST /api/meetings/[meetingId]/attendees - User authorized',
    );
    logger.info(
      { traceId, meetingId, attendeeUserId: req.body.userId },
      'POST /api/meetings/[meetingId]/attendees - Assigning attendee',
    );

    const attendee = await assignAttendee({
      meetingId,
      associationId: association.id,
      userId: req.body.userId,
      attendeeRole: req.body.attendeeRole,
    });

    logger.info({ traceId, meetingId }, 'POST /api/meetings/[meetingId]/attendees - Success');
    return success(res, { data: attendee }, 201);
  }),
];
