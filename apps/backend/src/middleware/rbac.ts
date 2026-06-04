import type { RequestHandler } from 'express';
import { UserRole } from '@prisma/client';

import { ForbiddenError } from '@src/shared/errors';
import { asyncHandler } from '@src/shared/utils/async-handler';

export function requireRole(...roles: UserRole[]): RequestHandler {
  return asyncHandler(async (req, _res, next) => {
    const role = req?.user?.roles;
    if (!role || !roles.some((r) => role.includes(r))) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  });
}
