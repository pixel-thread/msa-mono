import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { auth } from '@src/middleware/auth';
import { ContextStore } from '@src/shared/lib/tracing/context';
import { prisma } from '@src/shared/lib';
import { verifyAccessToken } from '@src/shared/lib/jwt';

jest.mock('@src/shared/lib/jwt');
jest.mock('@src/shared/lib', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Auth Middleware - Context Integration', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      path: '/api/v1/protected',
      headers: { authorization: 'Bearer valid-token' },
      cookies: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should set userId and associationId in ContextStore after successful auth', async () => {
    const mockUser = {
      id: 'user-123',
      associationId: 'assoc-456',
      role: ['MEMBER'],
      memberTypeId: 'mt-789',
    };

    (verifyAccessToken as jest.Mock).mockResolvedValue({ sub: 'user-123' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    // We need to run this within a ContextStore context
    await ContextStore.run({ requestId: 'test-trace-id' }, async () => {
      await auth(req as Request, res as Response, next as NextFunction);

      expect(ContextStore.getByKey('userId')).toBe('user-123');
      expect(ContextStore.getByKey('associationId')).toBe('assoc-456');
    });

    expect(next).toHaveBeenCalledWith();
  });
});
