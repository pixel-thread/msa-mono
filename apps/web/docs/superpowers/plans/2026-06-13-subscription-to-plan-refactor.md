# Subscription-to-Plan Refactor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the user subscription system (`Subscription`, `SubscriptionBillingHistory`, subscribe/change/waive flows) while keeping plan management (`Plan` + `PlanVersion`) as contribution rate templates. Rename everything from "subscription" to "plan" and migrate contribution generation to derive amounts from member-type-based plan assignment.

**Architecture:** Plans define contribution rates per member type. When contribution periods are generated, each user's expected amount is determined by the plan associated with their member type (falling back to the association's default plan). No user-level subscription exists — users contribute based on their member type's plan. Waiver moves from subscription-level to contribution-period-level (already exists).

**Tech Stack:** Prisma (PostgreSQL), Express.js, TanStack Router, React, React Query, Zod

---

## File Map

**Before refactor, the affected files across 3 packages:**

**Database (Prisma):**

- `apps/backend/prisma/schema/subscription.prisma` — 4 models to rename/remove
- `apps/backend/prisma/schema/user.prisma` — remove `subscription` relation
- `apps/backend/prisma/schema/member.prisma` — rename `subscriptionPlans` → `plans`
- `apps/backend/prisma/schema/association.prisma` — rename `subscriptionPlans` → `plans`
- `apps/backend/prisma/schema/contribution.prisma` — add `waivedBy` field
- `apps/backend/prisma/schema/enums.prisma` — remove `SUBSCRIPTION` from `PaymentType`, keep `SUBSCRIPTION_CHANGE` in `AuditAction`

**Shared packages:**

- `packages/shared/src/constants/endpoints/subscriptions.ts` — rename to `plans.ts`
- `packages/shared/src/constants/endpoints/index.ts` — update import
- `packages/shared/src/constants/query-keys/subscriptions.ts` — rename to `plans.ts`
- `packages/shared/src/constants/query-keys/index.ts` — update import
- `packages/shared/src/constants/endpoints/cron.ts` — remove `SUBSCRIPTION_EXPIRY`

**Backend plans feature (renamed from subscriptions):**

- `apps/backend/src/features/subscriptions/` → entire directory restructured as `plans/`
- `apps/backend/src/features/subscriptions/services/plan.service.ts` → `apps/backend/src/features/plans/services/plan.service.ts` (keep, rename refs)
- `apps/backend/src/features/subscriptions/services/subscription.service.ts` → DELETE
- `apps/backend/src/features/subscriptions/services/index.ts` — update exports
- `apps/backend/src/features/subscriptions/routes/index.ts` — rewrite (keep plan CRUD only)
- `apps/backend/src/features/subscriptions/routes/plans.route.ts` → rename, update refs
- `apps/backend/src/features/subscriptions/routes/subscribe.route.ts` → DELETE
- `apps/backend/src/features/subscriptions/routes/upgrade.route.ts` → DELETE
- `apps/backend/src/features/subscriptions/routes/downgrade.route.ts` → DELETE
- `apps/backend/src/features/subscriptions/routes/waive.route.ts` → DELETE
- `apps/backend/src/features/subscriptions/routes/my-subscription.route.ts` → DELETE
- `apps/backend/src/features/subscriptions/routes/subscription-payments.route.ts` → DELETE
- `apps/backend/src/features/subscriptions/routes/stub.ts` → DELETE
- `apps/backend/src/features/subscriptions/types/index.ts` → rewrite
- `apps/backend/src/features/subscriptions/validators/index.ts` — rewrite (keep plan CRUD only)
- `apps/backend/src/index.ts` — update import path, mount route

**Backend contribution changes:**

- `apps/backend/src/features/contributions/services/contribution.service.ts` — rewrite `generateUserContributions` to use plan/member-type instead of subscription
- `apps/backend/src/features/membership-applications/services/index.ts` — remove subscription creation on approval
- `apps/backend/src/features/cron/services/subscription-cron.service.ts` — DELETE
- `apps/backend/src/features/payments/services/find-subscription-plans.ts` — rename to `find-plans.ts`

**Frontend plans feature (renamed from subscriptions):**

- `apps/web/src/features/subscriptions/` → restructured
- Keep (rename): types, validators, plan CRUD hooks, plan components, plan pages
- Remove: subscription hooks, change-plan page, my-subscription page, change-plan-dialog
- `apps/web/src/routes/_dashboard/subscriptions/` → rename to `plans/`
- `apps/web/src/routes/_dashboard/payments/history/index.tsx` — remove (was MySubscriptionPage)
- `apps/web/src/routeTree.gen.ts` — regenerate

**Frontend other files:**

- `apps/web/src/shared/constants/drawer.tsx` — rename nav
- `apps/web/src/shared/types/enums.ts` — remove `SUBSCRIPTION` from `PaymentType`, keep `SUBSCRIPTION_CHANGE` in `AuditAction`, keep `BILLING_CYCLE` and `Plan_STATUS`
- `apps/web/src/features/member-type/pages/member-types.tsx` — rename `subscriptionPlans` → `plans`
- `apps/web/src/features/member-type/hooks/useMemberTypeColumns.tsx` — rename `subscriptionPlans` → `plans`
- `apps/web/src/features/member-type/components/cells/member-type-actions-cell.tsx` — rename `subscriptionPlans` → `plans`
- `apps/web/src/features/audit-logs/pages/audit-logs-page.tsx` — remove `'Subscription'` from RESOURCE_TYPES, keep `SUBSCRIPTION_CHANGE` in AUDIT_ACTIONS
- `apps/web/src/shared/components/home/features-section.tsx` — update description text
- `apps/web/src/features/auth/pages/sign-in.tsx` — update text

---

## Task Summary Overview

