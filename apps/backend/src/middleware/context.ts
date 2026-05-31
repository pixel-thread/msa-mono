import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { ContextStore } from '@src/shared/lib/tracing/context';

/**
 * Middleware to initialize the AsyncLocalStorage context for each request.
 * Sets a unique requestId by default.
 */
export function contextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  
  // Also attach to request object for compatibility with existing trace-id middleware if needed
  req.traceId = requestId;

  ContextStore.run(
    {
      requestId,
    },
    () => {
      next();
    },
  );
}
