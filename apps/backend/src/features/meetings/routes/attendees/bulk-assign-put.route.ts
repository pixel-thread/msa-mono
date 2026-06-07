import { ForbiddenError } from '@errors';
import { bulkAssignAttendees } from '@feature/meetings/services';
import { BulkAssignAttendeesSchema } from '@feature/meetings/validators';
import { MeetingParamsSchema } from '@feature/meetings/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** PUT /api/meetings/[meetingId]/attendees - Bulk replace attendees for a meeting. */
export const putBulkAssignAttendees: RequestHandler[] = [
  validate({ params: MeetingParamsSchema, body: BulkAssignAttendeesSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: req.user!.associationId },
      'PUT /api/meetings/[meetingId]/attendees - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    if (!hasHighRoleAccess(user.role)) {
      throw new ForbiddenError(
        'Only secretary, president, or super admin can bulk assign attendees',
      );
    }

    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'PUT /api/meetings/[meetingId]/attendees - User authorized',
    );
    logger.info(
      { traceId, meetingId },
      'PUT /api/meetings/[meetingId]/attendees - Bulk assigning attendees',
    );

    const result = await bulkAssignAttendees({
      meetingId,
      associationId: req.user!.associationId,
      userIds: req.body.userIds,
      attendeeRole: req.body.attendeeRole,
    });

    logger.info(
      { traceId, meetingId, assigned: result.assigned.length, skipped: result.skipped.length },
      'PUT /api/meetings/[meetingId]/attendees - Success',
    );
    return success(res, {
      data: result,
      message: `Assigned ${result.assigned.length} attendees, skipped ${result.skipped.length} existing`,
    });
  }),
];
