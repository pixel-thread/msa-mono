import type { UserRole } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  roles: UserRole[];
  associationId: string;
  associationSlug: string;
  associationName: string;
  memberTypeId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      traceId?: string;

      user?: AuthenticatedUser;

      signal?: AbortSignal;
    }
  }
}

export {};
