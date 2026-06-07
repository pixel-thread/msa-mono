# Refactor Contributions into Dedicated Feature Feature Implementation Plan

**Status:** COMPLETE
**Archived:** 2026-06-04
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

- [x] **Step 1: Move service files**
- [x] **Step 2: Update internal service imports**
- [x] **Step 3: Setup contributions service index**
- [x] **Step 4: Cleanup payments service index**
- [x] **Step 5: Commit**

---

### Task 2: Migrate Contribution Validators and Types

**Files:**

- Create: `src/features/contributions/validators/contribution.validator.ts`
- Create: `src/features/contributions/validators/index.ts`
- Create: `src/features/contributions/types/index.ts`
- Modify: `src/features/payments/validators/index.ts`
- Modify: `src/features/payments/types/index.ts`

- [x] **Step 1: Extract and move validators**
- [x] **Step 2: Setup contributions validator index**
- [x] **Step 3: Extract and move types**
- [x] **Step 4: Update payments validators/types index**
- [x] **Step 5: Commit**

---

### Task 3: Migrate and Refactor Routes

**Files:**

- Create: `src/features/contributions/routes/contributions.route.ts`
- Create: `src/features/contributions/routes/user-contributions.route.ts`
- Modify: `src/features/contributions/routes/index.ts`
- Modify: `src/features/payments/routes/index.ts`
- Modify: `src/features/payments/routes/user-payments.route.ts`

- [x] **Step 1: Move main contributions route handler**
- [x] **Step 2: Move user-specific contributions route handler**
- [x] **Step 3: Update contributions route index**
- [x] **Step 4: Cleanup payments route index**
- [x] **Step 5: Commit**

---

### Task 4: Global Import Fix and Cleanup

**Files:**

- Modify: Multiple files across the codebase

- [x] **Step 1: Search for all remaining imports**
- [x] **Step 2: Update imports**
- [x] **Step 3: Run Build**
- [x] **Step 4: Run Tests**
- [x] **Step 5: Commit**
