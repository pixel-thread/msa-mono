import { bulkAssignAttendees } from '@feature/meetings/services/bulkAssignAttendees';
import { BulkAssignAttendeesSchema } from '@feature/meetings/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** POST /api/meetings/[meetingId]/attendees/bulk - Bulk assign attendees to a meeting. */
export const postBulkAssignAttendees: RequestHandler[] = [
  validate({ body: BulkAssignAttendeesSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/meetings/[meetingId]/attendees/bulk - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'POST /api/meetings/[meetingId]/attendees/bulk - User authorized',
    );
    logger.info(
      { traceId, meetingId },
      'POST /api/meetings/[meetingId]/attendees/bulk - Bulk assigning attendees',
    );

    await bulkAssignAttendees({
      meetingId,
      associationId: req.user!.associationId,
      userIds: req.body.userIds,
    });

    logger.info({ traceId, meetingId }, 'POST /api/meetings/[meetingId]/attendees/bulk - Success');
    return success(res, { data: null, message: 'Bulk assignment successful' });
  }),
];
