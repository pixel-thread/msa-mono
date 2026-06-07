import { deleteMeetingMinute } from '@feature/meetings/services/minutes';
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { NextFunction, Request, RequestHandler,Response } from 'express';

/** DELETE /api/meetings/[meetingId]/minutes/[minutesId] - Delete a meeting minute. */
export const deleteMinute: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    const meetingId = req.params.meetingId as string;
    const minutesId = req.params.minutesId as string;
    logger.info(
      { traceId, meetingId, minutesId, associationId: association.id },
      'DELETE /api/meetings/[meetingId]/minutes/[minutesId] - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId, minutesId },
      'DELETE /api/meetings/[meetingId]/minutes/[minutesId] - User authorized',
    );
    logger.info(
      { traceId, meetingId, minutesId },
      'DELETE /api/meetings/[meetingId]/minutes/[minutesId] - Deleting meeting minute',
    );

    const deletedMinute = await deleteMeetingMinute({
      where: { id: minutesId, meetingId },
    });

    logger.info(
      { traceId, meetingId, minutesId },
      'DELETE /api/meetings/[meetingId]/minutes/[minutesId] - Success',
    );
    return success(res, { data: deletedMinute, message: 'Meeting minute deleted successfully' });
  }),
];
