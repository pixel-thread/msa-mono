import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      traceId?: string;
      association?: {
        id: string;
        slug: string;
        name: string;
      };
      user: {
        id: string;
        memberTypeId?: string | null;
        role?: UserRole[];
        associationId?: string;
      };
      signal?: AbortSignal;
    }
  }
}

export {};
