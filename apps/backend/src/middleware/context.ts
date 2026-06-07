import { ContextStore } from '@lib/tracing/context';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

/**
 * Middleware to initialize the AsyncLocalStorage context for each request.
 * Sets a unique traceId by default.
 */
export function contextMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId =
    (req.headers['x-trace-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    randomUUID();

  // Also attach to request object for compatibility
  req.traceId = requestId;

  // Set the response header
  res.setHeader('x-trace-id', requestId);

  ContextStore.run({ requestId }, () => {
    next();
  });
}