| #   | Phase    | What                                                                                                  | Why                                                                                                                             | Where Affected                                                                                                                                                                       |
| --- | -------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | DB       | Rename `SubscriptionPlan` → `Plan`, `SubscriptionPlanVersion` → `PlanVersion` in Prisma               | Remove "subscription" naming from core plan model                                                                               | `subscription.prisma`                                                                                                                                                                |
| 2   | DB       | Remove `Subscription` + `SubscriptionBillingHistory` models, add `waivedBy` to `ContributionPeriod`   | Delete unused subscription tables; track waiver approver                                                                        | `subscription.prisma`, `contribution.prisma`                                                                                                                                         |
| 3   | DB       | Update `User`, `MemberType`, `Association` relations                                                  | Remove `subscription` from User; rename `subscriptionPlans` → `plans`                                                           | `user.prisma`, `member.prisma`, `association.prisma`                                                                                                                                 |
| 4   | DB       | Update `PaymentType` enum                                                                             | Remove `SUBSCRIPTION` value since subscriptions are gone                                                                        | `enums.prisma`                                                                                                                                                                       |
| 5   | DB       | Create and run Prisma migration                                                                       | Apply all schema changes to the database                                                                                        | Migration file                                                                                                                                                                       |
| 6   | Shared   | Rename `ENDPOINTS.SUBSCRIPTIONS` → `ENDPOINTS.PLANS`, remove subscribe/waive/my/upgrade endpoints     | Update API path constants to match new naming                                                                                   | `endpoints/subscriptions.ts`, `endpoints/index.ts`, `endpoints/cron.ts`                                                                                                              |
| 7   | Shared   | Rename `QUERY_KEYS.SUBSCRIPTIONS_KEYS` → `QUERY_KEYS.PLANS_KEYS`, remove my/user/payment-history keys | Update React Query cache keys to match new naming                                                                               | `query-keys/subscriptions.ts`, `query-keys/index.ts`                                                                                                                                 |
| 8   | Backend  | Create `plans/` feature directory, restructure from `subscriptions/`                                  | Rename backend feature to match new domain language                                                                             | Entire `subscriptions/` directory                                                                                                                                                    |
| 9   | Backend  | Rewrite backend plan validators — keep plan CRUD schemas, remove subscription schemas                 | Remove subscribe/waive/upgrade/downgrade validation                                                                             | `validators/index.ts`                                                                                                                                                                |
| 10  | Backend  | Rewrite backend plan types — keep Plan + PlanVersion, remove Subscription types                       | Update type definitions to match new models                                                                                     | `types/index.ts`                                                                                                                                                                     |
| 11  | Backend  | Update `plan.service.ts` — rename Prisma model references from `subscriptionPlan` → `plan`            | All business logic must reference renamed Prisma models                                                                         | `services/plan.service.ts`                                                                                                                                                           |
| 12  | Backend  | Rewrite `plans.route.ts` — rename handlers, log messages, comments                                    | Route handlers should use "plan" language                                                                                       | `routes/plans.route.ts`                                                                                                                                                              |
| 13  | Backend  | Rewrite route index — keep only plan CRUD routes                                                      | Remove subscribe/upgrade/downgrade/waive/my/user-subscription/payments routes                                                   | `routes/index.ts`                                                                                                                                                                    |
| 14  | Backend  | Delete subscription service file and unused route files                                               | Remove subscription business logic                                                                                              | `subscription.service.ts`, `subscribe.route.ts`, `upgrade.route.ts`, `downgrade.route.ts`, `waive.route.ts`, `my-subscription.route.ts`, `subscription-payments.route.ts`, `stub.ts` |
| 15  | Backend  | Update `generateUserContributions` to derive amounts from user's member-type plan                     | Without subscriptions, contributions need a new way to determine expected amount                                                | `contributions/services/contribution.service.ts`                                                                                                                                     |
| 16  | Backend  | Update membership-application approval to not create subscriptions                                    | Approving a member should not create Subscription records                                                                       | `membership-applications/services/index.ts`                                                                                                                                          |
| 17  | Backend  | Delete subscription-cron service                                                                      | No more subscriptions to expire                                                                                                 | `cron/services/subscription-cron.service.ts`                                                                                                                                         |
| 18  | Backend  | Rename `find-subscription-plans` payment helper                                                       | Align helper naming with new model names                                                                                        | `payments/services/find-subscription-plans.ts`                                                                                                                                       |
| 19  | Backend  | Update `index.ts` — mount plans router at `/api/v1/plans`                                             | Register new plans route, remove old subscriptions route                                                                        | `index.ts`                                                                                                                                                                           |
| 20  | Frontend | Rewrite frontend plan types — drop Subscription type, rename SubscriptionPlan → Plan                  | Update frontend type definitions                                                                                                | `features/subscriptions/types/index.ts`                                                                                                                                              |
| 21  | Frontend | Rewrite frontend plan validators — keep plan CRUD schemas, remove subscription schemas                | Update Zod schemas for plan-only operations                                                                                     | `features/subscriptions/validators/index.ts`                                                                                                                                         |
| 22  | Frontend | Rewrite plan hooks — keep plan CRUD hooks, delete subscription hooks                                  | Remove useMySubscription, useSubscribe, useChangePlan, useWaiveSubscription, useUserSubscription, useSubscriptionPaymentColumns | All hook files                                                                                                                                                                       |
| 23  | Frontend | Rewrite plan pages — keep plans + plan-detail, delete my-subscription + change-plan                   | Remove subscription-related pages                                                                                               | `pages/`                                                                                                                                                                             |
| 24  | Frontend | Rewrite plan components — update dialog text references                                               | Update "Delete Subscription Plan" etc. to just "Plan"                                                                           | Dialog components, cell components                                                                                                                                                   |
| 25  | Frontend | Create new route files under `_dashboard/plans/`, delete old `subscriptions/` routes                  | Update frontend routing to use `/plans/` paths                                                                                  | All route files, `routeTree.gen.ts`                                                                                                                                                  |
| 26  | Frontend | Update drawer navigation                                                                              | Rename "Subscriptions" → "Plans", remove "Change Plan"                                                                          | `drawer.tsx`                                                                                                                                                                         |
| 27  | Frontend | Update member-type page to use `plans` instead of `subscriptionPlans`                                 | Rename \_count.subscriptionPlans → \_count.plans                                                                                | Member-type files                                                                                                                                                                    |
| 28  | Frontend | Update audit-logs page to remove `'Subscription'` resource type                                       | Subscription resource type no longer exists                                                                                     | `audit-logs-page.tsx`                                                                                                                                                                |
| 29  | Frontend | Update home features section and sign-in page text                                                    | Remove "Subscription Engine" branding                                                                                           | `features-section.tsx`, `sign-in.tsx`                                                                                                                                                |
| 30  | Frontend | Update frontend enums — remove `SUBSCRIPTION` from `PaymentType`                                      | Align with backend enum change                                                                                                  | `enums.ts`                                                                                                                                                                           |

---

### Task 1: Rename `SubscriptionPlan` → `Plan`, `SubscriptionPlanVersion` → `PlanVersion` in Prisma

**Files:**

- Modify: `apps/backend/prisma/schema/subscription.prisma` (entire file)

**Summary:** Rename the two plan models to drop "Subscription" prefix. Update relations, fields, and `@@map()` table names. Temporarily keep `subscriptions Subscription[]` on the Plan model — it will be removed in Task 2.

- [ ] **Step 1: Rewrite `subscription.prisma` with renamed models**

Replace the entire file content:

```prisma
// ─────────────────────────────────────────────────────────────────────────────
// PLANS
// ─────────────────────────────────────────────────────────────────────────────

model Plan {
  id            String   @id @default(uuid())
  associationId String
  name          String
  description   String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isDefault     Boolean  @default(true)

  association Association @relation(fields: [associationId], references: [id], onDelete: Cascade)

  versions      PlanVersion[]
  subscriptions Subscription[] // Will be removed in Task 2

  memberTypeId String?
  memberType   MemberType? @relation(fields: [memberTypeId], references: [id])

  @@unique([associationId, name])
  @@index([associationId])
  @@map("plans")
}

model PlanVersion {
  id     String @id @default(uuid())
  planId String

  amount       Decimal @db.Decimal(10, 2)
  currency     String  @default("INR")
  billingCycle String  @default("MONTHLY")
  features     Json
  description  String?

  effectiveFrom DateTime  @default(now())
  effectiveTo   DateTime?

  createdAt DateTime @default(now())

  plan           Plan                       @relation(fields: [planId], references: [id], onDelete: Cascade)
  subscriptions  Subscription[]             // Will be removed in Task 2
  billingHistory SubscriptionBillingHistory[] // Will be removed in Task 2

  @@index([planId])
  @@map("plan_versions")
}
```

Note: The `Subscription` and `SubscriptionBillingHistory` models still exist in the same file for now. They will be removed in Task 2. The relations on `Plan` and `PlanVersion` are kept temporarily to avoid Prisma validation errors during incremental changes.

- [ ] **Step 2: Verify the file is valid Prisma**

```bash
npx prisma validate
```

Expected: No errors (the Subscription model still exists in the file).

- [ ] **Step 3: Commit**

```bash
git add apps/backend/prisma/schema/subscription.prisma
git commit -m "refactor: rename SubscriptionPlan -> Plan, SubscriptionPlanVersion -> PlanVersion in Prisma schema"
```

---

### Task 2: Remove `Subscription` and `SubscriptionBillingHistory`, add `waivedBy` to `ContributionPeriod`

**Files:**

- Modify: `apps/backend/prisma/schema/subscription.prisma`
- Modify: `apps/backend/prisma/schema/contribution.prisma`

**Summary:** Delete the `Subscription` and `SubscriptionBillingHistory` models entirely. Remove their relations from `Plan` and `PlanVersion`. Remove the `@@map()` directive for the old table. Add `waivedBy` to `ContributionPeriod`.

- [ ] **Step 1: Update `subscription.prisma` — remove Subscription and SubscriptionBillingHistory models**

The file should now contain only `Plan` and `PlanVersion`, with their subscriptions/billingHistory relation fields removed:

```prisma
// ─────────────────────────────────────────────────────────────────────────────
// PLANS
// ─────────────────────────────────────────────────────────────────────────────

model Plan {
  id            String   @id @default(uuid())
  associationId String
  name          String
  description   String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isDefault     Boolean  @default(true)

  association Association @relation(fields: [associationId], references: [id], onDelete: Cascade)

  versions PlanVersion[]

  memberTypeId String?
  memberType   MemberType? @relation(fields: [memberTypeId], references: [id])

  @@unique([associationId, name])
  @@index([associationId])
  @@map("plans")
}

model PlanVersion {
  id     String @id @default(uuid())
  planId String

  amount       Decimal @db.Decimal(10, 2)
  currency     String  @default("INR")
  billingCycle String  @default("MONTHLY")
  features     Json
  description  String?

  effectiveFrom DateTime  @default(now())
  effectiveTo   DateTime?

  createdAt DateTime @default(now())

  plan Plan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([planId])
  @@map("plan_versions")
}
```

- [ ] **Step 2: Add `waivedBy` to `ContributionPeriod`**

