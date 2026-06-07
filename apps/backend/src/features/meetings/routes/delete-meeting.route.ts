import { ForbiddenError } from '@errors';
import { deleteMeeting } from '@feature/meetings/services';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';

/** DELETE /api/meetings/[meetingId] - Delete a meeting. */
export const deleteMeetingHandler: RequestHandler[] = [
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: req.user!.associationId },
      'DELETE /api/meetings/[meetingId] - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    if (!hasHighRoleAccess(user.role)) {
      throw new ForbiddenError('Only secretary, president, or super admin can delete meetings');
    }

    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'DELETE /api/meetings/[meetingId] - User authorized',
    );
    logger.info({ traceId, meetingId }, 'DELETE /api/meetings/[meetingId] - Deleting meeting');

    const deletedMeeting = await deleteMeeting({
      meetingId,
      associationId: req.user!.associationId,
    });

    logger.info(
      { traceId, meetingId: deletedMeeting.id },
      'DELETE /api/meetings/[meetingId] - Success',
    );
    return success(res, { data: deletedMeeting, message: 'Meeting deleted successfully' });
  }),
];
