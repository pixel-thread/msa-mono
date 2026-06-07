import { UnauthorizedError } from '@errors';
import { prisma } from '@lib';
import { verifyAccessToken } from '@lib/jwt';
import { ContextStore } from '@lib/tracing/context';
import { API_PUBLIC_ROUTES } from '@src/shared/constants';
import type { NextFunction, Request, Response } from 'express';

export async function auth(req: Request, _res: Response, next: NextFunction) {
  const path = req.path;

  if (API_PUBLIC_ROUTES.some((r) => path === r)) {
    return next();
  }

  const token =
    req.cookies?.access_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : undefined);

  if (!token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return next(new UnauthorizedError('Invalid token'));
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { association: true },
  });

  if (!user) {
    return next(new UnauthorizedError('Invalid token'));
  }

  req.user = {
    id: user.id,
    roles: user.role,
    associationId: user.associationId,
    associationName: user.association.name,
    associationSlug: user.association.slug,
    memberTypeId: user.memberTypeId,
  };

  ContextStore.set('userId', user.id);
  ContextStore.set('associationId', user.associationId);
  ContextStore.set('role', user.role);

  next();
}