In `apps/backend/prisma/schema/contribution.prisma`, add `waivedBy` after `waivedReason`:

```prisma
  waivedAt     DateTime?
  waivedReason String?
  waivedBy     String?
```

The full model after the change:

```prisma
model ContributionPeriod {
  id String @id @default(uuid())

  associationId String
  userId        String

  year  Int
  month Int

  expectedAmount Decimal @db.Decimal(10, 2)

  paidAmount Decimal @default(0) @db.Decimal(10, 2)

  dueAmount Decimal @db.Decimal(10, 2)

  status ContributionStatus @default(DUE)

  dueDate DateTime

  waivedAt     DateTime?
  waivedReason String?
  waivedBy     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  allocations  PaymentAllocation[]
  declarations Declarations[]

  @@unique([userId, year, month])
  @@index([associationId])
  @@index([userId])
  @@index([status])
  @@map("contribution_periods")
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/prisma/schema/subscription.prisma apps/backend/prisma/schema/contribution.prisma
git commit -m "refactor: remove Subscription model, add waivedBy to ContributionPeriod"
```

---

### Task 3: Update `User`, `MemberType`, `Association` relations

**Files:**

- Modify: `apps/backend/prisma/schema/user.prisma`
- Modify: `apps/backend/prisma/schema/member.prisma`
- Modify: `apps/backend/prisma/schema/association.prisma`

**Summary:** Remove the `subscription Subscription?` field from `User`. Rename `subscriptionPlans` to `plans` on `MemberType` and `Association`.

- [ ] **Step 1: Remove `subscription` from User model**

In `apps/backend/prisma/schema/user.prisma`, remove line `subscription Subscription?`:

```prisma
model User {
  // ... all existing fields above ...

  association Association @relation(fields: [associationId], references: [id], onDelete: Cascade)

  // REMOVE THIS LINE:
  // subscription          Subscription?

  payments              PaymentTransaction[]
  contributionPeriods   ContributionPeriod[]
  // ... all remaining fields stay the same ...
}
```

Just delete the `subscription Subscription?` line. All other lines remain.

- [ ] **Step 2: Rename `subscriptionPlans` → `plans` on MemberType**

In `apps/backend/prisma/schema/member.prisma`, change:

```prisma
model MemberType {
  id          String  @id @default(uuid())
  description String?
  level       Int

  associationId     String
  association       Association        @relation(fields: [associationId], references: [id], onDelete: Cascade)
  users             User[]
  subscriptionPlans SubscriptionPlan[]  // ← RENAME THIS
```

To:

```prisma
model MemberType {
  id          String  @id @default(uuid())
  description String?
  level       Int

  associationId     String
  association       Association   @relation(fields: [associationId], references: [id], onDelete: Cascade)
  users             User[]
  plans             Plan[]
```

- [ ] **Step 3: Rename `subscriptionPlans` → `plans` on Association**

In `apps/backend/prisma/schema/association.prisma`, change:

```prisma
  subscriptionPlans   SubscriptionPlan[]   // → rename to: plans Plan[]
```

- [ ] **Step 4: Verify Prisma validates**

```bash
npx prisma validate
```

Expected: No errors. All relations now use the renamed models.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/prisma/schema/user.prisma apps/backend/prisma/schema/member.prisma apps/backend/prisma/schema/association.prisma
git commit -m "refactor: update User/MemberType/Association relations for Plan rename"
```

---

### Task 4: Update `PaymentType` enum — remove `SUBSCRIPTION`

**Files:**

- Modify: `apps/backend/prisma/schema/enums.prisma`

**Summary:** Remove the `SUBSCRIPTION` value from the `PaymentType` enum. It was used for subscription payments, which no longer exist.

- [ ] **Step 1: Remove `SUBSCRIPTION` from `PaymentType`**

In `apps/backend/prisma/schema/enums.prisma`, change:

```prisma
enum PaymentType {
  SUBSCRIPTION
  DONATION
  EVENT_FEE
  BANK_INTEREST
  FAMILY_CONTRIBUTION

  @@map("payment_type")
}
```

To:

```prisma
enum PaymentType {
  DONATION
  EVENT_FEE
  BANK_INTEREST
  FAMILY_CONTRIBUTION

  @@map("payment_type")
}
```

Note: `SUBSCRIPTION_CHANGE` in `AuditAction` is KEPT — plan changes (versioning) are still tracked in audit logs.

- [ ] **Step 2: Commit**

```bash
git add apps/backend/prisma/schema/enums.prisma
git commit -m "refactor: remove SUBSCRIPTION from PaymentType enum"
```

---

### Task 5: Create and run Prisma migration

**Files:**

- Create: Migration file (auto-generated by Prisma)

**Summary:** Generate and apply a Prisma migration that renames tables (`subscription_plans` → `plans`, `subscription_plan_versions` → `plan_versions`), drops `subscriptions` and `subscription_billing_history` tables, updates foreign key constraints, adds `waivedBy` column.

- [ ] **Step 1: Create the migration**

```bash
cd apps/backend
npx prisma migrate dev --name subscription-to-plan-refactor
```

Expected: Prisma generates a migration file renaming tables, dropping old tables, removing the `SUBSCRIPTION` enum value, adding `waived_by` column. If there are existing rows in `subscriptions` or `subscription_billing_history`, the migration will error — see Step 2.

- [ ] **Step 2: Handle existing data (if migration fails)**

If the migration fails because `subscription_billing_history` or `subscriptions` tables have data:

First create a backup script:

```bash
npx prisma db pull  # To see current schema
npx prisma db dump --data-only  # Not available in all versions
```

Then either:

- Truncate the tables if data is safe to delete: add `@@ignore` or handle manually
- Or add `-createOnly` and manually edit the migration SQL to DROP the tables with CASCADE

For production safety, first confirm with the team that no subscription data is active. Then manually edit the migration SQL to:

```sql
-- Drop tables that are being removed
DROP TABLE IF EXISTS "subscription_billing_history" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;

-- Rename tables
ALTER TABLE "subscription_plans" RENAME TO "plans";
ALTER TABLE "subscription_plan_versions" RENAME TO "plan_versions";

-- Add waivedBy column
ALTER TABLE "contribution_periods" ADD COLUMN "waived_by" TEXT;
```

- [ ] **Step 3: Verify migration**

```bash
npx prisma migrate status
```

Expected: "Database up to date" or similar success message.

- [ ] **Step 4: Generate Prisma client**

```bash
npx prisma generate
```

Expected: Client regenerated with `Plan`, `PlanVersion` models. No `Subscription` or `SubscriptionBillingHistory`.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/prisma/migrations/
git commit -m "feat: run subscription-to-plan migration"
```

---

### Task 6: Rename shared endpoints — `ENDPOINTS.SUBSCRIPTIONS` → `ENDPOINTS.PLANS`

**Files:**

- Modify: `packages/shared/src/constants/endpoints/subscriptions.ts`
- Modify: `packages/shared/src/constants/endpoints/index.ts`
- Modify: `packages/shared/src/constants/endpoints/cron.ts`

**Summary:** Rename the endpoints constant from `SUBSCRIPTIONS` to `PLANS`. Remove subscription-only endpoints (MY, SUBSCRIBE, UPGRADE, WAIVE, PAYMENTS, USER). Keep only PLANS, PLANS_DEFAULT, PLAN_DETAILS. Also remove CRON.SUBSCRIPTION_EXPIRY.

- [ ] **Step 1: Rewrite `packages/shared/src/constants/endpoints/subscriptions.ts`**

Replace the entire file:

```ts
export const PLANS = {
  PLANS: '/plans',
  PLANS_DEFAULT: '/plans/default',
  PLAN_DETAILS: (id: string) => `/plans/${id}`,
} as const;
```

Note: The URL paths change from `/subscriptions/plans` to `/plans` to reflect the new route structure.

- [ ] **Step 2: Update `packages/shared/src/constants/endpoints/index.ts`**

Find the line that imports and re-exports `SUBSCRIPTIONS` from `./subscriptions` and change it to import and re-export `PLANS`:

```ts
export { PLANS } from './subscriptions';
```

- [ ] **Step 3: Remove `SUBSCRIPTION_EXPIRY` from cron endpoints**

In `packages/shared/src/constants/endpoints/cron.ts`, remove the `SUBSCRIPTION_EXPIRY` line:

