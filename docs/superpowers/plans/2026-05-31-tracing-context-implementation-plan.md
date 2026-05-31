# Tracing Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `AsyncLocalStorage` to manage request-scoped tracing context in the backend.

**Architecture:** Create a `ContextStore` shared utility using Node.js `AsyncLocalStorage`. Initialize this context in a new middleware (`context.ts`) and populate it within the authentication flow.

**Tech Stack:** Node.js, `node:async_hooks`, Express.

---

### Task 1: Create Context Store Utility

**Files:**
- Create: `src/shared/lib/tracing/context.ts`

- [ ] **Step 1: Write context store**

```ts
import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
  requestId: string;
  userId?: string;
};

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const ContextStore = {
  run<T>(context: RequestContext, callback: () => T) {
    return asyncLocalStorage.run(context, callback);
  },
  get() {
    return asyncLocalStorage.getStore();
  },
  set<K extends keyof RequestContext>(key: K, value: RequestContext[K]) {
    const store = asyncLocalStorage.getStore();
    if (!store) throw new Error('No async context found');
    store[key] = value;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/lib/tracing/context.ts
git commit -m "feat: add AsyncLocalStorage context store"
```

---

### Task 2: Create Context Middleware

**Files:**
- Create: `src/middleware/context.ts`

- [ ] **Step 1: Write middleware**

```ts
import { Request, Response, NextFunction } from 'express';
import { ContextStore } from '@src/shared/lib/tracing/context';
import crypto from 'node:crypto';

export function contextMiddleware(req: Request, res: Response, next: NextFunction) {
  ContextStore.run({ requestId: crypto.randomUUID() }, () => {
    next();
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware/context.ts
git commit -m "feat: add context middleware"
```

---

### Task 3: Integrate Middleware and Auth

**Files:**
- Modify: `src/index.ts`
- Modify: `src/middleware/auth.ts`

- [ ] **Step 1: Register middleware in `src/index.ts`**

Locate app setup and add:
```ts
import { contextMiddleware } from './middleware/context';
// ...
app.use(contextMiddleware);
```

- [ ] **Step 2: Update `src/middleware/auth.ts` to set userId**

```ts
import { ContextStore } from '@src/shared/lib/tracing/context';
// ... inside the auth middleware ...
ContextStore.set('userId', userId);
```

- [ ] **Step 3: Commit**

```bash
git add src/index.ts src/middleware/auth.ts
git commit -m "feat: integrate context middleware and auth"
```
