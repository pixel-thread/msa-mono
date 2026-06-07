# GEMINI.md — Project-Level AI Agent Rules

> **MANDATORY:** Every AI agent working on this codebase must read this file completely before performing any task. These rules are non-negotiable and apply to every file, every route, and every service — without exception.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Security-First Rules](#security-first-rules)
3. [SOLID Architecture Rules](#solid-architecture-rules)
4. [Naming Conventions](#naming-conventions)
5. [Architecture Overview](#architecture-overview)
6. [Feature Module Structure](#feature-module-structure)
7. [Shared Directory Structure](#shared-directory-structure)
8. [Route Definitions](#route-definitions)
9. [Middleware Pipeline](#middleware-pipeline)
10. [Data Flow](#data-flow)
11. [Service Rules](#service-rules)
12. [Validation Rules](#validation-rules)
13. [API Rules](#api-rules)
14. [Prisma / Database Rules](#prisma--database-rules)
15. [Import Rules](#import-rules)
16. [Documentation & JSDoc Rules](#documentation--jsdoc-rules)
17. [AI Agent Checklist](#ai-agent-checklist)
18. [Barrel Export Rules](#barrel-export-rules)

---

## Core Principles

These three principles override everything else. When in doubt, come back to them.

| #   | Principle                         | What it means in practice                                                                    |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | **Security First**                | OWASP Top 10 Every feature starts with threat modeling. No exceptions for "internal" routes. |
| 2   | **SOLID / Single Responsibility** | One file does one thing. Period. Split before you ship.                                      |
| 3   | **Kebab-Case Everywhere**         | All file names, folder names, and route segments use `kebab-case`.                           |

---

## Security-First Rules

> AI agents must apply these rules **before writing any code**. Security is not an afterthought.

### General

- Never hardcode secrets, API keys, tokens, or credentials anywhere in source files.
- Never log sensitive data: passwords, tokens, PII, card numbers, session IDs.
- All environment variables must be declared and validated in `src/env.ts` using `t3-env`. Unknown variables must cause a startup failure.
- Any new environment variable must be added to `src/env.ts` before it is used anywhere.

### Backend Security

**Input Validation**

- Every API route must validate its input (body, query, params) with a Zod schema via `validate()` middleware before any business logic runs.
- Never trust client-supplied data. Validate shape, type, range, and allowlist values.
- Reject unknown fields — use Zod `.strict()` on all schemas unless explicitly justified.

**Authentication & Authorization**

- Every non-public route must be protected by the `auth` middleware.
- Use `withRole(req, minRole)` utility inside handlers to enforce granular authorization.
- Never derive authorization from client-sent headers alone. Always verify from the session/JWT.

**Data Access**

- Always scope database queries to the authenticated user's association. Never return cross-tenant data.
- Prefer allowlists over denylists for field selection in Prisma queries.
- Never expose raw Prisma error messages to the client.
- Use parameterized queries only. Never construct raw SQL strings.

**HTTP Security**

- All responses must pass through `securityHeaders` middleware (CSP, HSTS, X-Content-Type-Options, X-Frame-Options).
- CORS policy is enforced by `cors` middleware — never override it inside a route.
- Rate limiting is enforced by `rateLimiter` — never bypass it.

**Error Handling**

- Never expose stack traces or internal error details to the client.
- Use `success()` and `error()` response helpers exclusively.
- Log full errors server-side via `logger`; send minimal sanitized messages to the client.

**Secrets & Tokens**

- JWTs are validated server-side on every request. Never trust a client-decoded token.
- Session tokens must be `httpOnly`, `secure`, `sameSite=strict` cookies (where applicable).

---

## SOLID Architecture Rules

> **One file. One responsibility. No exceptions.**

These rules apply to every layer: routes, services, handlers, validators.

### S — Single Responsibility

- Each file must have exactly one reason to change.
- A service file should ideally handle one operation (e.g., `create-module.ts`).
- If a file is doing too many distinct things, split it immediately.

### O — Open/Closed

- Shared utilities, wrappers, and middleware must be open for extension via composition, not modification.
- Adding a new route, middleware, or feature must not require modifying existing unrelated files.

### D — Dependency Inversion

- Business logic in services must not directly import framework-specific modules.
- Shared infrastructure (Prisma, Redis, Supabase, Resend) is accessed only through the wrappers in `shared/lib/`.

---

## Naming Conventions

### File and Folder Names — `kebab-case` (MANDATORY)

Every file and every folder in the project uses `kebab-case`. No exceptions.

```
✅ create-module.ts
✅ find-many-meetings.ts
✅ meeting-query.validator.ts
✅ audit-log.service.ts
```

### Route Handler Functions — `camelCase` with method prefix

```
File:   features/auth/routes/sign-in.route.ts
Export: export const postSignIn: RequestHandler[] = [...]
```

### Services — `kebab-case` file, `camelCase` exported function

```
File:   features/training/services/create-module.ts
Export: export async function createModule(...)
```

### Validators — `kebab-case` file, `PascalCase` Zod schema export

```
File:   features/training/validators/create-module.validator.ts
Export: export const CreateModuleSchema = z.object({...})
```

### Summary Table

| Item                        | Convention             | Example                      |
| --------------------------- | ---------------------- | ---------------------------- |
| Folders                     | `kebab-case`           | `membership-applications/`   |
| Files                       | `kebab-case`           | `create-module.ts`           |
| Service functions           | `camelCase`            | `createModule()`             |
| Zod schemas                 | `PascalCase`           | `CreateModuleSchema`         |
| TypeScript types/interfaces | `PascalCase`           | `TrainingModule`             |
| Constants                   | `SCREAMING_SNAKE_CASE` | `ADMIN_ROUTES`               |
| Route segments              | `kebab-case`           | `/api/v1/training-modules`   |
| Prisma model names          | `PascalCase`           | `User`                       |
| Prisma field names          | `camelCase`            | `createdAt`, `associationId` |

---

## Architecture Overview

**Framework:** Express 5 · TypeScript strict · Prisma ORM · Supabase · Redis (Upstash) · Zod

```
src/
├── features/     ← Feature modules (domain logic)
├── middleware/   ← Global Express middlewares
├── shared/       ← Cross-cutting infrastructure
├── env.ts        ← Environment variable validation (t3-env)
└── index.ts      ← Express App Entry Point & Route Registration
```

### Path Aliases

| Alias           | Resolves to                 |
| --------------- | --------------------------- |
| `@src/*`        | `./src/*`                   |
| `@feature/*`    | `./src/features/*`          |
| `@middleware/*` | `./src/middleware/*`        |
| `@utils/*`      | `./src/shared/utils/*`      |
| `@lib/*`        | `./src/shared/lib/*`        |
| `@validator/*`  | `./src/shared/validators/*` |
| `@sharedType/*` | `./src/shared/types/*`      |
| `@errors/*`     | `./src/shared/errors/*`     |

---

## Feature Module Structure

Every feature lives in `src/features/<feature-name>/` using `kebab-case`.

```
src/features/<feature-name>/
├── routes/          ← Express route handlers (exported via index.ts)
├── services/        ← Server-side business logic
├── types/           ← Feature-specific TypeScript types
├── validators/      ← Zod schemas
└── utils/           ← Feature-specific utilities
```

---

## Shared Directory Structure

`src/shared/` contains infrastructure used across features.

| Subdirectory | Contents                                           |
| ------------ | -------------------------------------------------- |
| `constants/` | Route constants, roles, regex                      |
| `errors/`    | Error classes (`UnauthorizedError`, etc.)          |
| `lib/`       | Infrastructure wrappers (Prisma, Redis, JWT, etc.) |
| `logger/`    | Structured logger (Pino)                           |
| `services/`  | Cross-feature services                             |
| `types/`     | Shared TypeScript types                            |
| `utils/`     | Shared helpers (Response, async-handler, etc.)     |

---

## Route Definitions

### API Route Handlers

Route handlers must be thin. Logic delegated to services.

```ts
// src/features/training/routes/create-module.route.ts
export const postCreateModule: RequestHandler[] = [
  validate({ body: CreateModuleSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await withRole(req, UserRole.DPO);
    const result = await createModule({
      associationId: user.associationId,
      body: req.body,
    });
    return success(res, { data: result }, 201);
  }),
];
```

**Pattern:**

1. Use `validate()` middleware for Zod validation.
2. Use `asyncHandler()` to wrap async logic.
3. Check roles via `withRole()` or middleware.
4. Call feature service.
5. Return via `success()` helper.

---

## Middleware Pipeline

Registered in `src/index.ts`.

**Order:**

1. `cors`
2. `contextMiddleware`
3. `securityHeaders`
4. `cookieParser`
5. `express.json`
6. `rateLimiter`
7. Feature Routes
8. `errorHandler`

---

## Service Rules

- File names use `kebab-case`.
- One service file = one business operation (where practical).
- Services handle: Prisma queries, external APIs, business rules.
- Services must be framework-agnostic (don't pass `req` or `res`).
- Always scope database queries by `associationId`.

---

## Validation Rules

- Use `validate()` from `@lib/validate` on all routes.
- Schemas use `.strict()` to reject unknown fields.
- One validator file per operation preferred.

---

## API Rules

- Use `success()` and `error()` helpers from `@utils/responses`.
- Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Error).

---

## Prisma / Database Rules

- All Prisma access goes through `shared/lib/prisma`.
- Filter association-owned data by `associationId`.
- Prefer `select` over returning full models.

---

## Documentation & JSDoc Rules

- Every exported function and service MUST include JSDoc.
- Describe purpose, params, and return values.

---

## AI Agent Checklist

- [ ] No secrets in source files.
- [ ] Every route uses `validate()`.
- [ ] Database queries scoped by `associationId`.
- [ ] All new files use `kebab-case`.
- [ ] Shared infrastructure accessed via `shared/lib/`.
- [ ] All exported functions include JSDoc.
- [ ] Conventional Commits used for all changes.

---
