# Design: Plan Change → ContributionPeriod Handling

**Status:** APPROVED
**Date:** 2026-06-06
**Approach:** Backfill at change time + stop overwriting existing periods

## Constraints (Approved)

- **Timing:** Plan changes take effect at the **start of the next calendar month**
- **Upgrade vs downgrade:** Treated equally — same rule applies
- **Existing unpaid periods:** Left unchanged — amount locked at creation time

## Design

### Change 1: `contribution.service.ts` — `generateUserContributions`

**Current:** When a `ContributionPeriod` already exists for `(userId, year, month)`, it overwrites `expectedAmount`, `dueAmount`, `status` with the user's current subscription plan amount.

**New:** Skip existing periods entirely. The amount is locked in at creation time. Future re-generation calls never mutate existing records.

### Change 2: `subscription.service.ts` — `upgradeSubscription`

**Current:** Switches `planVersionId` without considering ContributionPeriods. If the current month's period hasn't been generated yet, it would be generated at the **new** plan's rate.

**New:** Before switching `planVersionId`, call `generateUserContributions` to backfill any missing periods up to and including the current month. Since `planVersionId` still points to the old plan at this point, these periods are created at the **old** rate. Then switch the subscription.

## Example Flow

User on ₹500 plan, upgrades to ₹1000 plan on Feb 15:

1. `generateUserContributions` is called for Jan+Feb with ₹500 plan still active
2. Jan period already exists → skipped (Change 1)
3. Feb period doesn't exist → created at ₹500
4. `planVersionId` switched to ₹1000 plan
5. March cron runs → creates March period at ₹1000
6. Feb stays at ₹500 ✅

## Files Changed

| File                                                          | Change                                               |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| `src/features/contributions/services/contribution.service.ts` | Skip existing periods in `generateUserContributions` |
| `src/features/subscriptions/services/subscription.service.ts` | Backfill missing periods before plan switch          |
| `src/__tests__/routes/subscriptions.upgrade.test.ts`          | New — integration tests                              |
