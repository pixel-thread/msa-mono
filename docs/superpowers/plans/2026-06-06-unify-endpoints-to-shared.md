# Unify API Endpoints to `@repo/shared` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all local/feature-level API endpoint constants in `apps/web` and `apps/mobile` with the canonical `ENDPOINTS` object from `@repo/shared`, then delete the local definitions.

**Architecture:** Each apps/web and apps/mobile feature currently defines its own endpoint constants in a `utils/constants/endpoints.ts` file. All of these paths already exist in the shared `ENDPOINTS` object. Each feature is migrated independently — replace imports in all consumer hooks, update query-param handling to use `buildUrlWithQuery`, remove the local endpoints file.

**Tech Stack:** `@repo/shared` (ENDPOINTS, buildUrlWithQuery), `http` client (web/mobile), TypeScript, React Query

---

## Pre-Flight: Mapping Reference

All local endpoint constants map to shared `ENDPOINTS.*` keys. Key naming differences:

| Local Naming Convention | Shared Convention |
|---|---|
| `camelCase` properties (e.g. `authEndpoints.signIn`) | `UPPER_SNAKE_CASE` (e.g. `ENDPOINTS.AUTH.SIGNIN`) |
| Query params baked into path strings | Separate `buildUrlWithQuery(endpoint, { page, ... })` |
| `camelCase` nested groups (e.g. `meetingsEndpoints.attendees.base`) | `UPPER_SNAKE_CASE` nested groups (e.g. `MEETINGS.ATTENDEES.LIST`) |

### Import Pattern (all migrated files use this)

```typescript
import { ENDPOINTS, buildUrlWithQuery } from '@repo/shared';
import http from '@src/shared/utils/http'; // or mobile equivalent
```

### Query Param Pattern

```typescript
// OLD: list: (page = 1) => `/meetings?page=${page}`
// useMeetings.tsx: http.get(meetingsEndpoints.list(page))

// NEW: ENDPOINTS.MEETINGS.LIST = '/meetings'
// useMeetings.tsx: http.get(buildUrlWithQuery(ENDPOINTS.MEETINGS.LIST, { page }))
```

---

## Phase 1: Apps/Web — Migrate All Features

Each task in this phase is independent and can be executed in parallel. Per-task work:
1. Update imports in all consumer hooks (show exact before/after for each)
2. If any local endpoint had baked-in query params, switch to `buildUrlWithQuery`
3. Delete the local `utils/constants/endpoints.ts` file
4. If the feature has a `utils/constants/index.ts` barrel that re-exports endpoints, clean that up
5. Run TypeScript check to confirm

### Task 1.1: web — Auth

**Files to modify (hooks):**
- `apps/web/src/features/auth/hooks/use-sign-in.ts`
- `apps/web/src/features/auth/hooks/use-sign-up.ts`
- `apps/web/src/features/auth/hooks/use-sign-out.ts`
- `apps/web/src/features/auth/hooks/use-forgot-password.ts`
- `apps/web/src/features/auth/hooks/use-reset-password.ts`
- `apps/web/src/features/auth/hooks/use-change-password.ts`
- `apps/web/src/features/auth/hooks/use-verify-mfa.ts`

**File to delete:**
- `apps/web/src/features/auth/utils/constants/endpoints.ts`

**Mapping (local → shared):**

| Local Property | Shared Key |
|---|---|
| `authEndpoints.signIn` | `ENDPOINTS.AUTH.SIGNIN` |
| `authEndpoints.signInResendMfa` | `ENDPOINTS.AUTH.SIGNIN_RESEND` |
| `authEndpoints.signInVerifyMfa` | `ENDPOINTS.AUTH.SIGNIN_VERIFY` |
| `authEndpoints.signUp` | `ENDPOINTS.AUTH.SIGNUP` |
| `authEndpoints.mfaDisable` | `ENDPOINTS.AUTH.MFA_DISABLE` |
| `authEndpoints.mfaSetup` | `ENDPOINTS.AUTH.MFA_SETUP` |
| `authEndpoints.mfaResend` | `ENDPOINTS.AUTH.MFA_RESEND` |
| `authEndpoints.mfaVerify` | `ENDPOINTS.AUTH.MFA_VERIFY` |
| `authEndpoints.logout` | `ENDPOINTS.AUTH.LOGOUT` |
| `authEndpoints.refresh` | `ENDPOINTS.AUTH.REFRESH` |
| `authEndpoints.changePassword` | `ENDPOINTS.AUTH.CHANGE_PASSWORD` |
| `authEndpoints.forgotPassword` | `ENDPOINTS.AUTH.FORGOT_PASSWORD` |
| `authEndpoints.resetPassword` | `ENDPOINTS.AUTH.RESET_PASSWORD` |
| `authEndpoints.me` | `ENDPOINTS.AUTH.ME` |

**Example before/after (use-sign-in.ts):**

```typescript
// BEFORE
import { authEndpoints } from '../utils/constants/endpoints';
// ...
mutationFn: (data) => http.post(authEndpoints.signIn, data),

// AFTER
import { ENDPOINTS } from '@repo/shared';
// ...
mutationFn: (data) => http.post(ENDPOINTS.AUTH.SIGNIN, data),
```

**Check for `utils/constants/index.ts` barrel:** read it — if it re-exports `authEndpoints`, remove that line.

**Verify:** Run `npx tsc --noEmit` in apps/web.

---

### Task 1.2: web — Announcements

**Files to modify (hooks):**
- `apps/web/src/features/announcement/hooks/useAnnouncementsList.ts`
- `apps/web/src/features/announcement/hooks/useAnnouncement.ts`
- `apps/web/src/features/announcement/hooks/useCreateAnnouncement.ts`
- `apps/web/src/features/announcement/hooks/useUpdateAnnouncement.ts`
- `apps/web/src/features/announcement/hooks/useDeleteAnnouncement.ts`
- `apps/web/src/features/announcement/hooks/useMarkAnnouncementRead.ts`
- `apps/web/src/features/announcement/hooks/useUploadAnnouncementImage.ts`