```ts
export const CRON = {
  // Remove: SUBSCRIPTION_EXPIRY: '/cron/subscription-expiry',
  DSAR_SLA: '/cron/dsar-sla',
  ANONYMIZE: '/cron/anonymize',
} as const;
```

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/constants/endpoints/
git commit -m "refactor: rename ENDPOINTS.SUBSCRIPTIONS -> PLANS, remove subscription-only endpoints"
```

---

### Task 7: Rename shared query keys — `QUERY_KEYS.SUBSCRIPTIONS_KEYS` → `QUERY_KEYS.PLANS_KEYS`

**Files:**

- Modify: `packages/shared/src/constants/query-keys/subscriptions.ts`
- Modify: `packages/shared/src/constants/query-keys/index.ts`

**Summary:** Rename the query keys constant from `SUBSCRIPTIONS_KEYS` to `PLANS_KEYS`. Remove MY, USER, PAYMENT_HISTORY keys. Keep only ALL, PLANS, PLAN.

- [ ] **Step 1: Rewrite `packages/shared/src/constants/query-keys/subscriptions.ts`**

Replace the entire file:

```ts
export const PLANS_KEYS = {
  ALL: () => ['plans'].filter(Boolean),
  PLANS: (page?: number) => ['plans', page].filter(Boolean),
  PLAN: (id: string) => ['plan', id].filter(Boolean),
};
```

- [ ] **Step 2: Update `packages/shared/src/constants/query-keys/index.ts`**

Find the subscription import/export and rename:

```ts
export { PLANS_KEYS } from './subscriptions';
```

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/query-keys/
git commit -m "refactor: rename QUERY_KEYS.SUBSCRIPTIONS_KEYS -> PLANS_KEYS"
```

---

### Task 8: Create `plans/` backend feature directory from `subscriptions/`

**Files:**

- Rename: `apps/backend/src/features/subscriptions/` → `apps/backend/src/features/plans/`

**Summary:** Rename the backend feature directory. Git doesn't track directory renames natively, so we need to create new files in the new location and remove old ones.

- [ ] **Step 1: Create the new directory and copy plan-related files**

```bash
mkdir -p apps/backend/src/features/plans/services apps/backend/src/features/plans/routes apps/backend/src/features/plans/validators apps/backend/src/features/plans/types
```

Note: We will NOT copy:

- `subscription.service.ts`
- `routes/subscribe.route.ts`
- `routes/upgrade.route.ts`
- `routes/downgrade.route.ts`
- `routes/waive.route.ts`
- `routes/my-subscription.route.ts`
- `routes/subscription-payments.route.ts`
- `routes/stub.ts`

We WILL create fresh versions of:

- `services/index.ts`
- `services/plan.service.ts`
- `routes/index.ts`
- `routes/plans.route.ts`
- `validators/index.ts`
- `types/index.ts`

(These are created in subsequent tasks with updated content.)

- [ ] **Step 2: Create placeholder `services/index.ts`**

```ts
export {
  createPlan,
  getPlan,
  getPlans,
  setDefaultPlan,
  softDeletePlan,
  updatePlan,
} from './plan.service';
```

- [ ] **Step 3: Commit the directory setup**

```bash
git add apps/backend/src/features/plans/
git commit -m "refactor: create plans feature directory"
```

---

### Task 9: Rewrite backend plan validators

**Files:**

- Create: `apps/backend/src/features/plans/validators/index.ts`

**Summary:** Keep only plan CRUD schemas. Remove `SubscribeSchema`, `WaiveSubscriptionSchema`, `UpgradeSubscriptionSchema`, `DowngradeSubscriptionSchema`, `MySubscriptionQuerySchema`, `SubscriptionParamsSchema`, `SubscriptionQuerySchema`. Rename `CreateSubscriptionPlanSchema` → `CreatePlanSchema`, `UpdatePlanSchema` stays (rename type references).

- [ ] **Step 1: Create the validators file**

```ts
// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { pageNumberValidation } from '@validator/common';
import { z } from 'zod';

// ---- Create plan ------------------------------------------------------------

/** Schema for creating a new plan. */
export const CreatePlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().default('INR'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('YEARLY'),
  features: z.record(z.string(), z.any()).default({}),
  memberTypeId: z.string().optional(),
  isActive: z.boolean().default(true),
  effectiveTo: z.coerce.date().optional(),
  effectiveFrom: z.coerce.date().optional(),
});

/** Input type inferred from CreatePlanSchema. */
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

// ---- Update plan ------------------------------------------------------------

/** Schema for updating a plan (all fields optional). */
export const UpdatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).optional(),
  features: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
  memberTypeId: z.uuid().optional().nullable(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
});

/** Schema for setting a default plan. */
export const SetDefaultPlanSchema = z.object({
  planId: z.uuid(),
});

/** Schema for plan ID path parameter. */
export const PlanParamsSchema = z.object({ planId: z.uuid() });
```

- [ ] **Step 2: Remove the old subscriptions validators directory**

```bash
rm apps/backend/src/features/subscriptions/validators/index.ts
rmdir apps/backend/src/features/subscriptions/validators
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/features/plans/validators/ && git rm apps/backend/src/features/subscriptions/validators/index.ts
git commit -m "refactor: rewrite plan validators, remove subscription schemas"
```

---

### Task 10: Rewrite backend plan types

**Files:**

- Create: `apps/backend/src/features/plans/types/index.ts`

**Summary:** Define Plan and PlanVersion types only. Remove Subscription, SubscriptionBillingHistory types.

- [ ] **Step 1: Create the types file**

```ts
import type { Plan, PlanVersion } from '@prisma/client';

export type { Plan, PlanVersion };

/** Plan with its active version (used in list views). */
export type PlanWithActiveVersion = Plan & {
  activeVersion: PlanVersion | null;
};

/** Plan with all versions (used in detail views). */
export type PlanWithVersions = Plan & {
  versions: PlanVersion[];
};
```

- [ ] **Step 2: Remove old types**

```bash
rm apps/backend/src/features/subscriptions/types/index.ts
rmdir apps/backend/src/features/subscriptions/types
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/features/plans/types/ && git rm apps/backend/src/features/subscriptions/types/index.ts
git commit -m "refactor: rewrite plan types, remove subscription types"
```

---

### Task 11: Update `plan.service.ts` — rename Prisma model references

**Files:**

- Copy: `apps/backend/src/features/subscriptions/services/plan.service.ts` → `apps/backend/src/features/plans/services/plan.service.ts`

**Summary:** Rename all Prisma model references from `subscriptionPlan` → `plan` and `subscriptionPlanVersion` → `planVersion` (Prisma generates lowercase model names). Update `retroactivelyAdjustContributionsForPlan` — it currently queries `tx.subscription.findMany({ where: { planId, status: 'ACTIVE' } })` to find subscribers. Since subscriptions are gone, we need to find users who belong to this plan. Change this to find users via member type or default plan assignment.

**Key changes:**

- `prisma.subscriptionPlan` → `prisma.plan`
- `prisma.subscriptionPlanVersion` → `prisma.planVersion`
- `prisma.subscriptionPlanVersion.findFirst` → `prisma.planVersion.findFirst`
- `prisma.subscriptionPlan.updateMany` → `prisma.plan.updateMany`
- `prisma.subscriptionPlan.create` → `prisma.plan.create`
- Import `CreatePlanInput` instead of `CreateSubscriptionPlanInput`
- In `retroactivelyAdjustContributionsForPlan`: replace `tx.subscription.findMany({ where: { planId, status: 'ACTIVE' } })` with finding users by memberType where the plan matches

- [ ] **Step 1: Update imports and all Prisma model references**

Replace `import type { CreateSubscriptionPlanInput } from '@feature/subscriptions/validators'` with:

```ts
import type { CreatePlanInput } from '@feature/plans/validators';
```

Replace all `prisma.subscriptionPlan` with `prisma.plan` (7 occurrences in the file).

Replace all `prisma.subscriptionPlanVersion` with `prisma.planVersion` (3 occurrences).

Update the `retroactivelyAdjustContributionsForPlan` function (lines ~230-337) to find users differently since there's no Subscription model. Replace:

```ts
// 1. Find all users with an ACTIVE subscription to this plan
const subscribers = await tx.subscription.findMany({
  where: { planId, status: 'ACTIVE' },
  select: { userId: true },
});
```

With:

