# Backend Architecture Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align project documentation (GEMINI.md, PRD, rules) with the actual Express 5 backend implementation, removing all Next.js/Clerk references.

**Architecture:** domain-driven feature structure (`src/features/`), centralized context via `AsyncLocalStorage`, and custom JWT authentication.

**Tech Stack:** Express 5, Prisma, PostgreSQL, Zod, jose (JWT), bcryptjs.

---

### Task 1: Update GEMINI.md

**Files:**
- Modify: `.agents/GEMINI.md`

- [ ] **Step 1: Replace Next.js rules with Express patterns**

Update the "Route Definitions" section to show Express `RequestHandler` arrays and the `success()` helper.

```ts
// src/features/training/routes/create-module.route.ts
export const postCreateModule: RequestHandler[] = [
  validate({ body: CreateModuleSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await withRole(req, UserRole.DPO);
    const result = await createModule({ 
      associationId: user.associationId, 
      body: req.body 
    });
    return success(res, { data: result }, 201);
  }),
];
```

- [ ] **Step 2: Update directory structure map**

Change the architecture overview to reflect the current `src/` layout.

```
src/
├── features/     ← Feature modules (domain logic)
├── middleware/   ← Global Express middlewares
├── shared/       ← Cross-cutting infrastructure
├── env.ts        ← Environment variable validation (t3-env)
└── index.ts      ← Express App Entry Point
```

- [ ] **Step 3: Commit documentation changes**

```bash
git add .agents/GEMINI.md
git commit -m "docs: align GEMINI.md with Express backend architecture"
```

### Task 2: Update Core PRD

**Files:**
- Modify: `.agents/prd/core_prd.md`

- [ ] **Step 1: Update stack and version**

Change version to 3.0.0 and update the stack table.

- [ ] **Step 2: Replace Clerk references with Custom JWT**

Update the "Authentication" section to describe the `/api/auth` routes using `jose` and `bcryptjs`.

- [ ] **Step 3: Commit PRD changes**

```bash
git add .agents/prd/core_prd.md
git commit -m "docs: update core PRD to version 3.0.0 (Express/Custom Auth)"
```

### Task 3: Align Rules and Skills

**Files:**
- Modify: `.agents/rules/backend/index.md`
- Modify: `.agents/rules/frontend/index.md`

- [ ] **Step 1: Update backend rules**

Change API path to `src/features/*/routes/` and mandatory scoping to `associationId` in services.

- [ ] **Step 2: Deprecate frontend rules**

Mark the frontend rules file as DEPRECATED for this repository.

- [ ] **Step 3: Commit rules changes**

```bash
git add .agents/rules/
git commit -m "docs: align backend rules and deprecate frontend rules"
```

### Task 4: Final Verification

- [ ] **Step 1: Verify all documentation matches existing implementation**

Check `src/features/auth/routes/sign-in.route.ts` against the new `GEMINI.md` patterns.

- [ ] **Step 2: Check for any remaining Next.js/Clerk strings**

Run: `grep -r "Next.js" .agents` and `grep -r "Clerk" .agents`
Expected: No matches (except for deprecation notes if any).

- [ ] **Step 3: Commit final plan record**

```bash
git add docs/superpowers/specs/2026-05-31-backend-architecture-alignment-design.md
git commit -m "docs: finalize architecture alignment design"
```