**File to delete:**
- `apps/web/src/features/announcement/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `announcementEndpoints.base` | `ENDPOINTS.ANNOUNCEMENTS.ROOT` |
| `announcementEndpoints.byId(id)` | `ENDPOINTS.ANNOUNCEMENTS.DETAILS(id)` |
| `announcementEndpoints.upload(id)` | `ENDPOINTS.ANNOUNCEMENTS.UPLOAD(id)` |
| `announcementEndpoints.read(id)` | `ENDPOINTS.ANNOUNCEMENTS.READ(id)` |
| `announcementEndpoints.list(page, status?)` | Replace with `buildUrlWithQuery(ENDPOINTS.ANNOUNCEMENTS.ROOT, { page, status })` |

**Example (useAnnouncementsList.ts):**

```typescript
// BEFORE
import { announcementEndpoints } from '../utils/constants/endpoints';
const url = announcementEndpoints.list(page, status);

// AFTER
import { ENDPOINTS, buildUrlWithQuery } from '@repo/shared';
const url = buildUrlWithQuery(ENDPOINTS.ANNOUNCEMENTS.ROOT, { page, status });
```

---

### Task 1.3: web — Associations

**Files to modify (hooks):**
- `apps/web/src/features/associations/hooks/useAssociationsList.ts`
- `apps/web/src/features/associations/hooks/useCreateAssociation.ts`
- `apps/web/src/features/associations/hooks/useUpdateAssociation.ts`
- `apps/web/src/features/associations/hooks/useDeactivateAssociation.ts`
- `apps/web/src/features/associations/hooks/useUploadAssociationLogo.ts`

**File to delete:**
- `apps/web/src/features/associations/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `associationsEndpoints.current` | `ENDPOINTS.ASSOCIATIONS.CURRENT` |
| `associationsEndpoints.base` | `ENDPOINTS.ASSOCIATIONS.ROOT` |
| `associationsEndpoints.admin` | `ENDPOINTS.ADMIN.ASSOCIATIONS` |
| `associationsEndpoints.byId(id)` | `ENDPOINTS.ASSOCIATIONS.DETAIL(id)` |
| `associationsEndpoints.deactivate(id)` | `ENDPOINTS.ASSOCIATIONS.DEACTIVATE(id)` |
| `associationsEndpoints.logo(id)` | `ENDPOINTS.ASSOCIATIONS.LOGO(id)` |

---

### Task 1.4: web — Compliance

**Files to modify (hooks):**
- `apps/web/src/features/compliance/hooks/useComplianceChecks.ts`
- `apps/web/src/features/compliance/hooks/useComplianceCheckDetail.ts`
- `apps/web/src/features/compliance/hooks/useComplianceEvidence.ts`
- `apps/web/src/features/compliance/hooks/useTriggerComplianceCheck.ts`
- `apps/web/src/features/compliance/hooks/useDeleteComplianceCheck.ts`

**File to delete:**
- `apps/web/src/features/compliance/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `complianceEndpoints.checks` | `ENDPOINTS.COMPLIANCE.CHECKS` |
| `complianceEndpoints.checkById(id)` | `ENDPOINTS.COMPLIANCE.CHECK_DETAIL(id)` |
| `complianceEndpoints.evidence` | `ENDPOINTS.COMPLIANCE.EVIDENCE` |

---

### Task 1.5: web — Consent

**Files to modify (hooks):**
- `apps/web/src/features/consent/hooks/useConsentRecords.ts`
- `apps/web/src/features/consent/hooks/useConsentReport.ts`
- `apps/web/src/features/consent/hooks/useUserConsentHistory.ts`
- `apps/web/src/features/consent/hooks/useUpdateConsentReceipt.ts`
- `apps/web/src/features/consent/hooks/useDeleteConsentReceipt.ts`

**File to delete:**
- `apps/web/src/features/consent/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `consentEndpoints.all` | `ENDPOINTS.CONSENT.ALL` |
| `consentEndpoints.report` | `ENDPOINTS.CONSENT.REPORT` |
| `consentEndpoints.userHistory(userId)` | `ENDPOINTS.CONSENT.USER_CONSENTS(userId)` |
| `consentEndpoints.byId(id)` | `ENDPOINTS.CONSENT.RECEIPT(id)` |

---

### Task 1.6: web — Contributions (partial — local uses `declarationEndpoints`)

**Files to modify:**
- `apps/web/src/features/contributions/hooks/declarations/use-declaration-mutations.ts`

This file already imports `ENDPOINTS` from `@repo/shared` alongside the local `declarationEndpoints`. The local import of `declarationEndpoints` should be removed — replace usages with `ENDPOINTS.CONTRIBUTION.*` equivalents.

**Files to delete:**
- `apps/web/src/features/contributions/utils/constants/endpoints.ts`

**Mapping for `declarationEndpoints`:**

| Local Property | Shared Key |
|---|---|
| `declarationEndpoints.list` | `ENDPOINTS.CONTRIBUTION.DECLARATIONS` |
| `declarationEndpoints.byId(id)` | `ENDPOINTS.CONTRIBUTION.DECLARATION(id)` |
| `declarationEndpoints.approve(id)` | `ENDPOINTS.CONTRIBUTION.APPROVE_DECLARATION(id)` |
| `declarationEndpoints.reject(id)` | `ENDPOINTS.CONTRIBUTION.REJECT_DECLARATION(id)` |

**Mapping for `contributionEndpoints`:** Note that local paths use `/payments/contributions` while shared uses `/contributions`. The shared is the source of truth — trust it. If `createPayment` was used anywhere:
- `contributionEndpoints.createPayment` (`/contributions/payments`) → `ENDPOINTS.CONTRIBUTION.CREATE_PAYMENT` (`/contributions/record`)
- ⚠️ **Note:** These are different paths. Verify with backend that `/contributions/record` is the correct endpoint and that the old `/contributions/payments` was wrong (or update the shared constant if the local one was correct).

---

