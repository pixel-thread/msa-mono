import { updateMeetingMinute } from '@feature/meetings/services/minutes';
import { UpdateMeetingMinuteSchema } from '@feature/meetings/validators/minutes';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { MinuteParamsSchema } from '@feature/meetings/validators';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** PATCH /api/meetings/[meetingId]/minutes/[minutesId] - Update a meeting minute. */
export const patchUpdateMinute: RequestHandler[] = [
  validate({ params: MinuteParamsSchema, body: UpdateMeetingMinuteSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    const minutesId = req.params.minutesId as string;
    logger.info(
      { traceId, meetingId, minutesId, associationId: req.user!.associationId },
      'PATCH /api/meetings/[meetingId]/minutes/[minutesId] - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId, minutesId },
      'PATCH /api/meetings/[meetingId]/minutes/[minutesId] - User authorized',
    );
    logger.info(
      { traceId, meetingId, minutesId },
      'PATCH /api/meetings/[meetingId]/minutes/[minutesId] - Updating meeting minute',
    );

    const minute = await updateMeetingMinute({
      meetingId,
      minuteId: minutesId,
      associationId: req.user!.associationId,
      data: req.body,
    });

    logger.info(
      { traceId, meetingId, minutesId },
      'PATCH /api/meetings/[meetingId]/minutes/[minutesId] - Success',
    );
    return success(res, { data: minute, message: 'Meeting minute updated successfully' });
  }),
];
