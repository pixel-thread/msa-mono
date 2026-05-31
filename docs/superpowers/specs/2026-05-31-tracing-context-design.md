# Tracing Context Design

**Purpose:** Implement `AsyncLocalStorage` (ALS) for request-scoped tracing context.
**Status:** Approved

## Design
1. **Infrastructure**: `src/shared/lib/tracing/context.ts` defines the `ContextStore` using `AsyncLocalStorage`.
2. **Middleware**: `src/middleware/context.ts` initializes the context with a unique `requestId` for every request.
3. **Integration**:
   - Register `contextMiddleware` as the first middleware in the pipeline.
   - Update `src/middleware/auth.ts` to populate the `userId` in the context upon successful authentication.

## Security & Principles
- **Isolation**: Context is scoped to the request execution.
- **Least Privilege**: Only the auth middleware is authorized to set the `userId`.
- **Naming**: Consistent with project `kebab-case` conventions.
