# Implement Context Middleware Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `contextMiddleware` to initialize `AsyncLocalStorage` context for each request.

**Architecture:** Create an Express middleware that generates or uses a `requestId`, attaches it to the request object, and runs the rest of the request chain within the `ContextStore`'s `AsyncLocalStorage` context.

**Tech Stack:** Node.js, Express, AsyncLocalStorage, Jest.

---

### Task 1: Setup Test for Context Middleware

**Files:**

- Create: `src/__tests__/middleware/context.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { contextMiddleware } from '@src/middleware/context';
import { ContextStore } from '@lib/tracing/context';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/__tests__/middleware/context.test.ts`
Expected: FAIL (Module not found or contextMiddleware is not a function)

### Task 2: Implement Context Middleware

**Files:**

- Create: `src/middleware/context.ts`

- [ ] **Step 1: Write implementation**

```typescript
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { ContextStore } from '@lib/tracing/context';

/**
 * Middleware to initialize the AsyncLocalStorage context for each request.
 * Sets a unique requestId by default.
 */
export function contextMiddleware(req: Request, _res: Response, next: NextFunction) {
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
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm test src/__tests__/middleware/context.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/middleware/context.ts src/__tests__/middleware/context.test.ts
git commit -m "feat: implement contextMiddleware to initialize AsyncLocalStorage context"
```

### Task 3: Final Verification and Self-Review

- [ ] **Step 1: Verify build**

Run: `pnpm build`
Expected: SUCCESS

- [ ] **Step 2: Self-review**
      Confirm it follows GEMINI.md standards (naming, kebab-case, exports).
      Confirm it matches the requested Task 2 description.
