import { ForbiddenError } from '@errors';
import { removeAttendee, updateAttendee } from '@feature/meetings/services';
import { UpdateAttendeeSchema } from '@feature/meetings/validators';
import { AttendeeParamsSchema } from '@feature/meetings/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** PATCH /api/meetings/[meetingId]/attendees/[userId] - Update an attendee's role or RSVP. */
export const patchUpdateAttendee: RequestHandler[] = [
  validate({ params: AttendeeParamsSchema, body: UpdateAttendeeSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    const targetUserId = req.params.userId as string;
    logger.info(
      { traceId, meetingId, targetUserId, associationId: req.user!.associationId },
      'PATCH /api/meetings/[meetingId]/attendees/[userId] - Request started',
    );

    const user = await withRole(req, UserRole.MEMBER);
    const requestingUserId = req.user?.id as string;

    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId, targetUserId },
      'PATCH /api/meetings/[meetingId]/attendees/[userId] - User authorized',
    );

    const isAdmin = hasHighRoleAccess(user.role);
    const isSelfUpdate = targetUserId === requestingUserId;

    if (!isAdmin && !isSelfUpdate) {
      throw new ForbiddenError('You can only update your own RSVP');
    }

    logger.info(
      { traceId, meetingId, targetUserId },
      'PATCH /api/meetings/[meetingId]/attendees/[userId] - Updating attendee',
    );

    const updated = await updateAttendee({
      meetingId,
      associationId: req.user!.associationId,
      userId: targetUserId,
      data: req.body,
      isAdminUpdate: isAdmin,
    });

    logger.info(
      { traceId, meetingId, targetUserId },
      'PATCH /api/meetings/[meetingId]/attendees/[userId] - Success',
    );
    return success(res, { data: updated });
  }),
];

/** DELETE /api/meetings/[meetingId]/attendees/[userId] - Remove an attendee from a meeting. */
export const deleteRemoveAttendee: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    const targetUserId = req.params.userId as string;
    logger.info(
      { traceId, meetingId, targetUserId, associationId: req.user!.associationId },
      'DELETE /api/meetings/[meetingId]/attendees/[userId] - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    if (!hasHighRoleAccess(user.role)) {
      throw new ForbiddenError('Only secretary, president, or super admin can remove attendees');
    }

    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId, targetUserId },
      'DELETE /api/meetings/[meetingId]/attendees/[userId] - User authorized',
    );
    logger.info(
      { traceId, meetingId, targetUserId },
      'DELETE /api/meetings/[meetingId]/attendees/[userId] - Removing attendee',
    );

    await removeAttendee({
      meetingId,
      associationId: req.user!.associationId,
      userId: targetUserId,
    });

    logger.info(
      { traceId, meetingId, targetUserId },
      'DELETE /api/meetings/[meetingId]/attendees/[userId] - Success',
    );
    return success(res, { data: { success: true }, message: 'Attendee removed successfully' });
  }),
];