```ts
// 1. Find all users whose member type uses this plan, or the default plan
const plan = await tx.plan.findUnique({
  where: { id: planId },
  select: { memberTypeId: true, associationId: true },
});

if (!plan) return;

const users = await tx.user.findMany({
  where: {
    associationId: plan.associationId,
    memberTypeId: plan.memberTypeId ?? undefined,
    status: 'ACTIVE' as UserStatus,
  },
  select: { id: true },
});
```

Also rename `subscribers` → `users` in the for loop below:

```ts
for (const { userId } of subscribers) {  // → for (const { id: userId } of users) {
```

Update the `createPlan` function parameter from `body: CreateSubscriptionPlanInput` to `body: CreatePlanInput`.

- [ ] **Step 2: Remove the old file**

```bash
rm apps/backend/src/features/subscriptions/services/plan.service.ts
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/features/plans/services/ && git rm apps/backend/src/features/subscriptions/services/plan.service.ts
git commit -m "refactor: update plan.service.ts - rename Prisma refs, fix retroactive adjustment"
```

---

### Task 12: Rewrite `plans.route.ts`

**Files:**

- Create: `apps/backend/src/features/plans/routes/plans.route.ts`

**Summary:** Create the new plans route handlers. Same logic as before but with "plan" naming, updated import paths, and updated log messages.

- [ ] **Step 1: Create the plans route file**

```ts
// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ValidationError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import {
  createPlan,
  getPlan,
  getPlans,
  setDefaultPlan,
  softDeletePlan,
  updatePlan,
} from '@feature/plans/services';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import {
  CreatePlanSchema,
  PlanParamsSchema,
  SetDefaultPlanSchema,
  UpdatePlanSchema,
} from '@feature/plans/validators';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- GET /api/v1/plans ------------------------------------------------------
/** @desc  List plans for the association
 *  @role  MEMBER */
export const getPlansHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const user = await withRole(req, UserRole.MEMBER);
    logger.info({ traceId, role: user.role }, 'GET /api/v1/plans - Fetching plans');
    const data = await getPlans(req.user!.associationId, user);
    return success(res, { data });
  }),
];

// ---- POST /api/v1/plans -----------------------------------------------------
/** @desc  Create a new plan with an initial version
 *  @role  SUPER_ADMIN */
export const createPlanHandler: RequestHandler[] = [
  validate({ body: CreatePlanSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    await withRole(req, UserRole.SUPER_ADMIN);
    if (!req.body) throw new ValidationError('Invalid request body');
    logger.info({ traceId, name: req.body.name }, 'Creating new plan');
    const plan = await createPlan(req.user!.associationId, req.body);
    return success(res, { data: plan }, 201);
  }),
];

// ---- POST /api/v1/plans/default ---------------------------------------------
/** @desc  Set a plan as the default for the association
 *  @role  SUPER_ADMIN */
export const setDefaultPlanHandler: RequestHandler[] = [
  validate({ body: SetDefaultPlanSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    await withRole(req, UserRole.SUPER_ADMIN);
    if (!req.body) throw new ValidationError('Invalid request body');
    logger.info({ traceId, planId: req.body.planId }, 'Setting plan as default');
    const updated = await setDefaultPlan(req.user!.associationId, req.body.planId);
    return success(res, { data: updated });
  }),
];

// ---- PATCH /api/v1/plans/:planId --------------------------------------------
/** @desc  Update a plan (creates new version if price changes)
 *  @role  SUPER_ADMIN */
export const updatePlanHandler: RequestHandler[] = [
  validate({ body: UpdatePlanSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const user = await withRole(req, UserRole.SUPER_ADMIN);
    logger.info({ traceId, userId: user.id }, 'PATCH /api/v1/plans/[planId] - User authorized');
    if (!req.body) throw new ValidationError('Invalid request body');
    const { planId } = req.params;
    const updatedPlan = await updatePlan(req.user!.associationId, planId as string, req.body);
    logger.info({ traceId, planId }, 'Plan updated successfully');
    return success(res, { data: updatedPlan });
  }),
];

// ---- DELETE /api/v1/plans/:planId -------------------------------------------
/** @desc  Soft-delete a plan by setting isActive = false
 *  @role  PRESIDENT */
export const deletePlanHandler: RequestHandler[] = [
  validate({ params: PlanParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const user = await withRole(req, UserRole.PRESIDENT);
    logger.info({ traceId, userId: user.id }, 'DELETE /api/v1/plans/[planId] - User authorized');
    const { planId } = req.params;
    const plan = await softDeletePlan(req.user!.associationId, planId as string);
    logger.info({ traceId, planId }, 'Plan deleted successfully');
    return success(res, { data: plan, message: 'Plan deleted successfully' });
  }),
];

// ---- GET /api/v1/plans/:planId ----------------------------------------------
/** @desc  Get plan details with version history
 *  @role  MEMBER */
export const getPlanDetailsHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    await withRole(req, UserRole.MEMBER);
    const { planId } = req.params;
    const plan = await getPlan(planId as string, req.user!.associationId);
    logger.info({ traceId, planId }, 'GET /api/v1/plans/[planId] - Success');
    return success(res, { data: plan });
  }),
];
```

- [ ] **Step 2: Remove the old plans route file**

```bash
rm apps/backend/src/features/subscriptions/routes/plans.route.ts
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/features/plans/routes/plans.route.ts && git rm apps/backend/src/features/subscriptions/routes/plans.route.ts
git commit -m "refactor: rewrite plans route handlers"
```

---

### Task 13: Rewrite route index — keep only plan CRUD routes

**Files:**

- Create: `apps/backend/src/features/plans/routes/index.ts`

**Summary:** New router with only plan CRUD endpoints. Mounted at the feature level (will be mounted under `/api/v1/plans` in the app).

- [ ] **Step 1: Create the router**

```ts
// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
import { auth } from '@src/middleware/auth';
import { Router } from 'express';

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------
import {
  createPlanHandler,
  deletePlanHandler,
  getPlanDetailsHandler,
  getPlansHandler,
  setDefaultPlanHandler,
  updatePlanHandler,
} from './plans.route';

/** Plans feature router — all routes require authentication. */
const router: Router = Router();

router.use(auth);

// ---- Plans ------------------------------------------------------------------

router.get('/', getPlansHandler);
router.post('/', createPlanHandler);
router.post('/default', setDefaultPlanHandler);
router.get('/:planId', getPlanDetailsHandler);
router.patch('/:planId', updatePlanHandler);
router.delete('/:planId', deletePlanHandler);

export default router;
```

Note: Routes are now relative to `/api/v1/plans` (set in `index.ts`), so `/` maps to `GET /api/v1/plans`, `/:planId` maps to `GET /api/v1/plans/:planId`, etc.

- [ ] **Step 2: Remove old route index and unused route files**

```bash
rm apps/backend/src/features/subscriptions/routes/index.ts
rm apps/backend/src/features/subscriptions/routes/subscribe.route.ts
rm apps/backend/src/features/subscriptions/routes/upgrade.route.ts
rm apps/backend/src/features/subscriptions/routes/downgrade.route.ts
rm apps/backend/src/features/subscriptions/routes/waive.route.ts
rm apps/backend/src/features/subscriptions/routes/my-subscription.route.ts
rm apps/backend/src/features/subscriptions/routes/subscription-payments.route.ts
rm apps/backend/src/features/subscriptions/routes/stub.ts
rmdir apps/backend/src/features/subscriptions/routes
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/features/plans/routes/index.ts && git rm apps/backend/src/features/subscriptions/routes/index.ts
git commit -m "refactor: rewrite plans route index, keep only plan CRUD"
```

---

### Task 14: Delete subscription service and remaining subscription files

**Files:**

- Delete: `apps/backend/src/features/subscriptions/services/subscription.service.ts`
- Delete: `apps/backend/src/features/subscriptions/services/index.ts`
- Delete: `apps/backend/src/features/subscriptions/` (if empty)

**Summary:** Remove the old subscription service files. The `subscriptions/` directory should now be empty and removable.

- [ ] **Step 1: Remove old subscription service files**

```bash
rm apps/backend/src/features/subscriptions/services/subscription.service.ts
rm apps/backend/src/features/subscriptions/services/index.ts
rmdir apps/backend/src/features/subscriptions/services
rmdir apps/backend/src/features/subscriptions 2>/dev/null; true
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "refactor: remove subscription service and unused files"
```

---

### Task 15: Update `generateUserContributions` to derive amounts from plan/member-type

**Files:**

- Modify: `apps/backend/src/features/contributions/services/contribution.service.ts`