### Task 1.7: web — DSAR

**Files to modify (hooks):**
- `apps/web/src/features/dsar/hooks/useDsarTickets.ts`
- `apps/web/src/features/dsar/hooks/useDsarTicketDetail.ts`
- `apps/web/src/features/dsar/hooks/useRespondToDsarTicket.ts`
- `apps/web/src/features/dsar/hooks/useRejectDsarTicket.ts`
- `apps/web/src/features/dsar/hooks/useAssignDsarTicket.ts`
- `apps/web/src/features/dsar/hooks/useDeleteDsarTicket.ts`
- `apps/web/src/features/dsar/hooks/useDsarSlaReport.ts`

**File to delete:**
- `apps/web/src/features/dsar/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `dsarEndpoints.base` | `ENDPOINTS.DSAR.LIST` |
| `dsarEndpoints.byId(id)` | `ENDPOINTS.DSAR.DETAIL(id)` |
| `dsarEndpoints.respond(id)` | `ENDPOINTS.DSAR.RESPOND(id)` |
| `dsarEndpoints.reject(id)` | `ENDPOINTS.DSAR.REJECT(id)` |
| `dsarEndpoints.assign(id)` | `ENDPOINTS.DSAR.ASSIGN(id)` |
| `dsarEndpoints.slaReport` | `ENDPOINTS.DSAR.SLA_REPORT` |

---

### Task 1.8: web — Ledger

**Files to modify (hooks):**
- `apps/web/src/features/ledger/hooks/useLedgerAccounts.ts`
- `apps/web/src/features/ledger/hooks/useLedgerAccount.ts`
- `apps/web/src/features/ledger/hooks/useCreateAccount.ts`
- `apps/web/src/features/ledger/hooks/useUpdateAccount.ts`
- `apps/web/src/features/ledger/hooks/use-delete-ledger-account.ts`
- `apps/web/src/features/ledger/hooks/useLedgerEntries.ts`
- `apps/web/src/features/ledger/hooks/useCreateEntry.ts`
- `apps/web/src/features/ledger/hooks/useApproveEntry.ts`
- `apps/web/src/features/ledger/hooks/useRejectEntry.ts`
- `apps/web/src/features/ledger/hooks/useLedgerSummary.ts`
- `apps/web/src/features/ledger/hooks/useSeedAccounts.ts`
- `apps/web/src/features/ledger/hooks/useTrialBalance.ts`
- `apps/web/src/features/ledger/hooks/useIncomeStatement.ts`

**File to delete:**
- `apps/web/src/features/ledger/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `ledgerEndpoints.entries` | `ENDPOINTS.LEDGER.ENTRIES` |
| `ledgerEndpoints.accounts` | `ENDPOINTS.LEDGER.ACCOUNTS` |
| `ledgerEndpoints.summary` | `ENDPOINTS.LEDGER.SUMMARY` |
| `ledgerEndpoints.seedAccounts` | `ENDPOINTS.LEDGER.SEED_ACCOUNTS` |
| `ledgerEndpoints.rejectEntry(id)` | `ENDPOINTS.LEDGER.REJECT_ENTRY(id)` |
| `ledgerEndpoints.approveEntry(id)` | `ENDPOINTS.LEDGER.APPROVE_ENTRY(id)` |
| `ledgerEndpoints.updateAccount(id)` / `ledgerEndpoints.accountsDetails(id)` | `ENDPOINTS.LEDGER.ACCOUNT_DETAIL(id)` |
| `ledgerEndpoints.trialBalance` | `ENDPOINTS.LEDGER.TRIAL_BALANCE` |
| `ledgerEndpoints.incomeStatement` | `ENDPOINTS.LEDGER.INCOME_STATEMENT` |

---

### Task 1.9: web — Member Types

**Files to modify (hooks):**
- `apps/web/src/features/member-type/hooks/useMemberTypesList.ts`
- `apps/web/src/features/member-type/hooks/useCreateMemberType.ts`
- `apps/web/src/features/member-type/hooks/useUpdateMemberType.ts`
- `apps/web/src/features/member-type/hooks/useDeleteMemberType.ts`

**File to delete:**
- `apps/web/src/features/member-type/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `memberTypeEndpoints.base` | `ENDPOINTS.MEMBER_TYPES.ROOT` |
| `memberTypeEndpoints.byId(id)` | `ENDPOINTS.MEMBER_TYPES.DETAIL(id)` |

---

### Task 1.10: web — Members

**Files to modify (hooks):**
- `apps/web/src/features/members/hooks/useMembers.ts`
- `apps/web/src/features/members/hooks/useMember.ts`
- `apps/web/src/features/members/hooks/useMemberTypes.ts`
- `apps/web/src/features/members/hooks/useApproveMember.ts`
- `apps/web/src/features/members/hooks/useRejectMember.ts`
- `apps/web/src/features/members/hooks/useUpdateMemberRole.ts`
- `apps/web/src/features/members/hooks/useUpdateMemberStatus.ts`
- `apps/web/src/features/members/hooks/useUpdateMemberAssociation.ts`

**File to delete:**
- `apps/web/src/features/members/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `membersEndpoints.list(page, status)` | Replace with `buildUrlWithQuery(ENDPOINTS.MEMBERS.ROOT, { page, status })` |
| `membersEndpoints.byId(id)` | `ENDPOINTS.MEMBERS.DETAILS(id)` |
| `membersEndpoints.status(id)` | `ENDPOINTS.MEMBERS.STATUS(id)` |
| `membersEndpoints.role(id)` | `ENDPOINTS.MEMBERS.ROLE(id)` |
| `membersEndpoints.types` | `ENDPOINTS.MEMBER_TYPES.ROOT` |
| `membersEndpoints.applications.approve(id)` | `ENDPOINTS.ADMIN.MEMBERSHIP_APPLICATION_APPROVE(id)` |
| `membersEndpoints.applications.reject(id)` | `ENDPOINTS.ADMIN.MEMBERSHIP_APPLICATION_REJECT(id)` |

---

