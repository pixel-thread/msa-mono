import { getRetroactiveAffectedUsers } from '@feature/contributions/services/get-retroactive-affected-users';
import { RetroactiveAffectedUsersSchema } from '@feature/contributions/validators/retroactive.validator';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { buildPagination } from '@src/shared/utils/helper/build-pagination';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';

export const retroactiveAffectedUsersHandler: RequestHandler[] = [
  validate({ body: RetroactiveAffectedUsersSchema }),
  asyncHandler(async (req, res) => {
    await withRole(req, UserRole.FINANCE);
    const associationId = req.user!.associationId;
    const page = (req.query.page as any) || 1;

    const { records, total } = await getRetroactiveAffectedUsers(
      associationId,
      req.body,
      Number(page),
    );

    return success(res, {
      data: records,
      meta: buildPagination(total, Number(page)),
    });
  }),
];