**Summary:** The current `generateUserContributions` function queries users with `subscription: { status: 'ACTIVE' }` and reads `member.subscription.planVersion.amount`. After removing subscriptions, it needs to find each user's plan through their member type (or the default plan), then use the plan's active version amount.

**What:** Rewrite the user query and amount derivation in `generateUserContributions`. Instead of filtering by active subscription, filter by active status, include member type, then find the appropriate plan.

- [ ] **Step 1: Rewrite the `generateUserContributions` function**

Replace lines 120-214 (the entire function) with:

```ts
export async function generateUserContributions(
  userId: string,
  year: number,
  numberOfMonth: number,
): Promise<number> {
  const monthsToGenerate = Math.min(Math.max(numberOfMonth, 1), 12);
  let totalProcessed = 0;

  for (let month = 1; month <= monthsToGenerate; month++) {
    const generateDate = new Date(year, month - 1, 1);
    const dueDate = new Date(year, month, 0);

    const activeMembers = await prisma.user.findMany({
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
        dateOfJoiningAssociation: {
          lte: generateDate,
        },
      },
      include: {
        memberType: true,
      },
    });

    if (activeMembers.length === 0) continue;

    for (const member of activeMembers) {
      if (!member.dateOfJoiningAssociation) continue;

      const memberJoinedMonth =
        member.dateOfJoiningAssociation.getFullYear() * 12 +
        member.dateOfJoiningAssociation.getMonth();
      const targetMonth = year * 12 + (month - 1);

      if (memberJoinedMonth > targetMonth) continue;

      // Find the plan for this user's member type (or the default plan)
      const plan = await prisma.plan.findFirst({
        where: {
          associationId: member.associationId,
          isActive: true,
          ...(member.memberTypeId ? { memberTypeId: member.memberTypeId } : { isDefault: true }),
        },
        include: {
          versions: {
            where: { effectiveTo: null },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!plan || plan.versions.length === 0) continue;
      const activeVersion = plan.versions[0];
      const expectedAmount = activeVersion.amount;

      // Check subscription effective date logic — use user's join date or plan version effectiveFrom
      const planEffectiveFrom = activeVersion.effectiveFrom;
      const planMonth = planEffectiveFrom.getFullYear() * 12 + planEffectiveFrom.getMonth();

      if (targetMonth < planMonth) continue;

      const contributionData = {
        associationId: member.associationId,
        userId: member.id,
        year,
        month,
        expectedAmount,
        paidAmount: 0,
        dueAmount: expectedAmount,
        status: ContributionStatus.DUE,
        dueDate,
      };

      const existingContribution = await prisma.contributionPeriod.findUnique({
        where: {
          userId_year_month: {
            userId: member.id,
            year,
            month,
          },
        },
      });

      if (existingContribution) continue;

      await prisma.contributionPeriod.create({
        data: contributionData,
      });

      totalProcessed++;
    }
  }

  return totalProcessed;
}
```

- [ ] **Step 2: Remove unused import**

The file currently imports `UserStatus` from `@prisma/client`. This is already there. No import changes needed — just remove the old `subscription`-related imports if present.

- [ ] **Step 3: Verify the file compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -50
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/features/contributions/services/contribution.service.ts
git commit -m "refactor: update generateUserContributions to derive amounts from plan/member-type"
```

---

### Task 16: Update membership-application approval to not create subscriptions

**Files:**

- Modify: `apps/backend/src/features/membership-applications/services/index.ts`

**Summary:** When a membership application is approved, the current code creates a `Subscription` and `SubscriptionBillingHistory` record. Remove this — just find and validate that a plan exists for the user's member type.

- [ ] **Step 1: Rewrite the user creation transaction in `approveMembershipApplication`**

Replace lines 201-301 (from `let planForCurrentUser` through the end of the transaction). The new code finds the plan but does NOT create a subscription. The transaction only creates the user and updates the application:

```ts
let planForCurrentUser;

if (memberTypeId) {
  planForCurrentUser = await prisma.plan.findFirst({
    where: { memberTypeId, isActive: true },
    include: { versions: { take: 1, orderBy: { createdAt: 'desc' } } },
  });
}

if (!planForCurrentUser) {
  planForCurrentUser = await prisma.plan.findFirst({
    where: { isDefault: true, isActive: true },
    include: { versions: { take: 1, orderBy: { createdAt: 'desc' } } },
  });
}

if (!planForCurrentUser) {
  throw new NotFoundError('Cannot create user: Without any active plan');
}

const randomPassword = generateRandomPassword();
const hashedPassword = await hashPassword(randomPassword);

const { user, updatedApplication } = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      email: application.email,
      name: `${application.firstName} ${application.lastName}`,
      mobile: application.phone,
      associationId: association.id,
      role: [role],
      status: 'ACTIVE',
      memberTypeId: memberTypeId || null,
      dateOfJoiningGovt: dateOfJoiningGovt || new Date(),
      dateOfJoiningAssociation: new Date(),
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    },
  });

  const updatedApplication = await tx.membershipApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationStatus.APPROVED,
      reviewedAt: new Date(),
      reviewedBy,
    },
  });

  return { user, updatedApplication };
});
```

Also update the Prisma import — the file currently imports `Subscription` model types. No change needed since we're using `tx.user.create` not `tx.plan.create` (the plan lookup is done outside the transaction).

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/features/membership-applications/services/index.ts
git commit -m "refactor: remove subscription creation from membership approval"
```

---

### Task 17: Delete subscription-cron service

**Files:**

- Delete: `apps/backend/src/features/cron/services/subscription-cron.service.ts`

**Summary:** Remove the cron job that expired overdue subscriptions. No more subscriptions to expire.

- [ ] **Step 1: Remove the file**

```bash
rm apps/backend/src/features/cron/services/subscription-cron.service.ts
```

- [ ] **Step 2: Check if this cron is registered anywhere**

```bash
grep -r "subscription-cron\|subscriptionExpiry\|runSubscriptionExpiryCron\|expireOverdueSubscriptions" apps/backend/src/ --include="*.ts" | grep -v node_modules
```

If it's referenced in a cron scheduler or route, remove those references too.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove subscription cron service"
```

---

### Task 18: Rename `find-subscription-plans` payment helper

**Files:**

- Rename: `apps/backend/src/features/payments/services/find-subscription-plans.ts` → `apps/backend/src/features/payments/services/find-plans.ts`

**Summary:** Rename the helper file and update its Prisma model references from `subscriptionPlan` → `plan`.

- [ ] **Step 1: Create the new file and remove the old one**

```bash
cp apps/backend/src/features/payments/services/find-subscription-plans.ts apps/backend/src/features/payments/services/find-plans.ts
rm apps/backend/src/features/payments/services/find-subscription-plans.ts
```

Update the content of `find-plans.ts`:

```ts
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.PlanWhereInput;
  include?: Prisma.PlanInclude;
  db?: DbClient;
};

export async function findPlans({ where, include, db = prisma }: Props) {
  return await db.plan.findMany({
    where,
    include,
    orderBy: { createdAt: 'desc' },
  });
}
```

- [ ] **Step 2: Update any imports of `findSubscriptionPlans` in other files**

```bash
grep -r "findSubscriptionPlans" apps/backend/src/ --include="*.ts" | grep -v node_modules
```

Update each occurrence to import `findPlans` instead.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/features/payments/services/ && git rm apps/backend/src/features/payments/services/find-subscription-plans.ts
git commit -m "refactor: rename find-subscription-plans -> find-plans"
```

---

### Task 19: Update backend `index.ts` — mount plans router

**Files:**

- Modify: `apps/backend/src/index.ts`

**Summary:** Change the import from `subscriptionsRouter` to `plansRouter` and update the mount path from `/api/v1/subscriptions` to `/api/v1/plans`.

- [ ] **Step 1: Update the import and mount**

```ts
// Change:
import subscriptionsRouter from '@feature/subscriptions/routes/index';
app.use('/api/v1/subscriptions', subscriptionsRouter);

// To:
import plansRouter from '@feature/plans/routes/index';
app.use('/api/v1/plans', plansRouter);
```

- [ ] **Step 2: Remove the old subscriptions directory entirely**

```bash
rm -rf apps/backend/src/features/subscriptions
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/index.ts
git commit -m "refactor: mount plans router at /api/v1/plans"
```

---

### Task 20: Rewrite frontend plan types

**Files:**

- Modify: `apps/web/src/features/subscriptions/types/index.ts`