### Task 1.11: web — Membership Applications

**Files to modify (hooks):**
- `apps/web/src/features/membership-applications/hooks/useMembershipApplications.ts`
- `apps/web/src/features/membership-applications/hooks/useApproveApplication.ts`
- `apps/web/src/features/membership-applications/hooks/useRejectApplication.ts`

**File to delete:**
- `apps/web/src/features/membership-applications/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `membershipApplicationEndpoints.base` | `ENDPOINTS.ADMIN.MEMBERSHIP_APPLICATIONS` |
| `membershipApplicationEndpoints.approve(id)` | `ENDPOINTS.ADMIN.MEMBERSHIP_APPLICATION_APPROVE(id)` |
| `membershipApplicationEndpoints.reject(id)` | `ENDPOINTS.ADMIN.MEMBERSHIP_APPLICATION_REJECT(id)` |

---

### Task 1.12: web — Meetings

**Files to modify (hooks):**
- `apps/web/src/features/meetings/hooks/useMeetings.ts`
- `apps/web/src/features/meetings/hooks/useMeetingDetail.ts`
- `apps/web/src/features/meetings/hooks/useAttendees.ts`
- `apps/web/src/features/meetings/hooks/useMeetingAttendees.ts`
- `apps/web/src/features/meetings/hooks/useMeetingMinutes.ts`
- `apps/web/src/features/meetings/hooks/useRsvp.ts`

**File to delete:**
- `apps/web/src/features/meetings/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `meetingsEndpoints.base` | `ENDPOINTS.MEETINGS.LIST` |
| `meetingsEndpoints.list(page)` | Replace with `buildUrlWithQuery(ENDPOINTS.MEETINGS.LIST, { page })` |
| `meetingsEndpoints.byId(id)` | `ENDPOINTS.MEETINGS.DETAIL(id)` |
| `meetingsEndpoints.rsvp(id)` | `ENDPOINTS.MEETINGS.RSVP(id)` |
| `meetingsEndpoints.attendees.base(meetingId)` | `ENDPOINTS.MEETINGS.ATTENDEES.LIST(meetingId)` |
| `meetingsEndpoints.attendees.byId(meetingId, userId)` | `ENDPOINTS.MEETINGS.ATTENDEES.DETAIL(meetingId, userId)` |
| `meetingsEndpoints.minutes.base(meetingId)` | `ENDPOINTS.MEETINGS.MINUTES.LIST(meetingId)` |
| `meetingsEndpoints.minutes.byId(meetingId, minuteId)` | `ENDPOINTS.MEETINGS.MINUTES.DETAIL(meetingId, minuteId)` |

---

### Task 1.13: web — Payments

**Files to modify (hooks):**
- `apps/web/src/features/payments/hooks/usePayments.ts`
- `apps/web/src/features/payments/hooks/usePaymentDetail.ts`
- `apps/web/src/features/payments/hooks/usePaymentProviders.ts`
- `apps/web/src/features/payments/hooks/useToggleActivatePaymentProvider.ts`
- `apps/web/src/features/payments/hooks/useRazorpayCheckout.ts`
- `apps/web/src/features/payments/hooks/useUserPayments.ts`
- `apps/web/src/features/payments/hooks/useMemberSearch.ts`

**File to delete:**
- `apps/web/src/features/payments/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `paymentEndpoints.base` | `ENDPOINTS.PAYMENTS.LIST` |
| `paymentEndpoints.byId(id)` | `ENDPOINTS.PAYMENTS.DETAIL(id)` |
| `paymentEndpoints.providers` | `ENDPOINTS.PAYMENTS.PROVIDERS.LIST` |
| `paymentEndpoints.providerById(id)` | `ENDPOINTS.PAYMENTS.PROVIDERS.DETAIL(id)` |
| `paymentEndpoints.activateProvider(id)` | `ENDPOINTS.PAYMENTS.PROVIDERS.ACTIVATE(id)` |
| `paymentEndpoints.testVerify(id)` | `ENDPOINTS.PAYMENTS.PROVIDERS.TEST_VERIFY(id)` |
| `paymentEndpoints.userPayments(userId, page)` | Replace with `buildUrlWithQuery(ENDPOINTS.PAYMENTS.USERS.BY_ID(userId), { page })` |
| `paymentEndpoints.memberSearch(query)` | Replace with `buildUrlWithQuery(ENDPOINTS.MEMBERS.ROOT, { search: query })` |

---

### Task 1.14: web — Subscriptions

**Files to modify (hooks):**
- `apps/web/src/features/subscriptions/hooks/usePlans.ts`
- `apps/web/src/features/subscriptions/hooks/usePlan.ts`
- `apps/web/src/features/subscriptions/hooks/useMySubscription.ts`
- `apps/web/src/features/subscriptions/hooks/useSubscribe.ts`
- `apps/web/src/features/subscriptions/hooks/useChangePlan.ts`
- `apps/web/src/features/subscriptions/hooks/useWaiveSubscription.ts`
- `apps/web/src/features/subscriptions/hooks/useSetDefaultPlan.ts`
- `apps/web/src/features/subscriptions/hooks/useCreatePlan.ts`
- `apps/web/src/features/subscriptions/hooks/useUpdatePlan.ts`
- `apps/web/src/features/subscriptions/hooks/useDeletePlan.ts`

**File to delete:**
- `apps/web/src/features/subscriptions/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `subscriptionEndpoints.plans` | `ENDPOINTS.SUBSCRIPTIONS.PLANS` |
| `subscriptionEndpoints.plansList(page)` | Replace with `buildUrlWithQuery(ENDPOINTS.SUBSCRIPTIONS.PLANS, { page })` |
| `subscriptionEndpoints.planById(id)` | `ENDPOINTS.SUBSCRIPTIONS.PLAN_DETAILS(id)` |
| `subscriptionEndpoints.default` | `ENDPOINTS.SUBSCRIPTIONS.PLANS_DEFAULT` |
| `subscriptionEndpoints.my` | `ENDPOINTS.SUBSCRIPTIONS.MY` |
| `subscriptionEndpoints.myList(page)` | Replace with `buildUrlWithQuery(ENDPOINTS.SUBSCRIPTIONS.MY, { page })` |
| `subscriptionEndpoints.subscribe` | `ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE` |
| `subscriptionEndpoints.upgrade` | `ENDPOINTS.SUBSCRIPTIONS.UPGRADE` |
| `subscriptionEndpoints.waive` | `ENDPOINTS.SUBSCRIPTIONS.WAIVE` |
| `subscriptionEndpoints.userSubscription(userId)` | `ENDPOINTS.SUBSCRIPTIONS.USER(userId)` |

