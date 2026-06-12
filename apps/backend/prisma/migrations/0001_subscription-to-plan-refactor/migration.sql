-- AlterEnum: Remove SUBSCRIPTION from PaymentType (no table columns reference this enum)
BEGIN;
ALTER TYPE "payment_type" RENAME TO "payment_type_old";
CREATE TYPE "payment_type" AS ENUM ('DONATION', 'EVENT_FEE', 'BANK_INTEREST', 'FAMILY_CONTRIBUTION');
DROP TYPE "payment_type_old";
COMMIT;

-- DropForeignKey: billing_history -> plan_versions
ALTER TABLE "subscription_billing_history" DROP CONSTRAINT "subscription_billing_history_planVersionId_fkey";

-- DropForeignKey: billing_history -> subscriptions
ALTER TABLE "subscription_billing_history" DROP CONSTRAINT "subscription_billing_history_subscriptionId_fkey";

-- DropForeignKey: subscription_plan_versions -> subscription_plans
ALTER TABLE "subscription_plan_versions" DROP CONSTRAINT "subscription_plan_versions_planId_fkey";

-- DropForeignKey: subscription_plans -> associations
ALTER TABLE "subscription_plans" DROP CONSTRAINT "subscription_plans_associationId_fkey";

-- DropForeignKey: subscription_plans -> member_types
ALTER TABLE "subscription_plans" DROP CONSTRAINT "subscription_plans_memberTypeId_fkey";

-- DropForeignKey: subscriptions -> subscription_plans
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- DropForeignKey: subscriptions -> subscription_plan_versions
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planVersionId_fkey";

-- DropForeignKey: subscriptions -> users
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- AlterTable: add waivedBy to contribution_periods
ALTER TABLE "contribution_periods" ADD COLUMN "waivedBy" TEXT;

-- AlterTable: update defaults from schema changes
ALTER TABLE "dsar_tickets" ALTER COLUMN "responseDeadline" SET DEFAULT (NOW() + INTERVAL '21 days');

ALTER TABLE "users" ALTER COLUMN "mobile" DROP NOT NULL,
ALTER COLUMN "designation" DROP NOT NULL,
ALTER COLUMN "dataRetentionUntil" SET DEFAULT (NOW() + INTERVAL '7 years');

-- Drop indexes on tables to be renamed (recreated with new names below)
DROP INDEX IF EXISTS "subscription_plans_associationId_idx";
DROP INDEX IF EXISTS "subscription_plans_associationId_name_key";
DROP INDEX IF EXISTS "subscription_plan_versions_planId_idx";

-- DropTable: subscription_billing_history (dropping with all data)
DROP TABLE "subscription_billing_history";

-- DropTable: subscriptions (dropping with all data)
DROP TABLE "subscriptions";

-- RenameTable: subscription_plans -> plans
ALTER TABLE "subscription_plans" RENAME TO "plans";

-- RenameTable: subscription_plan_versions -> plan_versions
ALTER TABLE "subscription_plan_versions" RENAME TO "plan_versions";

-- Recreate indexes with new table names
CREATE INDEX "plans_associationId_idx" ON "plans"("associationId");
CREATE UNIQUE INDEX "plans_associationId_name_key" ON "plans"("associationId", "name");
CREATE INDEX "plan_versions_planId_idx" ON "plan_versions"("planId");

-- AddForeignKey: plans -> associations
ALTER TABLE "plans" ADD CONSTRAINT "plans_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: plans -> member_types
ALTER TABLE "plans" ADD CONSTRAINT "plans_memberTypeId_fkey" FOREIGN KEY ("memberTypeId") REFERENCES "member_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: plan_versions -> plans
ALTER TABLE "plan_versions" ADD CONSTRAINT "plan_versions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
