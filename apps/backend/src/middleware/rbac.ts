import { ForbiddenError } from '@errors';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '@utils/async-handler';
import type { RequestHandler } from 'express';

export function rbac(...roles: UserRole[]): RequestHandler {
  return asyncHandler(async (req, _res, next) => {
    const role = req?.user?.roles;
    if (!role || !roles.some((r) => role.includes(r))) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  });
}