---

### Task 1.15: web — Training

**Files to modify (hooks):**
- `apps/web/src/features/training/hooks/useTrainingModules.ts`
- `apps/web/src/features/training/hooks/useCreateTrainingModule.ts`
- `apps/web/src/features/training/hooks/useUpdateTrainingModule.ts`
- `apps/web/src/features/training/hooks/useDeleteTrainingModule.ts`
- `apps/web/src/features/training/hooks/useModuleAssignedUsers.ts`
- `apps/web/src/features/training/hooks/supplements/useTrainingSupplements.ts`
- `apps/web/src/features/training/hooks/supplements/useCreateTrainingSupplement.ts`
- `apps/web/src/features/training/hooks/supplements/useUpdateTrainingSupplement.ts`
- `apps/web/src/features/training/hooks/supplements/useDeleteTrainingSupplement.ts`
- `apps/web/src/features/training/hooks/assignments/useAssignTrainingModule.ts`
- `apps/web/src/features/training/hooks/assignments/useBulkAssignTrainingModule.ts`
- `apps/web/src/features/training/hooks/assignments/useBulkRemoveTrainingAssignment.ts`
- `apps/web/src/features/training/hooks/assignments/useRemoveTrainingAssignment.ts`
- `apps/web/src/features/training/hooks/assignments/useTrainingAssignmentsQuery.ts`
- `apps/web/src/features/training/hooks/completions/useTrainingCompletions.ts`
- `apps/web/src/features/training/hooks/certificates/useTrainingCertificates.ts`
- `apps/web/src/features/training/hooks/certificates/useCreateTrainingCertificate.ts`
- `apps/web/src/features/training/hooks/certificates/useDeleteTrainingCertificate.ts`
- `apps/web/src/features/training/hooks/certificates/useUploadCertificateTemplate.ts`

**File to delete:**
- `apps/web/src/features/training/utils/constants/endpoints.ts`
- `apps/web/src/features/training/utils/constants/index.ts` (if it only re-exports endpoints)

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `trainingEndpoints.base` | `ENDPOINTS.TRAINING.MODULES` |
| `trainingEndpoints.byId(id)` | `ENDPOINTS.TRAINING.MODULE_DETAIL(id)` |
| `trainingEndpoints.supplements.list(moduleId, page?)` | Replace with `buildUrlWithQuery(ENDPOINTS.TRAINING.MODULE_SUPPLEMENTS(moduleId), { page })` |
| `trainingEndpoints.supplements.byId(moduleId, supplementId)` | `ENDPOINTS.TRAINING.MODULE_SUPPLEMENT_DETAIL(moduleId, supplementId)` |
| `trainingEndpoints.assignments.base(moduleId, page?)` | Replace with `buildUrlWithQuery(ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId), { page })` |
| `trainingEndpoints.assignedUsers.list(moduleId, page?)` | Replace with `buildUrlWithQuery(ENDPOINTS.TRAINING.MODULE_ASSIGNED_USERS(moduleId), { page })` |
| `trainingEndpoints.assignedUsers.complete(moduleId, userId)` | `ENDPOINTS.TRAINING.MODULE_COMPLETE_USER(moduleId, userId)` |
| `trainingEndpoints.completions.byId(id)` | `ENDPOINTS.TRAINING.MODULE_COMPLETE(id)` |
| `trainingEndpoints.completions.all()` | `ENDPOINTS.TRAINING.COMPLETIONS` |
| `trainingEndpoints.certificates.list(moduleId)` | `ENDPOINTS.TRAINING.MODULE_CERTIFICATES(moduleId)` |
| `trainingEndpoints.certificates.byId(moduleId, certificateId)` | `ENDPOINTS.TRAINING.MODULE_CERTIFICATE_DETAIL(moduleId, certificateId)` |
| `trainingEndpoints.certificates.template(moduleId)` | `ENDPOINTS.TRAINING.MODULE_CERTIFICATE_TEMPLATE(moduleId)` |

Note: Web training hooks import from `'../utils/constants'` (barrel index.ts), so also check `apps/web/src/features/training/utils/constants/index.ts` and remove `trainingEndpoints` from its re-exports.

---

### Task 1.16: web — Shared `sharedEndpoints`

**Files to modify:**
- `apps/web/src/shared/stores/auth/index.ts` — replaces `sharedEndpoints.auth.me` with `ENDPOINTS.AUTH.ME`, etc.

**Files to delete:**
- `apps/web/src/shared/constants/endpoints.ts`

**Check:** `apps/web/src/shared/constants/index.ts` — if it re-exports from `'./endpoints'`, remove that line.

---

### Task 1.17: web — Routes file (`routes.ts`)

**File to modify (consider):** `apps/web/src/shared/constants/routes.ts` contains hardcoded paths like `'/api/auth/refresh'`, `'/api/auth/sign-up'`, etc. in `API_PUBLIC_ROUTES`. These are used by middleware for access control, not for API calls. Consider whether these should reference `ENDPOINTS` too, but note these include the `/api/` prefix while `ENDPOINTS` paths do not. **Low priority — defer unless explicitly requested.**

---

## Phase 2: Apps/Mobile — Migrate All Features

The mobile app has two levels of endpoint files:
1. **Feature-level** files in each feature's `utils/constants/endpoints.ts`
2. **A central aggregated file** at `apps/mobile/src/shared/constants/endpoints.ts` that also defines many endpoints

