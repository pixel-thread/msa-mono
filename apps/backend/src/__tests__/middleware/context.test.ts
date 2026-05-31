import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { contextMiddleware } from '@src/middleware/context';
import { ContextStore } from '@src/shared/lib/tracing/context';

describe('Context Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should initialize context with a requestId from headers if present', () => {
    req.headers = { 'x-request-id': 'test-request-id' };
    
    contextMiddleware(req as Request, res as Response, () => {
      const context = ContextStore.get();
      expect(context?.requestId).toBe('test-request-id');
      expect(req.traceId).toBe('test-request-id');
    });
  });

  it('should initialize context with a new requestId if not present in headers', () => {
    contextMiddleware(req as Request, res as Response, () => {
      const context = ContextStore.get();
      expect(context?.requestId).toBeDefined();
      expect(typeof context?.requestId).toBe('string');
      expect(req.traceId).toBe(context?.requestId);
    });
  });

  it('should call next()', () => {
    contextMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