**Summary:** Drop the `Subscription` type. Rename `SubscriptionPlan` → `Plan`, `SubscriptionPlanVersion` → `PlanVersion`, `SubscriptionPlanListItem` → `PlanListItem`.

- [ ] **Step 1: Rewrite the types file**

```ts
export interface PlanVersion {
  id: string;
  amount: number;
  currency: string;
  billingCycle: string;
  features: Record<string, unknown>;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  associationId: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  memberTypeId?: string;
  memberType?: { id: string; level: number; description?: string };
  activeVersion?: PlanVersion;
  versions?: PlanVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanListItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  memberTypeId?: string;
  activeVersion?: PlanVersion;
  createdAt: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/subscriptions/types/index.ts
git commit -m "refactor: update frontend plan types"
```

---

### Task 21: Rewrite frontend plan validators

**Files:**

- Modify: `apps/web/src/features/subscriptions/validators/index.ts`

**Summary:** Keep only plan CRUD schemas. Remove `SubscribeSchema`, `WaiveSubscriptionSchema`, `UpgradeSubscriptionSchema`. Rename `CreateSubscriptionPlanSchema` → `CreatePlanSchema`, `EditPlanSchema` → `UpdatePlanSchema`.

- [ ] **Step 1: Rewrite the validators file**

```ts
import { z } from 'zod';

export const CreatePlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().default('INR'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('YEARLY'),
  features: z.record(z.string(), z.any()).default({}),
  memberTypeId: z.string().optional(),
  isActive: z.boolean().default(true),
  effectiveTo: z.coerce.date().optional(),
  effectiveFrom: z.coerce.date().optional(),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

export const UpdatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).optional(),
  features: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
  memberTypeId: z.uuid().optional().nullable(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
});

export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/subscriptions/validators/index.ts
git commit -m "refactor: update frontend plan validators"
```

---

### Task 22: Rewrite frontend plan hooks

**Files:**

- Keep (with updates): `usePlans.ts`, `usePlan.ts`, `useCreatePlan.ts`, `useUpdatePlan.ts`, `useDeletePlan.ts`, `useSetDefaultPlan.ts`, `usePlanTableActions.ts`, `usePlanTableColumns.tsx`, `usePlanVersionColumns.tsx`
- Delete: `useMySubscription.ts`, `useUserSubscription.ts`, `useSubscribe.ts`, `useChangePlan.ts`, `useWaiveSubscription.ts`, `useSubscriptionPaymentColumns.tsx`

**Summary:** Update the kept hooks to import from the renamed `ENDPOINTS.PLANS` and `QUERY_KEYS.PLANS_KEYS`, and use renamed types (`Plan` vs `SubscriptionPlan`). Delete the 6 subscription-related hooks.

- [ ] **Step 1: Update `usePlans.ts`**

```ts
import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { Plan } from '../types';

interface UsePlansOptions {
  page?: number;
}

export function usePlans(options: UsePlansOptions = {}) {
  const { page = 1 } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PLANS_KEYS.PLANS(page),
    queryFn: () => http.get<Plan[]>(buildUrlWithQuery(ENDPOINTS.PLANS.PLANS, { page })),
  });

  return {
    plans: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
```

- [ ] **Step 2: Update `usePlan.ts`**

```ts
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { Plan } from '../types';

type UsePlanProps = {
  planId: string;
};

export function usePlan({ planId }: UsePlanProps) {
  return useQuery({
    queryKey: QUERY_KEYS.PLANS_KEYS.PLAN(planId),
    queryFn: () => http.get<Plan>(ENDPOINTS.PLANS.PLAN_DETAILS(planId)),
    enabled: !!planId,
    select: (data) => data.data,
  });
}
```

- [ ] **Step 3: Update `useCreatePlan.ts`**

```ts
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { CreatePlanInput } from '../validators';

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanInput) => http.post(ENDPOINTS.PLANS.PLANS, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan created successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLANS_KEYS.PLANS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to create plan');
    },
  });
}
```

- [ ] **Step 4: Update `useUpdatePlan.ts`**

Change imports:

- `ENDPOINTS.SUBSCRIPTIONS.PLAN_DETAILS(planId)` → `ENDPOINTS.PLANS.PLAN_DETAILS(planId)`
- `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` → `QUERY_KEYS.PLANS_KEYS.PLANS()`
- `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLAN(planId)` → `QUERY_KEYS.PLANS_KEYS.PLAN(planId)`

- [ ] **Step 5: Update `useDeletePlan.ts`**

Same import changes as `useUpdatePlan.ts`.

- [ ] **Step 6: Update `useSetDefaultPlan.ts`**

Change:

- `ENDPOINTS.SUBSCRIPTIONS.PLANS_DEFAULT` → `ENDPOINTS.PLANS.PLANS_DEFAULT`
- `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` → `QUERY_KEYS.PLANS_KEYS.PLANS()`

- [ ] **Step 7: Update `usePlanTableColumns.tsx`**

Change:

- `'SubscriptionPlan'` type import → `'Plan'`
- Any `SUBSCRIPTIONS_KEYS` → `PLANS_KEYS` references

- [ ] **Step 8: Delete subscription hooks**

```bash
rm apps/web/src/features/subscriptions/hooks/useMySubscription.ts
rm apps/web/src/features/subscriptions/hooks/useUserSubscription.ts
rm apps/web/src/features/subscriptions/hooks/useSubscribe.ts
rm apps/web/src/features/subscriptions/hooks/useChangePlan.ts
rm apps/web/src/features/subscriptions/hooks/useWaiveSubscription.ts
rm apps/web/src/features/subscriptions/hooks/useSubscriptionPaymentColumns.tsx
```

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/features/subscriptions/hooks/
git commit -m "refactor: update frontend hooks - rename refs, delete subscription hooks"
```

---

### Task 23: Rewrite frontend plan pages

**Files:**

- Keep (with updates): `pages/plans.tsx`, `pages/plan-detail.tsx`
- Delete: `pages/my-subscription.tsx`, `pages/change-plan.tsx`
- Modify: `pages/index.ts`

**Summary:** Keep the plan list and detail pages. Delete the subscription-related pages. Update the barrel exports.

- [ ] **Step 1: Update `pages/index.ts`**

```ts
export { default as PlansPage } from './plans';
export * from './plan-detail';
```

- [ ] **Step 2: Delete subscription pages**

```bash
rm apps/web/src/features/subscriptions/pages/my-subscription.tsx
rm apps/web/src/features/subscriptions/pages/change-plan.tsx
```

- [ ] **Step 3: Update `pages/plans.tsx` imports**

Change imports from `'../validators'` — update `CreateSubscriptionPlanSchema` → `CreatePlanSchema`, `EditPlanSchema` → `UpdatePlanSchema`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/subscriptions/pages/
git commit -m "refactor: update plan pages - remove subscription pages"
```

---

### Task 24: Rewrite plan dialog components

**Files:**

- Modify: `components/create-plan-dialog.tsx`
- Modify: `components/edit-plan-dialog.tsx`
- Modify: `components/delete-plan-dialog.tsx`
- Delete: `components/change-plan-dialog.tsx`

**Summary:** Update text references from "Subscription Plan" to "Plan" in dialog titles, descriptions. Delete change-plan-dialog.

- [ ] **Step 1: Update `create-plan-dialog.tsx`**

- Import `CreatePlanSchema` / `CreatePlanInput` instead of `CreateSubscriptionPlanSchema`
- Change title text from "Create Subscription Plan" → "Create Plan"
- Change any references to "subscription plan" → "plan"

- [ ] **Step 2: Update `edit-plan-dialog.tsx`**

- Import `UpdatePlanSchema` / `UpdatePlanInput` instead of `EditPlanSchema`
- Change title from "Edit Subscription Plan" → "Edit Plan"

- [ ] **Step 3: Update `delete-plan-dialog.tsx`**

- Change "Delete Subscription Plan" → "Delete Plan"
- Change description text accordingly

- [ ] **Step 4: Delete change-plan-dialog**

```bash
rm apps/web/src/features/subscriptions/components/change-plan-dialog.tsx
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/subscriptions/components/
git commit -m "refactor: update plan dialog text, remove change-plan-dialog"
```

---

### Task 25: Create new frontend route files under `_dashboard/plans/`

**Files:**