The central file must be handled last, after all feature-level migrations are complete. For mobile, the plan is:
1. Migrate each feature-level endpoint file first (importers use `'../utils/constants'` barrel or `'../utils/constants/endpoints'`)
2. After all features are done, update the central shared file's consumers and delete it
3. Clean up the `@constants/endpoints` alias usage

### Task 2.1: mobile — Auth

**Files to modify:**
- `apps/mobile/src/features/auth/hooks/use-sign-in.ts`
- `apps/mobile/src/features/auth/hooks/use-sign-up.ts`
- `apps/mobile/src/features/auth/hooks/use-sign-in-verify.ts`
- `apps/mobile/src/features/auth/hooks/use-resend-sign-in-verify-code.ts`

**File to delete:**
- `apps/mobile/src/features/auth/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `authEndpoints.signIn` | `ENDPOINTS.AUTH.SIGNIN` |
| `authEndpoints.signInVerify` | `ENDPOINTS.AUTH.SIGNIN_VERIFY` |
| `authEndpoints.signUp` | `ENDPOINTS.AUTH.SIGNUP` |
| `authEndpoints.resendSignInVerifyCode` | `ENDPOINTS.AUTH.SIGNIN_RESEND` |
| `authEndpoints.forgotPassword` | `ENDPOINTS.AUTH.FORGOT_PASSWORD` |
| `authEndpoints.resetPassword` | `ENDPOINTS.AUTH.RESET_PASSWORD` |
| `authEndpoints.signOut` | `ENDPOINTS.AUTH.LOGOUT` |

**Check barrel:** `apps/mobile/src/features/auth/utils/constants/index.ts` — remove `authEndpoints` from re-exports.

---

### Task 2.2: mobile — Announcements

**Files to modify:**
- `apps/mobile/src/features/announcements/hooks/use-announcements.ts`
- `apps/mobile/src/features/announcements/hooks/use-announcement.ts`
- `apps/mobile/src/features/announcements/hooks/use-mark-annoucement-read.ts`

**File to delete:**
- `apps/mobile/src/features/announcements/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `announcementEndpoints.list` | `ENDPOINTS.ANNOUNCEMENTS.ROOT` |
| `announcementEndpoints.detail(id)` | `ENDPOINTS.ANNOUNCEMENTS.DETAILS(id)` |
| `announcementEndpoints.markReadAnnouncement(id)` | `ENDPOINTS.ANNOUNCEMENTS.READ(id)` |

---

### Task 2.3: mobile — Compliance

**Files to modify:**
- `apps/mobile/src/features/compliance/hooks/use-compliance-mutations.ts`
- `apps/mobile/src/features/compliance/hooks/use-compliance-detail.ts`
- `apps/mobile/src/features/compliance/hooks/use-my-compliance.ts`

**File to delete:**
- `apps/mobile/src/features/compliance/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `complianceEndpoints.submit` / `ENDPOINTS.COMPLIANCE.LIST` | `ENDPOINTS.COMPLIANCE.LIST` (or `ENDPOINTS.COMPLIANCE.CREATE` for POST) |
| `complianceEndpoints.my` | `ENDPOINTS.COMPLIANCE.MY_LIST` |
| `complianceEndpoints.myDetail(id)` | `ENDPOINTS.COMPLIANCE.MY_DETAIL(id)` |

---

### Task 2.4: mobile — Consent

**Files to modify:**
- `apps/mobile/src/features/consent/hooks/use-my-consent.ts`
- `apps/mobile/src/features/consent/hooks/use-consent-history.ts`
- `apps/mobile/src/features/consent/hooks/use-consent-report.ts`
- `apps/mobile/src/features/consent/hooks/use-grant-consent.ts`
- `apps/mobile/src/features/consent/hooks/use-revoke-consent.ts`

**File to delete:**
- `apps/mobile/src/features/consent/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `consentEndpoints.my` | `ENDPOINTS.CONSENT.MY` |
| `consentEndpoints.history` | `ENDPOINTS.CONSENT.HISTORY` |
| `consentEndpoints.report` | `ENDPOINTS.CONSENT.REPORT` |
| `consentEndpoints.grant` | `ENDPOINTS.CONSENT.GRANT` |
| `consentEndpoints.revoke` | `ENDPOINTS.CONSENT.REVOKE` |

---

### Task 2.5: mobile — DSAR

**Files to modify:**
- `apps/mobile/src/features/dsar/hooks/use-dsar-mutations.ts`
- `apps/mobile/src/features/dsar/hooks/use-dsar.ts`

