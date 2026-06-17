# GEMINI.md — Project-Level AI Agent Rules

> **MANDATORY:** Every AI agent working on this codebase must read this file completely before performing any task. These rules are non-negotiable and apply to every file, every route, every component, and every service — without exception.

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
10. [Component Rules](#component-rules)
11. [Hook Rules](#hook-rules)
12. [Service Rules](#service-rules)
13. [Validation Rules](#validation-rules)
14. [State Management Rules](#state-management-rules)
15. [Import Rules](#import-rules)
16. [Performance Rules](#performance-rules)
17. [Documentation & JSDoc Rules](#documentation--jsdoc-rules)
18. [AI Agent Checklist](#ai-agent-checklist)
19. [Barrel Export Rules](#barrel-export-rules)

---

## Core Principles

These three principles override everything else. When in doubt, come back to them.

| #   | Principle                         | What it means in practice                                                                    |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | **Security First**                | OWASP Top 10 Every feature starts with threat modeling. No exceptions for "internal" routes. |
| 2   | **SOLID / Single Responsibility** | One file does one thing. Period. Split before you ship.                                      |
| 3   | **Kebab-Case Everywhere**         | All file names, folder names, and route segments use `kebab-case`.                           |

---

## Design Reference

> The `design-system-docs/` directory is the **single source of truth** for all UI and design decisions. Every component, page, and visual pattern must conform to the specifications defined there.

### Source of Truth

All design tokens, component specs, layout patterns, and interaction conventions are documented in `design-system-docs/`. The master index is `design-system-docs/design-system.json`.

| Concern | Document |
|---------|----------|
| Master index + philosophy | `design-system-docs/design-system.json` |
| Color tokens (48 total) | `design-system-docs/color-tokens.json` |
| Typography scale (14 text variants) | `design-system-docs/typography-scale.json` |
| Spacing conventions | `design-system-docs/spacing-scale.json` |
| Elevation & shadows | `design-system-docs/elevation-system.json` |
| Animation & motion | `design-system-docs/animation-system.json` |
| Component specs (30+ components) | `design-system-docs/component-patterns.md` |
| Layout & page structure | `design-system-docs/layout-patterns.md` |
| UX interaction patterns | `design-system-docs/interaction-patterns.md` |
| Dark mode strategy | `design-system-docs/dark-mode-system.md` |
| UI architecture & file structure | `design-system-docs/ui-architecture.md` |
| Mobile/React Native mapping | `design-system-docs/mobile-design-mapping.md` |

### Mandatory Rules

- **Read the relevant design doc before** implementing or modifying any UI component, page, layout, or visual pattern.
- **Verify output against design tokens**: color values, font sizes, spacing units, shadow definitions, animation durations — all must match `design-system-docs/`.
- **Strict visual adherence**:
  - Zero `border-radius` (`rounded-none`) on all UI components (exceptions: Avatar `rounded-full`, chart dots `rounded-[2px]`)
  - Uppercase + `tracking-wider` for all label-level text: buttons, badges, table headers, dropdown items, form labels, tabs, sidebar labels, toggles
  - Underline-style inputs (`border border-transparent border-b-input`) — only bottom border visible
  - Flat-with-shadow elevation: `shadow-sm ring-1 ring-foreground/5` for cards, `shadow-md ring-1 ring-foreground/10` for floating UI
  - CVA (class-variance-authority) for all variant-driven components
- **Component naming and patterns** must match the specifications in `component-patterns.md` — including variant tables, sizes, states, and repeated class combinations.
- **Page layouts** must follow the templates in `layout-patterns.md` (dashboard structure, data table page pattern, grid systems).
- **Interaction patterns** (loading, empty, error, success states, navigation, data entry, confirmation) must follow `interaction-patterns.md`.
- **Dark mode** must follow `dark-mode-system.md` — color inversion rules, component-specific adjustments, contrast handling.

### AI Agent Enforcement

Before completing any UI-related task:

- [ ] Read the relevant design doc(s) from `design-system-docs/`
- [ ] Color values match the token definitions in `color-tokens.json`
- [ ] Typography uses the correct variant from `typography-scale.json`
- [ ] Spacing/layout matches `layout-patterns.md` and `spacing-scale.json`
- [ ] Component props and styling match the spec in `component-patterns.md`
- [ ] Elevation, animation, and interaction patterns are correctly applied
- [ ] Dark mode is accounted for per `dark-mode-system.md`

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

- Every API route must validate its input (body, query, params) with a Zod schema via `withValidation()` or `withAssociation` before any business logic runs.
- Never trust client-supplied data. Validate shape, type, range, and allowlist values.
- Reject unknown fields — use Zod `.strict()` on all schemas unless explicitly justified.

**Authentication & Authorization**

- Every non-public route must call `withRole(request, minRole)` to enforce authorization.
- Use `withAssociation()` on every multi-tenant route to scope data to the correct association.
- Never derive authorization from client-sent headers alone. Always verify from the session.
- Role checks go in the route handler wrapper — never deep inside a service.

**Data Access**

- Always scope database queries to the authenticated user's association. Never return cross-tenant data.
- Prefer allowlists over denylists for field selection in Prisma queries.
- Never expose raw Prisma error messages to the client — map them to `ErrorResponse`.
- Use parameterized queries only. Never construct raw SQL strings.

**HTTP Security**

- All responses must pass through `withSecurityHeaders` middleware (CSP, HSTS, X-Content-Type-Options, X-Frame-Options).
- CORS policy is enforced by `withCors` — never override it inside a route.
- Rate limiting is enforced by `withRateLimiting` — never bypass it.
- Sensitive endpoints (auth, password reset, payment) must have their own stricter rate-limit tier.

**Error Handling**

- Never expose stack traces or internal error details to the client.
- Use `SuccessResponse` and `ErrorResponse` helpers exclusively — never return raw `Response` objects.
- Log full errors server-side; send minimal sanitized messages to the client.

**Secrets & Tokens**

- JWTs are validated server-side on every request. Never trust a client-decoded token.
- Session tokens must be `httpOnly`, `secure`, `sameSite=strict` cookies.
- Password hashing uses the utility in `shared/lib/crypto/` — never roll your own.

### Frontend Security

**XSS Prevention**

- Never use `dangerouslySetInnerHTML` unless the content is explicitly sanitized by a server-side allowlist and the usage is documented with a comment explaining why.
- Never interpolate raw user input into URL `href` attributes. Validate and sanitize all URLs.
- Always use React's JSX rendering (not string concatenation) for user-supplied content.

**Sensitive Data Handling**

- Never store tokens, passwords, or PII in `localStorage` or `sessionStorage`.
- Never log sensitive user data to the browser console in production.
- Use `httpOnly` cookies for session management — do not expose tokens to JavaScript.

**API Calls from the Frontend**

- Every API call from the frontend must go through the HTTP client in `shared/utils/http/`.
- Never construct API URLs by string concatenation. Use typed route constants.
- Always handle API errors explicitly — do not silently swallow rejections.

**Form Security**

- All user input rendered back to the screen must be treated as untrusted. Rely on React's automatic escaping.
- File upload inputs must validate type and size on the client and the server.

**Dependency Security**

- Do not add new npm dependencies without checking for known vulnerabilities (`npm audit`).
- Prefer well-maintained, minimal-dependency packages.
- Pin major versions in `package.json` for security-critical libraries (auth, crypto).

---

## SOLID Architecture Rules

> **One file. One responsibility. No exceptions.**

These rules apply to every layer: routes, services, hooks, components, stores, validators.

### S — Single Responsibility

- Each file must have exactly one reason to change.
- A service file does one operation (e.g., `create-module.ts`, `find-many-meetings.ts`).
- A component file renders one UI concern.
- A hook file encapsulates one piece of state or data-fetching logic.
- If a file is doing two things, split it into two files immediately.

**Good examples:**

```
features/training/services/create-module.ts     ← creates a module, nothing else
features/training/services/find-many-modules.ts ← reads modules, nothing else
features/training/hooks/use-training-modules.ts ← fetches + exposes module data
features/training/hooks/use-delete-module.ts    ← mutation for deletion only
```

**Bad examples — never do this:**

```
features/training/services/training.ts          ← CRUD all in one file — WRONG
features/training/hooks/use-training.ts         ← all training data/mutations — WRONG
```

### O — Open/Closed

- Shared utilities, wrappers, and middleware must be open for extension via composition, not modification.
- Adding a new route, middleware, or feature must not require modifying existing unrelated files.
- Use wrapper composition (`withValidation → withAssociation → withRole`) to extend behaviour without touching existing handlers.

### L — Liskov Substitution

- All `ErrorResponse` and `SuccessResponse` usages must be interchangeable regardless of route or feature.
- Service functions must honour their declared TypeScript signatures. No unexpected `undefined` returns.

### I — Interface Segregation

- Zod schemas and TypeScript types must be scoped narrowly.
- Do not create a single "mega schema" for multiple operations. Each operation gets its own schema:
  ```
  validators/create-module.validator.ts
  validators/update-module.validator.ts
  validators/list-modules.validator.ts
  ```
- Types must not force callers to depend on fields they do not use.

### D — Dependency Inversion

- Business logic in services must not directly import framework-specific modules (e.g., `next/headers`, `next/request`).
- Services receive their dependencies as arguments (Prisma client, config, etc.) rather than importing globals directly where possible.
- Shared infrastructure (Prisma, Redis, Supabase, Resend) is accessed only through the wrappers in `shared/lib/`.

---

## Naming Conventions

### File and Folder Names — `kebab-case` (MANDATORY)

Every file and every folder in the project uses `kebab-case`. No exceptions.

```
✅ create-module.ts
✅ find-many-meetings.ts
✅ use-training-modules.ts
✅ meeting-query.validator.ts
✅ audit-log.service.ts

❌ createModule.ts          ← camelCase — FORBIDDEN for file names
❌ FindManyMeetings.ts      ← PascalCase — FORBIDDEN for file names
❌ trainingModules.ts       ← FORBIDDEN
```

### React Components — `kebab-case.tsx` (file name), `PascalCase` (export)

```
✅ training-list-page.tsx (export: TrainingListPage)
✅ create-module-dialog.tsx (export: CreateModuleDialog)
✅ meetings-table.tsx (export: MeetingsTable)
```

### Hooks — `camelCase` with `use` prefix

```
✅ useTrainingModules.ts
✅ useMeetings.ts
✅ useDeleteModule.ts
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

### Types — `PascalCase` interface/type names, `kebab-case` file names

```
File:   features/training/types/index.ts
Export: export interface TrainingModule { ... }
```

### Constants — `SCREAMING_SNAKE_CASE` values, `kebab-case` file names

```
File:   shared/constants/routes.ts
Export: export const ADMIN_ROUTES = [...]
```

### API Route Segments — `kebab-case`

```
✅ /api/training-modules
✅ /api/membership-applications
✅ /api/audit-logs

❌ /api/trainingModules
❌ /api/membershipApplications
```

### Summary Table

| Item                        | Convention             | Example                            |
| --------------------------- | ---------------------- | ---------------------------------- |
| Folders                     | `kebab-case`           | `membership-applications/`         |
| Non-component files         | `kebab-case`           | `create-module.ts`                 |
| React component files       | `kebab-case.tsx`       | `training-list-page.tsx`               |
| React component exports     | `PascalCase`           | `export function TrainingListPage` |
| Hooks (file + export)       | `camelCase` with `use` | `useTrainingModules`               |
| Service functions           | `camelCase`            | `createModule()`                   |
| Zod schemas                 | `PascalCase`           | `CreateModuleSchema`               |
| TypeScript types/interfaces | `PascalCase`           | `TrainingModule`                   |
| Constants                   | `SCREAMING_SNAKE_CASE` | `ADMIN_ROUTES`                     |
| Route segments              | `kebab-case`           | `/api/training-modules`            |
| Prisma model names          | `PascalCase`           | `TrainingModule`                   |
| Prisma field names          | `camelCase`            | `createdAt`, `associationId`       |

---

## Architecture Overview

**Framework:** Next.js 16 App Router · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Prisma ORM · Supabase · Redis (Upstash) · Zustand · TanStack React Query · Zod

```
src/
├── app/          ← Next.js App Router (routes + API handlers — thin wrappers only)
├── features/     ← Feature modules (all domain logic lives here)
├── shared/       ← Cross-cutting infrastructure (18 subdirectories)
├── env.ts        ← Environment variable validation (t3-env) — source of truth
└── proxy.ts      ← Middleware chain definition
```

### Path Aliases

| Alias           | Resolves to                 |
| --------------- | --------------------------- |
| `@src/*`        | `./src/*`                   |
| `@feature/*`    | `./src/features/*`          |
| `@components/*` | `./src/shared/components/*` |
| `@hooks/*`      | `./src/shared/hooks/*`      |
| `@utils/*`      | `./src/shared/utils/*`      |
| `@lib/*`        | `./src/shared/lib/*`        |
| `@validator/*`  | `./src/shared/validators/*` |
| `@sharedType/*` | `./src/shared/types/*`      |
| `@store/*`      | `./src/shared/stores/*`     |
| `@errors/*`     | `./src/shared/errors/*`     |
| `@config/*`     | `./src/shared/config/*`     |

Always use these aliases. Never use relative paths that traverse more than one directory level.

---

## Feature Module Structure

Every feature lives in `src/features/<feature-name>/` using `kebab-case` for the folder name.

```
src/features/<feature-name>/
├── pages/           ← Page-level components (exported via index.ts)
├── components/      ← Feature-specific UI components (one component per file)
├── hooks/           ← TanStack Query wrappers + custom hooks (one concern per hook)
├── services/        ← Server-side business logic (one operation per file)
├── types/           ← Feature-specific TypeScript types (index.ts barrel)
├── validators/      ← Zod schemas (one schema per operation per file)
├── store/           ← Zustand store slice (only if feature needs local client state)
└── utils/           ← Feature-specific utilities and constants
```

**Rules:**

- Each layer is optional — only create directories that the feature actually uses.
- Pages are thin: they import from `pages/` and render. No logic.
- Services are the only layer allowed to touch Prisma, Redis, Supabase, or Resend.
- Hooks are the only layer allowed to call services indirectly (via API) from the client.
- No cross-feature imports. Features communicate only through shared services or the API layer.

**Current features (19):**
`announcement` · `associations` · `audit-logs` · `auth` · `compliance` · `consent` · `cron` · `dsar` · `ledger` · `meetings` · `member-type` · `members` · `membership-applications` · `payments` · `subscriptions` · `swagger` · `training` · `user`

---

## Shared Directory Structure

`src/shared/` contains infrastructure used across features. Never put feature-specific logic here.

| Subdirectory     | Contents                                                                              | Rules                                                                          |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `components/`    | Shared UI components (`app-sidebar`, `data-table`, `dashboard-layout`)                | One component per file                                                         |
| `components/ui/` | shadcn/ui primitives only                                                             | Never add business logic here                                                  |
| `config/`        | `app.config.ts`                                                                       | One config key = one concern                                                   |
| `constants/`     | Route constants, nav items, roles, regex, endpoints                                   | Immutable, exported as `const`                                                 |
| `errors/`        | Error classes: `base.ts`, `http-errors.ts`, `normalize-unknown-error.ts`              | Extend, never modify base                                                      |
| `hooks/`         | Truly shared hooks (e.g., `use-mobile.ts`)                                            | Must have zero feature-specific knowledge                                      |
| `lib/`           | Infrastructure: Prisma, Redis, Supabase, Resend, JWT, crypto, cache, password-hashing | All infra access goes through these — never import Prisma directly in features |
| `logger/`        | Structured logger                                                                     | Use this exclusively — no `console.log` in production paths                    |
| `middleware/`    | Middleware modules + chain                                                            | Add new middleware here and register in `proxy.ts`                             |
| `providers/`     | React context providers                                                               | One provider per file                                                          |
| `services/`      | Shared services: `audit-logs`, `notification`, `user`, `logs`                         | Cross-feature only                                                             |
| `stores/`        | Zustand stores: `auth/`                                                               | Feature stores stay in `features/<name>/store/`                                |
| `styles/`        | Theme CSS                                                                             | No component-specific styles here                                              |
| `types/`         | Shared TypeScript types: `api.types`, `auth.types`, `notification.ts`                 | Cross-feature only                                                             |
| `utils/`         | Utilities: `build-pagination`, `format`, `http` client, response helpers, tracing     | One utility function per file                                                  |
| `validators/`    | Shared Zod schemas: `common`, `logs`, `notification`                                  | Cross-feature only                                                             |

---

## Component Rules

- **One component per file.** No exceptions.
- Component file names use `kebab-case.tsx`.
- Shared reusable UI → `shared/components/`.
- Feature-specific UI → `features/<name>/components/`.
- shadcn/ui primitives → `shared/components/ui/` only (never modified directly).
- Page-level components → `features/<name>/pages/` exported via `index.ts` barrel.
- Components are presentation-focused. Business logic belongs in hooks and services.
- No direct Prisma/Redis/Supabase imports inside components.
- No API calls directly inside components — always delegate to hooks.
- All user-displayed text that originates from the server must be treated as untrusted.

---

## Hook Rules

- File names use `camelCase` with the `use` prefix: `useTrainingModules.ts`.
- One hook = one data/state concern. Split if a hook is doing two distinct things.
- Hooks in `features/<name>/hooks/` → feature-scoped.
- Hooks in `shared/hooks/` → cross-feature, no feature-specific knowledge.
- Encapsulate all TanStack Query logic (query keys, fetcher, options) inside the hook.
- Never mix data fetching and unrelated side effects in one hook.
- Expose only what the component needs — do not leak internal query state.

---

## Service Rules

- File names use `kebab-case`. One operation per file.
- One service file = one business operation (create, update, delete, find, etc.).
- Services handle: Prisma queries, Redis, Supabase, Resend, and business rule enforcement.
- Services are framework-agnostic — no Next.js imports (`next/headers`, `next/request`).
- Services receive dependencies as function arguments, not module-level imports where possible.
- Always scope database queries by `associationId` to enforce multi-tenancy.
- Never expose raw database errors. Catch, log, and re-throw as typed application errors.
- Feature services → `features/<name>/services/`.
- Shared services → `shared/services/`.

---

## Validation Rules

example

```
features/training/validators/
├── create-module.validator.ts    ← CreateModuleSchema
├── update-module.validator.ts    ← UpdateModuleSchema
└── list-modules.validator.ts     ← ListModulesQuerySchema
```

- Schemas use `.strict()` to reject unknown fields unless explicitly documented otherwise.
- Shared cross-feature schemas go in `shared/validators/`.
- Validator files follow `kebab-case` naming: `create-module.validator.ts`.

---

## State Management Rules

| State type            | Where it lives                      | How it's accessed                     |
| --------------------- | ----------------------------------- | ------------------------------------- |
| Server state          | TanStack React Query                | Hooks in `features/<name>/hooks/`     |
| Global client state   | Zustand in `shared/stores/`         | Imported via `@store/*` alias         |
| Feature client state  | Zustand in `features/<name>/store/` | Feature-scoped, not exported globally |
| Component-local state | `useState` / `useReducer`           | Inside the component only             |

- Prefer server state (TanStack Query) over client state for anything that comes from the API.
- Zustand stores are split by domain — one store slice per concern.
- Never store sensitive data (tokens, PII) in client-side state.
- Never put derived data into a store if it can be computed from existing store/query state.

---

## Import Rules

- Always use path aliases (`@src/*`, `@feature/*`, `@components/*`, etc.) over relative paths.
- Never use `../../` relative imports that traverse feature boundaries.
- Features must not import from other features. Use `shared/` for cross-cutting concerns.
- Circular dependencies are forbidden. If a circular dep appears, extract the shared logic to `shared/`.
- Barrel exports (`index.ts`) are used only at feature page and component boundaries — not deep inside a feature.

---

## Barrel Export Rules

- Every folder MUST contain an `index.ts` file.
- `index.ts` must export all public modules inside that folder.
- Imports should prefer folder-level exports instead of deep file imports.
- Deep imports across feature internals are forbidden unless explicitly required.
- Barrel exports define the public API of a folder — anything not exported is internal.
- Do not export private/internal implementation details.
- No circular exports through `index.ts` files.

### Example

```

features/training/components/
training-card.tsx
training-table.tsx
index.ts

```

```ts
// index.ts
export * from './training-card';
export * from './training-table';
```

### Rule

- If a folder exists → it must have `index.ts` (even if empty initially).

## Performance Rules

- Use TanStack Query caching as the primary strategy for avoiding redundant server calls.
- Never use `useEffect` to fetch data — use TanStack Query hooks instead.
- Lazy-load heavy components with `React.lazy` + `Suspense` where appropriate.
- Avoid unnecessary re-renders: use `useMemo` / `useCallback` only when profiling confirms a need, not preemptively.
- Do not import entire libraries when a single function is needed (e.g., import `{ debounce }` from `lodash-es`, not the whole library).

---

## Documentation & JSDoc Rules

> All code written or modified by AI agents must include clear, accurate, and maintainable JSDoc documentation.

### General Rules

- Every exported function, class, hook, middleware, service, utility, and React component must include JSDoc.
- Any existing code modified by the agent must have its JSDoc updated to reflect the new behavior.
- JSDoc must describe:
  - Purpose/responsibility
  - Parameters
  - Return values
  - Side effects
  - Security-sensitive behavior where applicable
- Do not write redundant comments that merely repeat TypeScript types.
- Comments must explain intent and business reasoning, not obvious syntax.
- Private/internal helper functions should include JSDoc if the logic is non-trivial.

### Required Targets

The following always require JSDoc:

| Target                                 | Required |
| -------------------------------------- | -------- |
| API route handlers                     | ✅       |
| Middleware                             | ✅       |
| Services                               | ✅       |
| Hooks                                  | ✅       |
| Shared utilities                       | ✅       |
| Prisma access functions                | ✅       |
| Security/auth logic                    | ✅       |
| Complex React components               | ✅       |
| Zustand stores                         | ✅       |
| Validation schemas with business rules | ✅       |

### React Component Documentation

React component JSDoc must explain:

- What the component renders
- Its responsibility
- Important props
- State or side-effect behavior if non-obvious

Example:

```ts
/**
 * Displays a searchable list of association members.
 * Handles debounced member search and member selection state.
 */
export function MemberCombobox() {}
```

### Service Documentation

Service JSDoc must explain:

- Business operation
- Tenant scoping requirements
- Authorization assumptions
- External dependencies used
- Possible thrown errors

Example:

```ts
/**
 * Creates a new training module for an association.
 *
 * Requires:
 * - Authenticated user
 * - Association-scoped access
 * - DPO role or higher
 *
 * Throws:
 * - ConflictError when module already exists
 * - ValidationError when input is invalid
 */
export async function createModule() {}
```

### Security Documentation

Security-sensitive code must explicitly document:

- Authentication assumptions
- Authorization enforcement
- Trusted/untrusted inputs
- Header manipulation
- Token validation
- Sensitive side effects

Example:

```ts
/**
 * Validates the access token and injects trusted user context
 * into downstream request headers.
 *
 * Security:
 * - Removes spoofable incoming auth headers
 * - Verifies JWT signature server-side
 * - Never trusts client-supplied identity headers
 */
```

### Forbidden Documentation Patterns

- Do not add meaningless comments:

  ```ts
  // increment i
  i++;
  ```

- Do not write outdated or speculative comments.
- Do not copy-paste incorrect JSDoc templates.
- Do not document obvious TypeScript inference only.

### AI Agent Enforcement

Before completing any task, AI agents must verify:

- [ ] All new exported functions include JSDoc.
- [ ] Modified functions have updated JSDoc.
- [ ] Security-sensitive logic is documented.
- [ ] Complex business rules are explained.
- [ ] Comments describe intent, not syntax.
- [ ] No stale or misleading comments exist.

## AI Agent Checklist

Before submitting any code change, verify every item in this list:

### Security

- [ ] No secrets or credentials in source files.
- [ ] No sensitive data in logs or error responses sent to the client.
- [ ] All new environment variables declared in `src/env.ts`.
- [ ] Every new API route uses `withValidation`, `withAssociation`, and `withRole`.
- [ ] Database queries are scoped by `associationId`.
- [ ] No `dangerouslySetInnerHTML` without documented sanitization.
- [ ] No tokens or PII stored in `localStorage` / `sessionStorage`.

### SOLID / Single Responsibility

- [ ] Each new file has exactly one reason to change.
- [ ] No service file mixes multiple operations.
- [ ] No hook file fetches unrelated data.
- [ ] No component contains business logic.

### Naming

- [ ] All new folders and non-component files use `kebab-case`.
- [ ] All new React component files use `kebab-case.tsx`.
- [ ] All new hooks start with `use`.
- [ ] All new API route segments use `kebab-case`.
- [ ] New route added to the correct constant in `shared/constants/routes.ts`.

### Structure

- [ ] Feature logic lives inside `features/<name>/`, not in `app/` or `shared/`.
- [ ] `app/` files are thin wrappers only — no business logic.
- [ ] Shared infrastructure accessed only through `shared/lib/`.
- [ ] Middleware chain not bypassed or reordered without justification.

### Validation

- [ ] New Zod schemas are one-schema-per-file and use `.strict()`.
- [ ] All schemas live in `features/<name>/validators/` or `shared/validators/`.

### Imports

- [ ] All imports use path aliases.
- [ ] No cross-feature direct imports.
- [ ] No circular dependencies introduced.

### Documentation

- [ ] All new exported functions/components/hooks/services include JSDoc.
- [ ] Modified code has updated documentation.
- [ ] Security-sensitive logic includes security notes.
- [ ] No stale or misleading comments introduced.

---
