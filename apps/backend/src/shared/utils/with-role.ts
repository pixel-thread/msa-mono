import type { UserRole } from '@prisma/client';
import { findUniqueUser } from '@services/user/get-unique-user';
import type { Request } from 'express';

import { ROLE_HIERARCHY } from '../constants';
import { ForbiddenError, UnauthorizedError } from '../errors';

export async function withRole(req: Request, role: UserRole) {
  const userId = req?.user?.id;

  if (!userId) throw new UnauthorizedError('Unauthorized');

  const user = await findUniqueUser({ where: { id: userId } });

  if (!user) throw new UnauthorizedError('Unauthorized');

  const roles = user.role as UserRole[];

  const highestUserRole = roles.reduce((highest, current) =>
    ROLE_HIERARCHY[current] < ROLE_HIERARCHY[highest] ? current : highest,
  );

  const hasPermission = ROLE_HIERARCHY[highestUserRole] <= ROLE_HIERARCHY[role];

  if (!hasPermission) throw new ForbiddenError('Permission denied');

  return { ...user, role: roles };
}