**File to delete:**
- `apps/mobile/src/features/dsar/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `dsarEndpoints.submit` | `ENDPOINTS.DSAR.SUBMIT` |
| `dsarEndpoints.my` | `ENDPOINTS.DSAR.MY_LIST` |
| `dsarEndpoints.myDetail(id)` | `ENDPOINTS.DSAR.MY_DETAIL(id)` |
| `dsarEndpoints.list` | `ENDPOINTS.DSAR.LIST` |
| `dsarEndpoints.detail(id)` | `ENDPOINTS.DSAR.DETAIL(id)` |
| `dsarEndpoints.respond(id)` | `ENDPOINTS.DSAR.RESPOND(id)` |
| `dsarEndpoints.assign(id)` | `ENDPOINTS.DSAR.ASSIGN(id)` |
| `dsarEndpoints.slaReport` | `ENDPOINTS.DSAR.SLA_REPORT` |

---

### Task 2.6: mobile — Invoice / Payments

**Files to modify:**
- `apps/mobile/src/features/invoice/hooks/use-invoices.ts` (may need reading first to confirm)

**File to delete:**
- `apps/mobile/src/features/invoice/utils/constants/endpoints.ts`

**Mapping (from central shared file's `paymentEndpoints`):**

| Local Property | Shared Key |
|---|---|
| `paymentEndpoints.get(id)` | `ENDPOINTS.PAYMENTS.DETAIL(id)` |
| `paymentEndpoints.receipt(id)` | `ENDPOINTS.PAYMENTS.RECEIPT(id)` |
| `paymentEndpoints.my` | `ENDPOINTS.PAYMENTS.MY` |
| `paymentEndpoints.stats` | `ENDPOINTS.PAYMENTS.STATS` |
| `paymentEndpoints.collectionsReport` | `ENDPOINTS.PAYMENTS.REPORTS.COLLECTIONS` |

---

### Task 2.7: mobile — Meetings

**Files to modify:**
- `apps/mobile/src/features/meetings/hooks/use-meetings.ts`
- `apps/mobile/src/features/meetings/hooks/use-meeting.ts`
- `apps/mobile/src/features/meetings/hooks/useMeetingAttendees.ts`
- `apps/mobile/src/features/meetings/hooks/useMeetingAgenda.ts`
- `apps/mobile/src/features/meetings/hooks/use-create-meeting-minute.ts`
- `apps/mobile/src/features/meetings/hooks/use-meeting-minute.ts`
- `apps/mobile/src/features/meetings/hooks/use-delete-meeting-minute.ts`
- `apps/mobile/src/features/meetings/hooks/use-update-attendee-rsvp.ts`

**File to delete:**
- `apps/mobile/src/features/meetings/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `meetingEndpoints.list(page?)` | Replace with `buildUrlWithQuery(ENDPOINTS.MEETINGS.LIST, { page })` |
| `meetingEndpoints.detail(id)` | `ENDPOINTS.MEETINGS.DETAIL(id)` |
| `meetingEndpoints.agenda(id)` | `ENDPOINTS.MEETINGS.AGENDA.LIST(id)` |
| `meetingEndpoints.attendees(id)` | `ENDPOINTS.MEETINGS.ATTENDEES.LIST(id)` |
| `meetingEndpoints.minutes(meetingId)` | `ENDPOINTS.MEETINGS.MINUTES.LIST(meetingId)` |
| `meetingEndpoints.minute(meetingId, minuteId)` | `ENDPOINTS.MEETINGS.MINUTES.DETAIL(meetingId, minuteId)` |
| `meetingEndpoints.rsvp(id)` | `ENDPOINTS.MEETINGS.RSVP(id)` |

---

### Task 2.8: mobile — Subscription

**Files to modify:**
- `apps/mobile/src/features/subscription/hooks/use-subscriptions.ts`
- `apps/mobile/src/features/subscription/hooks/use-payment-order.ts`
- `apps/mobile/src/features/subscription/hooks/use-verify-payment.ts`
- `apps/mobile/src/features/subscription/hooks/use-payment-history.ts`

