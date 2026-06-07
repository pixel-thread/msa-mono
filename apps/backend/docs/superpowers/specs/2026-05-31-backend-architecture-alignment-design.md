# Design: Backend Architecture Alignment (Express Migration)

**Status:** APPROVED
**Date:** 2026-05-31
**Author:** Gemini CLI

## 1. Purpose

The backend was originally conceived as a Next.js project but has been implemented as a standalone Express 5 API. This design formalizes the alignment of project documentation (GEMINI.md, PRDs, and Skills) with the actual implementation to ensure consistent agent behavior and developer onboarding.

## 2. Technical Stack (Actual)

| Layer          | Choice                       |
| :------------- | :--------------------------- |
| **Runtime**    | Node.js (>= 22)              |
| **Framework**  | Express 5                    |
| **Language**   | TypeScript (Strict)          |
| **Database**   | PostgreSQL                   |
| **ORM**        | Prisma                       |
| **Auth**       | Custom JWT (jose) + Bcryptjs |
| **Validation** | Zod                          |
| **Logging**    | Pino                         |

## 3. Core Architectural Patterns

### 3.1 Feature-Based Modularization

Instead of framework-driven folders (like Next.js `app/`), the project follows a domain-driven "Features" structure in `src/features/`.

- `routes/`: Express routers and handlers.
- `services/`: Business logic and Prisma access.
- `validators/`: Zod schemas.

### 3.2 Security & Multi-Tenancy

- **Context Injection**: Uses `AsyncLocalStorage` (`ContextStore`) to track `traceId`, `userId`, and `associationId` throughout the request lifecycle.
- **RBAC**: A centralized hierarchy enforced via `withRole()` utility.
- **Data Isolation**: Multi-tenancy enforced at the service layer by always including `associationId` in Prisma queries.

## 4. Documentation Changes

### 4.1 GEMINI.md

- Removed all React, Hooks, and Next.js specific rules.
- Added Express handler patterns (asyncHandler, validate middleware).
- Updated directory structure map to reflect `src/features`, `src/middleware`, and `src/shared`.
- Formalized kebab-case naming for all backend files.

### 4.2 Core PRD

- Incremented version to 3.0.0.
- Replaced Next.js/Clerk references with Express/Custom JWT.
- Aligned "Information Architecture" with API route hierarchy instead of frontend pages.

## 5. Verification Plan

- [x] Verify `GEMINI.md` matches existing file patterns in `src/features/auth/routes/`.
- [x] Verify `core_prd.md` stack matches `package.json`.
- [x] Ensure path aliases in `tsconfig.json` are reflected in `GEMINI.md`.

---
