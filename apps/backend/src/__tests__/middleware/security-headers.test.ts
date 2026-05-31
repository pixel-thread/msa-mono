import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { securityHeaders } from '@src/middleware/security-headers';

describe('Security Headers Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      setHeader: jest.fn().mockReturnThis(),
      removeHeader: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should set security headers using helmet', () => {
    // helmet middleware is a function
    (securityHeaders as any)(req as Request, res as Response, next);

    // Helmet v8+ may use specific case for headers
    
    // X-Content-Type-Options
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options (configured with action: 'deny')
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');

    // Verify CSP
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("default-src 'self'")
    );

    // Referrer-Policy
    expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');

    expect(next).toHaveBeenCalled();
  });
});
