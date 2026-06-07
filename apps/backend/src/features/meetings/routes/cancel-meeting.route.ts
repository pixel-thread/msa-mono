import { ForbiddenError } from '@errors';
import { updateMeeting } from '@feature/meetings/services';
import { MeetingStatus, UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';

/** @@ POST /api/meetings/[meetingId]/cancel - Cancel a meeting. */
export const postCancelMeeting: RequestHandler[] = [
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/meetings/[meetingId]/cancel - Request started',
    );

    const user = await withRole(req, UserRole.PRESIDENT);
    if (!hasHighRoleAccess(user.role)) {
      throw new ForbiddenError('Only president or super admin can cancel meetings');
    }

    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'POST /api/meetings/[meetingId]/cancel - User authorized',
    );
    logger.info(
      { traceId, meetingId },
      'POST /api/meetings/[meetingId]/cancel - Cancelling meeting',
    );

    const meeting = await updateMeeting({
      meetingId,
      associationId: req.user!.associationId,
      data: { status: MeetingStatus.CANCELLED },
    });

    logger.info(
      { traceId, meetingId: meeting.id },
      'POST /api/meetings/[meetingId]/cancel - Success',
    );
    return success(res, { data: meeting });
  }),
];
