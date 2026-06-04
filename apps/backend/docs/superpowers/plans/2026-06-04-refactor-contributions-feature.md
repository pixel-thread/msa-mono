# Refactor Contributions into Dedicated Feature Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all contribution-related logic (routes, services, types, validators) from `src/features/payments/` to `src/features/contributions/` to improve domain isolation.

**Architecture:** Following the standard feature module structure (`routes/`, `services/`, `types/`, `validators/`). Relocating files and updating imports to ensure the system remains functional and adheres to SOLID principles.

**Tech Stack:** Express, TypeScript, Prisma, Zod.

---

### Task 1: Migrate Contribution Services

**Files:**
- Create: `src/features/contributions/services/contribution.service.ts`
- Create: `src/features/contributions/services/find-contribution-periods.ts`
- Create: `src/features/contributions/services/find-unique-contribution-period.ts`
- Create: `src/features/contributions/services/index.ts`
- Modify: `src/features/payments/services/index.ts`

- [ ] **Step 1: Move service files**
Move following files from `src/features/payments/services/` to `src/features/contributions/services/` (with kebab-case naming):
- `contribution.service.ts` -> `contribution.service.ts`
- `findContributionPeriods.ts` -> `find-contribution-periods.ts`
- `findUniqueContributionPeriod.ts` -> `find-unique-contribution-period.ts`

- [ ] **Step 2: Update internal service imports**
Update imports within the moved files to use appropriate paths (e.g., from `@src/features/payments/types` to the new types location if they were moved, or keeping them if they stay).

- [ ] **Step 3: Setup contributions service index**
Create `src/features/contributions/services/index.ts` and export the moved services.

- [ ] **Step 4: Cleanup payments service index**
Remove references to the moved services from `src/features/payments/services/index.ts`.

- [ ] **Step 5: Commit**
```bash
git add src/features/contributions/services src/features/payments/services/index.ts
git commit -m "refactor(contributions): move contribution services"
```

---

### Task 2: Migrate Contribution Validators and Types

**Files:**
- Create: `src/features/contributions/validators/contribution.validator.ts`
- Create: `src/features/contributions/validators/index.ts`
- Create: `src/features/contributions/types/index.ts`
- Modify: `src/features/payments/validators/index.ts`
- Modify: `src/features/payments/types/index.ts`

- [ ] **Step 1: Extract and move validators**
Create `src/features/contributions/validators/contribution.validator.ts` and move:
- `GenerateUserContributionsSchema`
- `GenerateContributionsSchema`
- `WaiveContributionSchema`
- `UserContributionsParamsSchema`
- `ContributionReportQuerySchema` (if applicable)

- [ ] **Step 2: Setup contributions validator index**
Create `src/features/contributions/validators/index.ts` and export the schemas.

- [ ] **Step 3: Extract and move types**
Create `src/features/contributions/types/index.ts` and move:
- `ContributionPeriod`
- `ContributionSummary`
- `UserContributionData`

- [ ] **Step 4: Update payments validators/types index**
Remove the moved items from `src/features/payments/validators/index.ts` and `src/features/payments/types/index.ts`. If they are needed as re-exports for backward compatibility (optional), do it; otherwise, remove.

- [ ] **Step 5: Commit**
```bash
git add src/features/contributions/validators src/features/contributions/types src/features/payments/validators/index.ts src/features/payments/types/index.ts
git commit -m "refactor(contributions): move contribution validators and types"
```

---

### Task 3: Migrate and Refactor Routes

**Files:**
- Create: `src/features/contributions/routes/contributions.route.ts`
- Create: `src/features/contributions/routes/user-contributions.route.ts`
- Modify: `src/features/contributions/routes/index.ts`
- Modify: `src/features/payments/routes/index.ts`
- Modify: `src/features/payments/routes/user-payments.route.ts`

- [ ] **Step 1: Move main contributions route handler**
Move `src/features/payments/routes/contributions.route.ts` to `src/features/contributions/routes/contributions.route.ts` and update imports.

- [ ] **Step 2: Move user-specific contributions route handler**
Extract `userContributions` from `src/features/payments/routes/user-payments.route.ts` into `src/features/contributions/routes/user-contributions.route.ts`.

- [ ] **Step 3: Update contributions route index**
Modify `src/features/contributions/routes/index.ts` to include the new routes:
- `GET /contributions` (listContributions)
- `POST /contributions` (generateContributions)
- `PATCH /contributions` (waiveContributionHandler)
- `GET /contributions/:contributionId` (getContribution)
- `GET /users/:userId` (userContributions) - Note: check if this prefix makes sense in contributions feature.
- `POST /users/:userId` (generateUserContributionsHandler)

- [ ] **Step 4: Cleanup payments route index**
Remove contribution-related routes from `src/features/payments/routes/index.ts`.

- [ ] **Step 5: Commit**
```bash
git add src/features/contributions/routes src/features/payments/routes/index.ts src/features/payments/routes/user-payments.route.ts
git commit -m "refactor(contributions): move contribution routes"
```

---

### Task 4: Global Import Fix and Cleanup

**Files:**
- Modify: Multiple files across the codebase

- [ ] **Step 1: Search for all remaining imports**
Search for imports targeting the old locations in `src/features/payments/` for contribution items.

- [ ] **Step 2: Update imports**
Update them to point to `src/features/contributions/`.

- [ ] **Step 3: Run Build**
Run `npm run build` or `tsc` to verify no broken imports.

- [ ] **Step 4: Run Tests**
Run `npm test` to ensure feature integrity.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "refactor(contributions): fix global imports and cleanup"
```
