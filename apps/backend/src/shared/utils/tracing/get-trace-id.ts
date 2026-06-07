import { ContextStore } from '@lib/tracing/context';
import type { Request } from 'express';

/**
 * Retrieves the trace ID for the current request.
 * Prefers ContextStore, then falls back to req.traceId, headers, or a new UUID.
 */
export const getTraceId = (request?: Request): string => {
  // 1. Try ContextStore
  const contextId = ContextStore.getByKey('requestId');
  if (contextId) return contextId;

  // 2. Try request object if provided
  if (request?.traceId) return request.traceId;

  // 3. Try headers or new UUID
  return (
    (request?.headers['x-trace-id'] as string) ||
    (request?.headers['x-request-id'] as string) ||
    crypto.randomUUID()
  );
};
