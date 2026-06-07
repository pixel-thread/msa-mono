import { ForbiddenError } from '@errors';
import { updateMeeting } from '@feature/meetings/services';
import { MeetingParamsSchema, UpdateMeetingSchema } from '@feature/meetings/validators/meetings';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** PATCH /api/meetings/[meetingId] - Update a meeting. */
export const patchUpdateMeeting: RequestHandler[] = [
  validate({ params: MeetingParamsSchema, body: UpdateMeetingSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: req.user!.associationId },
      'PATCH /api/meetings/[meetingId] - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    if (!hasHighRoleAccess(user.role)) {
      throw new ForbiddenError('Only secretary, president, or super admin can update meetings');
    }

    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'PATCH /api/meetings/[meetingId] - User authorized',
    );
    logger.info({ traceId, meetingId }, 'PATCH /api/meetings/[meetingId] - Updating meeting');

    const updateData: Record<string, unknown> = { ...req.body };
    if (req.body?.scheduledAt) {
      updateData.scheduledAt = new Date(req.body.scheduledAt);
    }

    const meeting = await updateMeeting({
      meetingId,
      associationId: req.user!.associationId,
      data: updateData as Parameters<typeof updateMeeting>[0]['data'],
    });

    logger.info({ traceId, meetingId: meeting.id }, 'PATCH /api/meetings/[meetingId] - Success');
    return success(res, { data: meeting });
  }),
];