- Create: `apps/web/src/routes/_dashboard/plans/index.tsx`
- Create: `apps/web/src/routes/_dashboard/plans/$planId/index.tsx`
- Delete: `apps/web/src/routes/_dashboard/subscriptions/` (entire directory tree)
- Delete: `apps/web/src/routes/_dashboard/subscriptions/change-plan/index.tsx`
- Delete: `apps/web/src/routes/_dashboard/payments/history/index.tsx`
- Modify: `apps/web/src/routeTree.gen.ts` (regenerate)

**Summary:** Create new route files for `/plans/` and `/plans/$planId/`. Remove old `/subscriptions/` routes and the `/payments/history/` route (it rendered MySubscriptionPage). Regenerate the route tree.

- [ ] **Step 1: Create routes directory and files**

Create `apps/web/src/routes/_dashboard/plans/index.tsx`:

```tsx
import { PlansPage } from '@src/features/subscriptions/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/plans/')({
  component: PlansPage,
});
```

Create `apps/web/src/routes/_dashboard/plans/$planId/index.tsx`:

```tsx
import { PlanDetailPage } from '@src/features/subscriptions/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/plans/$planId/')({
  component: PlanDetailPage,
});
```

- [ ] **Step 2: Remove old route directories**

```bash
rm -rf apps/web/src/routes/_dashboard/subscriptions
rm -rf apps/web/src/routes/_dashboard/payments/history
```

- [ ] **Step 3: Regenerate route tree**

```bash
cd apps/web && npx tanstack-router-cli route-manifest
```

Or if using the TanStack Router plugin:

```bash
cd apps/web && npx @tanstack/router-cli --generated
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/ && git rm -r apps/web/src/routes/_dashboard/subscriptions
git commit -m "refactor: create /plans/ routes, remove /subscriptions/ routes"
```

---

### Task 26: Update drawer navigation

**Files:**

- Modify: `apps/web/src/shared/constants/drawer.tsx`

**Summary:** Rename "Subscriptions" section to "Plans". Remove "Change Plan" sub-item, keep only "Plans".

- [ ] **Step 1: Update the drawer entry**

Replace lines 93-108:

```tsx
{
  title: 'Subscriptions',
  url: '/subscriptions/plans',
  icon: <CreditCardIcon />,
  isActive: false,
  items: [
    {
      title: 'Plans',
      url: '/subscriptions/plans',
    },
    {
      title: 'Change Plan',
      url: '/subscriptions/change-plan',
    },
  ],
},
```

With:

```tsx
{
  title: 'Plans',
  url: '/plans',
  icon: <CreditCardIcon />,
  isActive: false,
},
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/shared/constants/drawer.tsx
git commit -m "refactor: rename drawer nav Subscriptions -> Plans"
```

---

### Task 27: Update member-type page to use `plans`

**Files:**

- Modify: `apps/web/src/features/member-type/pages/member-types.tsx`
- Modify: `apps/web/src/features/member-type/hooks/useMemberTypeColumns.tsx`
- Modify: `apps/web/src/features/member-type/components/cells/member-type-actions-cell.tsx`

**Summary:** Rename `subscriptionPlans` → `plans` in all member-type files.

- [ ] **Step 1: Update `member-types.tsx`**

Change the interface `_count` field from `subscriptionPlans: number` to `plans: number`.

- [ ] **Step 2: Update `useMemberTypeColumns.tsx`**

Change `accessorKey: 'subscriptionPlans'` → `accessorKey: 'plans'`.
Change `row.original._count.subscriptionPlans` → `row.original._count.plans`.

- [ ] **Step 3: Update `member-type-actions-cell.tsx`**

Change `subscriptionPlans: number` → `plans: number` in the interface.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/member-type/
git commit -m "refactor: rename subscriptionPlans -> plans in member-type"
```

---

### Task 28: Update audit-logs page

**Files:**

- Modify: `apps/web/src/features/audit-logs/pages/audit-logs-page.tsx`

**Summary:** Remove `'Subscription'` from `RESOURCE_TYPES` array. Keep `SUBSCRIPTION_CHANGE` in `AUDIT_ACTIONS` (plan version changes are still tracked).

- [ ] **Step 1: Remove `'Subscription'` from RESOURCE_TYPES**

Remove the line `'Subscription',` from the RESOURCE_TYPES array (around line 64):

```ts
const RESOURCE_TYPES = [
  'Member',
  'Meeting',
  'AgendaItem',
  'Attendee',
  'Announcement',
  'AnnouncementReadReceipt',
  'TrainingModule',
  'TrainingCompletion',
  'Payment',
  // 'Subscription', ← REMOVE THIS
  'Complaint',
  'AuditLog',
] as const;
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/audit-logs/pages/audit-logs-page.tsx
git commit -m "refactor: remove Subscription from audit log resource types"
```

---

### Task 29: Update home features section and sign-in page text

**Files:**

- Modify: `apps/web/src/shared/components/home/features-section.tsx`
- Modify: `apps/web/src/features/auth/pages/sign-in.tsx`

**Summary:** Change "Subscription Engine" and "manage subscriptions" text to reflect the new plan/contribution language.

- [ ] **Step 1: Update `features-section.tsx`**

Change:

```tsx
{
  icon: Payment01Icon,
  title: 'Subscription Engine',
  description: 'Configurable subscription plans with automated billing, payment tracking, receipt generation, and waiver management.',
},
```

To:

```tsx
{
  icon: Payment01Icon,
  title: 'Contribution Plans',
  description: 'Configurable contribution plans with automated period generation, payment allocation, receipt tracking, and waiver management.',
},
```

- [ ] **Step 2: Update `sign-in.tsx`**

Find the text "manage subscriptions" and change it to "manage contributions" or remove it.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/shared/components/home/features-section.tsx apps/web/src/features/auth/pages/sign-in.tsx
git commit -m "refactor: update feature descriptions from subscription to contribution language"
```

---

### Task 30: Update frontend enums

**Files:**

- Modify: `apps/web/src/shared/types/enums.ts`

**Summary:** Remove `SUBSCRIPTION` from `PaymentType` enum to align with backend enum change.

- [ ] **Step 1: Remove `SUBSCRIPTION` from `PaymentType`**

```ts
export const PaymentType = {
  // REMOVE: SUBSCRIPTION: 'SUBSCRIPTION',
  DONATION: 'DONATION',
  EVENT_FEE: 'EVENT_FEE',
  BANK_INTEREST: 'BANK_INTEREST',
  FAMILY_CONTRIBUTION: 'FAMILY_CONTRIBUTION',
} as const;
```

Keep `SUBSCRIPTION_CHANGE` in `AuditAction` (it's used for plan version change audit logs).
Keep `BILLING_CYCLE` and `Plan_STATUS` as-is.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/shared/types/enums.ts
git commit -m "refactor: remove SUBSCRIPTION from frontend PaymentType"
```

---

## Self-Review

**Spec coverage check:**

- ✅ Remove Subscription model — Task 1, 2, 3
- ✅ Remove SubscriptionBillingHistory — Task 2
- ✅ Rename SubscriptionPlan → Plan — Task 1, 3
- ✅ Rename SubscriptionPlanVersion → PlanVersion — Task 1
- ✅ Remove subscribe/upgrade/downgrade/waive endpoints — Task 13, 14
- ✅ Remove user subscription pages (my-subscription, change-plan) — Task 23
- ✅ Add waivedBy to ContributionPeriod — Task 2
- ✅ Update contribution generation to use plan/member-type — Task 15
- ✅ Remove subscription creation from membership approval — Task 16
- ✅ Remove subscription cron — Task 17
- ✅ Update drawer nav — Task 26
- ✅ Update member-type references — Task 27
- ✅ Update audit logs — Task 28
- ✅ Update feature descriptions — Task 29
- ✅ Remove SUBSCRIPTION from enums — Task 4, 30
- ✅ Rename shared constants — Task 6, 7
- ✅ Rename backend feature directory — Task 8, 9, 10, 11, 12, 13, 14, 18, 19
- ✅ Update frontend routes — Task 25
- ✅ Update frontend hooks — Task 22
- ✅ Update frontend validators/types — Task 20, 21
- ✅ Update frontend components (dialogs) — Task 24
- ✅ Add waivedBy field — Task 2
- ✅ Rename backend index.ts mount — Task 19
- ✅ Remove payments/history route — Task 25
- ✅ Migrate database — Task 5

**Placeholder scan:** All tasks contain exact code, file paths, and commands. No TODOs or "implement later" patterns.

**Type consistency:** All Prisma model references use `plan`/`planVersion` consistently. All frontend types use `Plan`/`PlanVersion` consistently. Endpoint paths reference `/plans` consistently.
