import { Request, Response, NextFunction } from 'express';
import { ContextStore } from '@src/shared/lib/tracing/context';
import crypto from 'node:crypto';

export function contextMiddleware(req: Request, res: Response, next: NextFunction) {
  ContextStore.run({ requestId: crypto.randomUUID() }, () => {
    next();
  });
}
