import { updateMeeting } from '@feature/meetings/services/updateMeeting';
import { MeetingStatus, UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';

/** POST /api/meetings/[meetingId]/notice - Issue a notice for a meeting. */
export const postIssueNotice: RequestHandler[] = [
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/meetings/[meetingId]/notice - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);

    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'POST /api/meetings/[meetingId]/notice - User authorized',
    );
    logger.info({ traceId, meetingId }, 'POST /api/meetings/[meetingId]/notice - Issuing notice');

    const meeting = await updateMeeting({
      meetingId,
      associationId: req.user!.associationId,
      data: {
        status: MeetingStatus.NOTICE_ISSUED,
        noticeIssuedAt: new Date(),
      },
    });

    logger.info(
      { traceId, meetingId: meeting.id },
      'POST /api/meetings/[meetingId]/notice - Success',
    );
    return success(res, { data: meeting });
  }),
];