**File to delete:**
- `apps/mobile/src/features/subscription/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `SubscriptionEndpoints.list()` | `ENDPOINTS.SUBSCRIPTIONS.PLANS` (note: uses `/subscriptions` rather than `/subscriptions/plans`) |
| `SubscriptionEndpoints.plans()` | `ENDPOINTS.SUBSCRIPTIONS.PLANS` |
| `SubscriptionEndpoints.paymentHistory()` | `ENDPOINTS.PAYMENTS.HISTORY` |
| `SubscriptionEndpoints.paymentOrder()` | `ENDPOINTS.PAYMENTS.RAZORPAY.CREATE_ORDER` |
| `SubscriptionEndpoints.verifyPayment()` | `ENDPOINTS.PAYMENTS.RAZORPAY.VERIFY` |

---

### Task 2.9: mobile — Training

**Files to modify:**
- `apps/mobile/src/features/training/hooks/use-training-modules.ts`
- `apps/mobile/src/features/training/hooks/use-training-module.ts`
- `apps/mobile/src/features/training/hooks/use-create-training-module.ts`
- `apps/mobile/src/features/training/hooks/use-update-training-module.ts`
- `apps/mobile/src/features/training/hooks/use-assign-training.ts`
- `apps/mobile/src/features/training/hooks/use-bulk-assign-training.ts`
- `apps/mobile/src/features/training/hooks/use-remove-training-assignment.ts`
- `apps/mobile/src/features/training/hooks/use-complete-training.ts`
- `apps/mobile/src/features/training/hooks/use-training-assignments.ts`
- `apps/mobile/src/features/training/hooks/use-training-supplements.ts`
- `apps/mobile/src/features/training/hooks/use-my-training-completions.ts`

**File to delete:**
- `apps/mobile/src/features/training/utils/constants/endpoints.ts`

**Mapping:**

| Local Property | Shared Key / Notes |
|---|---|
| `trainingEndpoints.modules` | `ENDPOINTS.TRAINING.MODULES` |
| `trainingEndpoints.getModule(id)` | `ENDPOINTS.TRAINING.MODULE_DETAIL(id)` |
| `trainingEndpoints.complete(id)` | `ENDPOINTS.TRAINING.MODULE_COMPLETE(id)` |
| `trainingEndpoints.myCompletions` | `ENDPOINTS.TRAINING.MY_COMPLETIONS` |
| `trainingEndpoints.myTrainings` | `ENDPOINTS.TRAINING.MY_ASSIGNMENTS` |
| `trainingEndpoints.assign(moduleId)` | `ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId)` |
| `trainingEndpoints.supplements(moduleId)` | `ENDPOINTS.TRAINING.MODULE_SUPPLEMENTS(moduleId)` |

---

### Task 2.10: mobile — Payment Providers

**Files to modify:**
- `apps/mobile/src/features/payment-providers/hooks/use-payment-providers.ts`
- `apps/mobile/src/features/payment-providers/hooks/use-payment-provider-mutations.ts`

**File to delete:**
- `apps/mobile/src/features/payment-providers/utils/constants.ts`

**Mapping:**

| Local Property | Shared Key |
|---|---|
| `paymentProviderEndpoints.list` | `ENDPOINTS.PAYMENTS.PROVIDERS.LIST` |
| `paymentProviderEndpoints.add` | `ENDPOINTS.PAYMENTS.PROVIDERS.CREATE` |
| `paymentProviderEndpoints.detail(id)` | `ENDPOINTS.PAYMENTS.PROVIDERS.DETAIL(id)` |
| `paymentProviderEndpoints.update(id)` | `ENDPOINTS.PAYMENTS.PROVIDERS.UPDATE(id)` |
| `paymentProviderEndpoints.delete(id)` | `ENDPOINTS.PAYMENTS.PROVIDERS.DELETE(id)` |
| `paymentProviderEndpoints.activate(id)` | `ENDPOINTS.PAYMENTS.PROVIDERS.ACTIVATE(id)` |

---

### Task 2.11: mobile — Dashboard

**Files to modify:**
- `apps/mobile/src/features/dashboard/hooks/use-dashboard.ts` (if exists)

**File to delete:**
- `apps/mobile/src/features/dashboard/utils/constants/endpoints.ts`

**Mapping:**
- `dashboardEndpoints.get(id)` → `ENDPOINTS.ANNOUNCEMENTS.DETAILS(id)` (it's an announcement endpoint despite being in dashboard)

---

### Task 2.12: mobile — Central Shared Endpoints File

**File:** `apps/mobile/src/shared/constants/endpoints.ts`

This is the biggest file and aggregates endpoints for many domains. After all feature-level migration tasks above are complete, delete this file.

**Consumers to update first:**
- `apps/mobile/src/shared/hooks/use-member-types.ts` — uses `memberTypeEndpoints.list`, `memberTypeEndpoints.get(id)` → `ENDPOINTS.MEMBER_TYPES.ROOT`, `ENDPOINTS.MEMBER_TYPES.DETAIL(id)`
- `apps/mobile/src/shared/hooks/use-association.ts` — uses `sharedEnpoint.associations.getCurrentAssociation` → `ENDPOINTS.ASSOCIATIONS.CURRENT`

**Check shell re-exports:**
- `apps/mobile/src/shared/constants/index.ts` — if it re-exports from `'./endpoints'`, remove that line
- Any `@constants/endpoints` alias in `tsconfig.json` paths that points to this file should be noted (may cause import errors if consumers remain)

---

## Phase 3: Cleanup & Verify

### Task 3.1: Remove barrel re-exports

Check each migrated feature's `utils/constants/index.ts` file. If it only re-exports the now-deleted `endpoints` module, delete the barrel file. If it re-exports other constants (like `QUERY_KEYS`), just remove the endpoints re-export line.

**Files to check (web):**
- `apps/web/src/features/auth/utils/constants/index.ts`
- `apps/web/src/features/announcement/utils/constants/index.ts`
- `apps/web/src/features/associations/utils/constants/index.ts`
- `apps/web/src/features/compliance/utils/constants/index.ts`
- `apps/web/src/features/consent/utils/constants/index.ts`
- `apps/web/src/features/contributions/utils/constants/index.ts`
- `apps/web/src/features/dsar/utils/constants/index.ts`
- `apps/web/src/features/ledger/utils/constants/index.ts`
- `apps/web/src/features/member-type/utils/constants/index.ts`
- `apps/web/src/features/members/utils/constants/index.ts`
- `apps/web/src/features/membership-applications/utils/constants/index.ts`
- `apps/web/src/features/meetings/utils/constants/index.ts`
- `apps/web/src/features/payments/utils/constants/index.ts`
- `apps/web/src/features/subscriptions/utils/constants/index.ts`
- `apps/web/src/features/training/utils/constants/index.ts`
- `apps/web/src/shared/constants/index.ts`

**Files to check (mobile):**
- `apps/mobile/src/features/auth/utils/constants/index.ts`
- `apps/mobile/src/features/announcements/utils/constants/index.ts`
- `apps/mobile/src/features/compliance/utils/constants/index.ts`
- `apps/mobile/src/features/consent/utils/constants/index.ts`
- `apps/mobile/src/features/dsar/utils/constants/index.ts`
- `apps/mobile/src/features/invoice/utils/constants/index.ts`
- `apps/mobile/src/features/meetings/utils/constants/index.ts`
- `apps/mobile/src/features/subscription/utils/constants/index.ts`
- `apps/mobile/src/features/training/utils/constants/index.ts`
- `apps/mobile/src/features/payment-providers/utils/constants/index.ts`
- `apps/mobile/src/shared/constants/index.ts`

### Task 3.2: TypeScript check — web

```bash
cd apps/web && npx tsc --noEmit
```

Expected: 0 errors. If errors occur, fix unresolved imports.

### Task 3.3: TypeScript check — mobile

```bash
cd apps/mobile && npx tsc --noEmit
```

Expected: 0 errors.

### Task 3.4: Build check — web

```bash
cd apps/web && npm run build
```

Expected: successful build.

### Task 3.5: Build check — mobile

```bash
cd apps/mobile && npx expo export --dump-sourcemap 2>&1 | head -50 || npx tsc --noEmit
```

Expected: successful bundle or TypeScript pass.

---

## ⚠️ Known Risks & Edge Cases

1. **Path mismatches (contributions):** Local `contributionEndpoints.createPayment` = `/contributions/payments`, shared `ENDPOINTS.CONTRIBUTION.CREATE_PAYMENT` = `/contributions/record`. These are different — investigate and resolve before migration.

2. **Query params baked into string templates:** ~12 local endpoints embed query params (e.g., `list: (page) => \`/meetings?page=${page}\``). Must use `buildUrlWithQuery(ENDPOINTS.X, { page })` pattern.

3. **Mobile `sharedEnpoint` typo:** The mobile central file has `sharedEnpoint` (missing `d`) which is used by `use-association.ts`. Fix to use `ENDPOINTS.ASSOCIATIONS.CURRENT` directly.

4. **Mobile `SubscriptionEndpoints` PascalCase:** The PascalCase export name `SubscriptionEndpoints` is inconsistently named compared to other mobile endpoint constants.

5. **Mobile `@constants/endpoints` alias:** Check if `apps/mobile/tsconfig.json` has a `@constants` path alias pointing to the shared constants. Update or remove after migration.
