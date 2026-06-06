# Shared Query Keys Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all inline query key arrays in `apps/web` (~76 files, ~142 usages) and all local factory objects in `apps/mobile` (~8 factory files deleted, ~51 factory usages + ~16 inline usages replaced) with the shared `QUERY_KEYS` constants from `@repo/shared`.

**Architecture:** A single source of truth for all query keys across both apps. Every query key string `['foo', bar]` is replaced by `QUERY_KEYS.FOO_KEYS.SOMETHING(bar)`. Old factory definition files in mobile are deleted after migration.

**Tech Stack:** TypeScript, `@tanstack/react-query`, `@repo/shared` (workspace dependency)

**Pre-requisite:** The shared query keys in `packages/shared/src/constants/query-keys/` must already exist from phase 1.

---

## Task 0: Add missing keys to shared constants

Before updating the apps, add these missing keys to the shared query key files:

**File: `packages/shared/src/constants/query-keys/contributions.ts`**
Add after `ALL`:
```typescript
  USER_BASE: () => ['user-contributions'] as const,
```

**File: `packages/shared/src/constants/query-keys/associations.ts`**
Add after `ALL`:
```typescript
  LIST: () => ['associations-list'] as const,
```

**File: `packages/shared/src/constants/query-keys/meetings.ts`**
Add after `ALL`:
```typescript
  LISTS: () => ['meetings'] as const,
```

---

## Task 1: Add @repo/shared dependency to both apps

**File: `apps/web/package.json`**
Add to dependencies:
```json
"@repo/shared": "workspace:*",
```

**File: `apps/mobile/package.json`**
Add to dependencies:
```json
"@repo/shared": "workspace:*",
```

Run:
```bash
pnpm install
```

---

## Task 2: Replace web announcement keys (7 files)

Each file gets `import { QUERY_KEYS } from '@repo/shared'` added at top.

| File | Old key | New key |
|---|---|---|
| `useAnnouncement.ts` | `['announcement', announcementId]` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(announcementId)` |
| `useAnnouncementsList.ts` | `['announcements-list', status, page]` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.LIST({ status, page })` |
| `useCreateAnnouncement.ts` | `['announcements-list']` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS()` |
| `useUpdateAnnouncement.ts` | `['announcements-list']` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS()` |
| `useDeleteAnnouncement.ts` | `['announcements-list']` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS()` |
| `useMarkAnnouncementRead.ts` | (both) `['announcement', id]` + `['announcements-list']` | `DETAIL(id)` + `LISTS()` |
| `useUploadAnnouncementImage.ts` | (both) `['announcements-list']` + `['announcement', id]` | `LISTS()` + `DETAIL(id)` |

---

## Task 3: Replace web meetings keys (9 files)

| File | Old key | New key |
|---|---|---|
| `useMeetings.ts` | `['meetings', page]` | `QUERY_KEYS.MEETINGS_KEYS.LIST(page)` |
| (same, onSuccess) | `['meetings']` | `QUERY_KEYS.MEETINGS_KEYS.LISTS()` |
| `useMeetingDetail.ts` | `['meeting', meetingId]` | `QUERY_KEYS.MEETINGS_KEYS.DETAIL(meetingId)` |
| `useMeetingAttendees.ts` | `['meeting-attendees', meetingId]` | `QUERY_KEYS.MEETINGS_KEYS.ATTENDEES(meetingId)` |
| (same, onSuccess) | `['meetings']` | `QUERY_KEYS.MEETINGS_KEYS.LISTS()` |
| `useMeetingMinutes.ts` | `['meeting-minutes', meetingId]` | `QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId)` |
| `useAttendees.ts` | `['meeting', meetingId]` | `QUERY_KEYS.MEETINGS_KEYS.DETAIL(meetingId)` |
| (same) | `['meetings']` | `QUERY_KEYS.MEETINGS_KEYS.LISTS()` |
| `useRsvp.ts` | `['meetings']` | `QUERY_KEYS.MEETINGS_KEYS.LISTS()` |
| `EditMeetingDialog.tsx` | `['meeting', meeting.id]` | `QUERY_KEYS.MEETINGS_KEYS.DETAIL(meeting.id)` |
| (same) | `['meetings']` | `QUERY_KEYS.MEETINGS_KEYS.LISTS()` |
| `DeleteMeetingDialog.tsx` | `['meetings']` | `QUERY_KEYS.MEETINGS_KEYS.LISTS()` |
| `AssignMembersPage.tsx` | `['meeting-attendees', meetingId]` | `QUERY_KEYS.MEETINGS_KEYS.ATTENDEES(meetingId)` |

---

## Task 4: Replace web members keys (8 files)

| File | Old key | New key |
|---|---|---|
| `useMember.ts` | `['member', memberId]` | `QUERY_KEYS.MEMBERS_KEYS.DETAIL(memberId)` |
| `useMembers.ts` | `['members', page, status]` | `QUERY_KEYS.MEMBERS_KEYS.LIST(page, status)` |
| `useApproveMember.ts` | `['members']` | `QUERY_KEYS.MEMBERS_KEYS.ALL()` |
| (same) | `['membership-applications']` | `QUERY_KEYS.MEMBERSHIP_APPLICATIONS_KEYS.ALL()` |
| `useRejectMember.ts` | `['membership-applications']` | `QUERY_KEYS.MEMBERSHIP_APPLICATIONS_KEYS.ALL()` |
| `useUpdateMemberRole.ts` | `['members']` | `QUERY_KEYS.MEMBERS_KEYS.ALL()` |
| `useUpdateMemberAssociation.ts` | `['members']` | `QUERY_KEYS.MEMBERS_KEYS.ALL()` |
| `useUpdateMemberStatus.ts` | `['members']` | `QUERY_KEYS.MEMBERS_KEYS.ALL()` |
| `useMemberTypes.ts` | `['member-types']` | `QUERY_KEYS.MEMBERS_KEYS.TYPES()` |

---

## Task 5: Replace web member-type keys (4 files)

| File | Old key | New key |
|---|---|---|
| `useMemberTypesList.ts` | `['member-types-list']` | `QUERY_KEYS.MEMBER_TYPES_KEYS.LIST()` |
| `useCreateMemberType.ts` | `['member-types-list']` | `QUERY_KEYS.MEMBER_TYPES_KEYS.LIST()` |
| (same) | `['member-types']` | `QUERY_KEYS.MEMBER_TYPES_KEYS.ALL()` |
| `useUpdateMemberType.ts` | `['member-types-list']` | `QUERY_KEYS.MEMBER_TYPES_KEYS.LIST()` |
| (same) | `['member-types']` | `QUERY_KEYS.MEMBER_TYPES_KEYS.ALL()` |
| `useDeleteMemberType.ts` | `['member-types-list']` | `QUERY_KEYS.MEMBER_TYPES_KEYS.LIST()` |
| (same) | `['member-types']` | `QUERY_KEYS.MEMBER_TYPES_KEYS.ALL()` |

---

## Task 6: Replace web membership-applications keys (3 files)

| File | Old key | New key |
|---|---|---|
| `useMembershipApplications.ts` | `['membership-applications', page, status]` | `QUERY_KEYS.MEMBERSHIP_APPLICATIONS_KEYS.LIST(page, status)` |
| `useApproveApplication.ts` | `['membership-applications']` | `QUERY_KEYS.MEMBERSHIP_APPLICATIONS_KEYS.ALL()` |
| (same) | `['members']` | `QUERY_KEYS.MEMBERS_KEYS.ALL()` |
| `useRejectApplication.ts` | `['membership-applications']` | `QUERY_KEYS.MEMBERSHIP_APPLICATIONS_KEYS.ALL()` |

---

## Task 7: Replace web contributions keys (7 files)

| File | Old key | New key |
|---|---|---|
| `useContributions.ts` | `['all-contributions', page, status, userId, year, month]` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(page, status, userId, year, month)` |
| `useUserContributions.ts` | `['user-contributions', userId, fromYear, fromMonth, toYear, toMonth, page]` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.USER(userId, fromYear, fromMonth, toYear, toMonth, page)` |
| `useContributionDetail.ts` | `['contribution-detail', contributionId]` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.DETAIL(contributionId)` |
| `use-waive-contribution.tsx` | `['all-contributions']` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL()` |
| (same) | `['user-contributions']` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.USER_BASE()` |
| `payment-summary-bar.tsx` | `['all-contributions']` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL()` |
| `contributions.tsx` | `['all-contributions']` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL()` |
| `record-contribution.tsx` | `['all-contributions']` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL()` |

---

## Task 8: Replace web declarations keys (3 files)

| File | Old key | New key |
|---|---|---|
| `use-declarations.ts` | `['declarations', page, status, search]` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS(page, status, search)` |
| `use-declaration-detail.ts` | `['declaration', id]` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATION(id)` |
| `use-declaration-mutations.ts` | `['declarations']` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS()` |

---

## Task 9: Replace web subscriptions keys (12 files)

| File | Old key | New key |
|---|---|---|
| `usePlans.ts` | `['subscription-plans', page]` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS(page)` |
| `usePlan.ts` | `['plan', planId]` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLAN(planId)` |
| `useMySubscription.ts` | `['my-subscription', page]` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.MY(page)` |
| `useUserSubscription.ts` | `['user-subscription', userId]` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.USER(userId)` |
| `my-subscription.tsx` | `['payment-history', page]` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PAYMENT_HISTORY(page)` |
| `useCreatePlan.ts` | `['subscription-plans']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` |
| `useUpdatePlan.ts` | `['subscription-plans']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` |
| `useDeletePlan.ts` | `['subscription-plans']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` |
| `useSetDefaultPlan.ts` | `['subscription-plans']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` |
| `useChangePlan.ts` | `['user-contributions', userId, 1]` | `QUERY_KEYS.CONTRIBUTIONS_KEYS.USER(userId, undefined, undefined, undefined, undefined, 1)` |
| (same) | `['subscription-plans']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` |
| `useSubscribe.ts` | `['my-subscription']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.MY()` |
| (same) | `['subscription-plans']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` |
| `useWaiveSubscription.ts` | `['my-subscription']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.MY()` |
| (same) | `['subscription-plans']` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` |

---

## Task 10: Replace web payments keys (9 files)

| File | Old key | New key |
|---|---|---|
| `usePayments.ts` | `['all-payments', params.toString()]` | `QUERY_KEYS.PAYMENTS_KEYS.LIST(params.toString())` |
| `usePaymentDetail.ts` | `['payment-detail', paymentId]` | `QUERY_KEYS.PAYMENTS_KEYS.DETAIL(paymentId)` |
| `usePaymentProviders.ts` | `['payment-providers']` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS()` |
| (same) | `['payment-provider', providerId]` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDER(providerId)` |
| `useToggleActivatePaymentProvider.ts` | `['payment-providers']` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS()` |
| `useMemberSearch.ts` | `['member-search', debouncedQuery]` | `QUERY_KEYS.PAYMENTS_KEYS.MEMBER_SEARCH(debouncedQuery)` |
| `record-payment-dialog.tsx` | `['all-payments']` | `QUERY_KEYS.PAYMENTS_KEYS.ALL()` |
| `create-provider-dialog.tsx` | `['payment-providers']` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS()` |
| `edit-provider-dialog.tsx` | `['payment-providers']` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS()` |
| `provider-detail-dialog.tsx` | `['payment-providers']` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS()` |

---

## Task 11: Replace web associations keys (5 files)

| File | Old key | New key |
|---|---|---|
| `useAssociation.ts` (shared) | `['associations', 'current']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.CURRENT()` |
| `useAssociationsList.ts` | `['associations-list']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.LIST()` |
| `useCreateAssociation.ts` | `['associations-list']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.LIST()` |
| (same) | `['associations']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.ALL()` |
| `useUpdateAssociation.ts` | `['associations-list']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.LIST()` |
| (same) | `['associations']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.ALL()` |
| `useDeactivateAssociation.ts` | `['associations-list']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.LIST()` |
| (same) | `['associations']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.ALL()` |
| `useUploadAssociationLogo.ts` | `['associations']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.ALL()` |
| (same) | `['associations-list']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.LIST()` |

---

## Task 12: Replace web compliance keys (5 files)

| File | Old key | New key |
|---|---|---|
| `useComplianceChecks.ts` | `['compliance-checks', options]` | `QUERY_KEYS.COMPLIANCE_KEYS.CHECKS(options)` |
| `useComplianceCheckDetail.ts` | `['compliance-check', checkId]` | `QUERY_KEYS.COMPLIANCE_KEYS.CHECK(checkId)` |
| `useComplianceEvidence.ts` | `['compliance-evidence']` | `QUERY_KEYS.COMPLIANCE_KEYS.EVIDENCE()` |
| `useTriggerComplianceCheck.ts` | `['compliance-checks']` | `QUERY_KEYS.COMPLIANCE_KEYS.CHECKS()` |
| (same) | `['compliance-evidence']` | `QUERY_KEYS.COMPLIANCE_KEYS.EVIDENCE()` |
| `useDeleteComplianceCheck.ts` | `['compliance-checks']` | `QUERY_KEYS.COMPLIANCE_KEYS.CHECKS()` |
| (same) | `['compliance-evidence']` | `QUERY_KEYS.COMPLIANCE_KEYS.EVIDENCE()` |

---

## Task 13: Replace web consent keys (5 files)

| File | Old key | New key |
|---|---|---|
| `useConsentRecords.ts` | `['consent-records', options]` | `QUERY_KEYS.CONSENT_KEYS.RECORDS(options)` |
| `useConsentReport.ts` | `['consent-report']` | `QUERY_KEYS.CONSENT_KEYS.REPORT()` |
| `useUserConsentHistory.ts` | `['consent-history', userId]` | `QUERY_KEYS.CONSENT_KEYS.HISTORY(userId)` |
| `useUpdateConsentReceipt.ts` | `['consent-records']` | `QUERY_KEYS.CONSENT_KEYS.RECORDS()` |
| (same) | `['consent-report']` | `QUERY_KEYS.CONSENT_KEYS.REPORT()` |
| `useDeleteConsentReceipt.ts` | `['consent-records']` | `QUERY_KEYS.CONSENT_KEYS.RECORDS()` |
| (same) | `['consent-report']` | `QUERY_KEYS.CONSENT_KEYS.REPORT()` |

---

## Task 14: Replace web DSAR keys (7 files)

| File | Old key | New key |
|---|---|---|
| `useDsarTickets.ts` | `['dsar-tickets', options]` | `QUERY_KEYS.DSAR_KEYS.TICKETS(options)` |
| `useDsarTicketDetail.ts` | `['dsar-ticket', id]` | `QUERY_KEYS.DSAR_KEYS.TICKET(id)` |
| `useDsarSlaReport.ts` | `['dsar-sla']` | `QUERY_KEYS.DSAR_KEYS.SLA()` |
| `useRespondToDsarTicket.ts` | `['dsar-tickets']` | `QUERY_KEYS.DSAR_KEYS.TICKETS()` |
| (same) | `['dsar-sla']` | `QUERY_KEYS.DSAR_KEYS.SLA()` |
| `useDeleteDsarTicket.ts` | `['dsar-tickets']` | `QUERY_KEYS.DSAR_KEYS.TICKETS()` |
| (same) | `['dsar-sla']` | `QUERY_KEYS.DSAR_KEYS.SLA()` |
| `useRejectDsarTicket.ts` | `['dsar-tickets']` | `QUERY_KEYS.DSAR_KEYS.TICKETS()` |
| (same) | `['dsar-sla']` | `QUERY_KEYS.DSAR_KEYS.SLA()` |
| `useAssignDsarTicket.ts` | `['dsar-tickets']` | `QUERY_KEYS.DSAR_KEYS.TICKETS()` |
| (same) | `['dsar-ticket']` | `QUERY_KEYS.DSAR_KEYS.TICKET()` |

---

## Task 15: Replace web shared hooks keys

| File | Old key | New key |
|---|---|---|
| `useDashboard.ts` | `['dashboard', 'overview']` | `QUERY_KEYS.DASHBOARD_KEYS.OVERVIEW()` |
| `useAuditLogs.ts` | `['audit-logs', params]` | `QUERY_KEYS.AUDIT_LOGS_KEYS.LIST(params)` |

---

## Task 16: Reimplement web training query keys

**File: `apps/web/src/features/training/utils/constants/query-keys.ts`**

This file is already a centralized factory. Replace its implementation to use shared keys:

```typescript
import { QUERY_KEYS } from '@repo/shared'

export const trainingQueryKeys = {
  modules: {
    all: (page?: number) => QUERY_KEYS.TRAINING_KEYS.MODULES_LIST(page),
    list: (page?: number, isActive?: boolean) => QUERY_KEYS.TRAINING_KEYS.MODULES_LIST(page, isActive),
    detail: (id: string) => QUERY_KEYS.TRAINING_KEYS.MODULE(id),
  },
  supplements: {
    all: (moduleId: string, page?: number) => QUERY_KEYS.TRAINING_KEYS.SUPPLEMENTS(moduleId, page),
  },
  assignments: {
    all: (moduleId: string, page?: number) => QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId, page),
  },
  assignedUsers: {
    all: (moduleId: string, page?: number) => QUERY_KEYS.TRAINING_KEYS.ASSIGNED_USERS(moduleId, page),
    base: QUERY_KEYS.TRAINING_KEYS.ASSIGNED_USERS_BASE(),
  },
  completions: {
    admin: QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_ADMIN(),
    adminList: (page?: number) => QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_ADMIN_LIST(page),
    my: QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_MY(),
    byModule: (moduleId: string, page?: number) => QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_BY_MODULE(moduleId, page),
  },
  certificates: {
    all: (moduleId: string) => QUERY_KEYS.TRAINING_KEYS.CERTIFICATES(moduleId),
  },
}
```

---

## Task 17: Replace mobile announcement keys (3 files)

Each file change: remove `import { AnnouncementQueryKeys } from '...'` and add `import { QUERY_KEYS } from '@repo/shared'`.

**Factory file to delete:** `apps/mobile/src/features/announcements/utils/constants/query-key.ts`

| File | Old key call | New key call |
|---|---|---|
| `use-announcements.ts` | `AnnouncementQueryKeys.all()` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.ALL()` |
| `use-announcement.ts` | `AnnouncementQueryKeys.detail(id)` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(id)` |
| `use-mark-annoucement-read.ts` | `AnnouncementQueryKeys.detail(id)` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(id)` |
| (same) | `AnnouncementQueryKeys.all()` | `QUERY_KEYS.ANNOUNCEMENTS_KEYS.ALL()` |

---

## Task 18: Replace mobile compliance keys (4 files)

**Factory files to delete:**
- `apps/mobile/src/features/compliance/utils/constants/query-key.ts`
- `apps/mobile/src/features/compliance/utils/constants/index.ts` (delete if only re-exports query-key)

**Note:** `ComplianceQueryKeys.all(params?)` → `['compliance', 'all', params]` has no shared equivalent (unused in reads). Ignore/delete.

| File | Old key call | New key call |
|---|---|---|
| `use-my-compliance.ts` | `ComplianceQueryKeys.my()` | `QUERY_KEYS.COMPLIANCE_KEYS.MY()` |
| `use-compliance-detail.ts` | `ComplianceQueryKeys.myDetail(id)` | `QUERY_KEYS.COMPLIANCE_KEYS.MY_DETAIL(id)` |
| `use-compliance-mutations.ts:15` | `ComplianceQueryKeys.my()` | `QUERY_KEYS.COMPLIANCE_KEYS.MY()` |
| `use-compliance-mutations.ts:35` | `ComplianceQueryKeys.my()` | `QUERY_KEYS.COMPLIANCE_KEYS.MY()` |
| `use-compliance-mutations.ts:36` | `['compliance', 'my', 'detail']` | `QUERY_KEYS.COMPLIANCE_KEYS.MY_DETAIL()` (note: no args, matches prefix) |

---

## Task 19: Replace mobile consent keys (5 files)

**Factory file to delete:** `apps/mobile/src/features/consent/utils/constants/query-key.ts`
**Also delete:** `apps/mobile/src/features/consent/utils/constants/index.ts`

| File | Old key call | New key call |
|---|---|---|
| `use-my-consent.ts` | `ConsentQueryKeys.my()` | `QUERY_KEYS.CONSENT_KEYS.MY()` |
| `use-consent-history.ts` | `ConsentQueryKeys.history()` | `QUERY_KEYS.CONSENT_KEYS.HISTORY()` |
| `use-consent-report.ts` | `ConsentQueryKeys.report()` | `QUERY_KEYS.CONSENT_KEYS.REPORT()` |
| `use-grant-consent.ts` | `ConsentQueryKeys.my()` | `QUERY_KEYS.CONSENT_KEYS.MY()` |
| (same) | `ConsentQueryKeys.history()` | `QUERY_KEYS.CONSENT_KEYS.HISTORY()` |
| `use-revoke-consent.ts` | `ConsentQueryKeys.my()` | `QUERY_KEYS.CONSENT_KEYS.MY()` |
| (same) | `ConsentQueryKeys.history()` | `QUERY_KEYS.CONSENT_KEYS.HISTORY()` |

---

## Task 20: Replace mobile DSAR keys (3 files)

**Factory file to delete:** `apps/mobile/src/features/dsar/utils/constants/query-key.ts`
**Also delete:** `apps/mobile/src/features/dsar/utils/constants/index.ts`

**Note:** `DSARQueryKeys.all(params?)` → `['dsar', 'all', params]`. Replace with `QUERY_KEYS.DSAR_KEYS.TICKETS(params)` → `['dsar-tickets', params]`. Different cache key — intentional unification.

| File | Old key call | New key call |
|---|---|---|
| `use-dsar.ts:13` | `DSARQueryKeys.my()` | `QUERY_KEYS.DSAR_KEYS.MY()` |
| `use-dsar.ts:27` | `DSARQueryKeys.all(params)` | `QUERY_KEYS.DSAR_KEYS.TICKETS(params)` |
| `use-dsar.ts:41` | `DSARQueryKeys.detail(ticketId)` | `QUERY_KEYS.DSAR_KEYS.DETAIL(ticketId)` |
| `use-dsar.ts:56` | `DSARQueryKeys.myDetail(ticketId)` | `QUERY_KEYS.DSAR_KEYS.MY_DETAIL(ticketId)` |
| `use-dsar.ts:70` | `DSARQueryKeys.slaReport()` | `QUERY_KEYS.DSAR_KEYS.SLA_REPORT()` |
| `use-dsar-mutations.ts:20` | `DSARQueryKeys.my()` | `QUERY_KEYS.DSAR_KEYS.MY()` |
| `use-dsar-mutations.ts:45` | `['dsar']` | `QUERY_KEYS.DSAR_KEYS.ALL()` |
| `use-dsar-mutations.ts:70` | `['dsar']` | `QUERY_KEYS.DSAR_KEYS.ALL()` |
| `use-dsar-mutations.ts:95` | `DSARQueryKeys.my()` | `QUERY_KEYS.DSAR_KEYS.MY()` |
| `use-dsar-mutations.ts:96` | `['dsar', 'my', 'detail']` | `QUERY_KEYS.DSAR_KEYS.MY_DETAIL()` (prefix match) |

---

## Task 21: Replace mobile meetings keys (10 files)

**Factory files to delete:**
- `apps/mobile/src/features/meetings/utils/constants/query-key.ts`
- `apps/mobile/src/features/meetings/types/query-key.ts` (type definition for factory)

**Note on `all(page?)`:** Mobile `MeetingQueryKeys.all(page?)` → `['meetings', page]`. Replace with `QUERY_KEYS.MEETINGS_KEYS.LIST(page)` → `['meetings', page]` ✅ same key.

| File | Old key call | New key call |
|---|---|---|
| `use-meetings.ts` | `MeetingQueryKeys.all()` | `QUERY_KEYS.MEETINGS_KEYS.LIST()` |
| `use-meeting.ts` | `MeetingQueryKeys.detail(id)` | `QUERY_KEYS.MEETINGS_KEYS.DETAIL(id)` |
| `useMeetingAgenda.ts` | `MeetingQueryKeys.agendas(id)` | `QUERY_KEYS.MEETINGS_KEYS.AGENDAS(id)` |
| `useMeetingAttendees.ts` | `MeetingQueryKeys.attendees(id)` | `QUERY_KEYS.MEETINGS_KEYS.ATTENDEES(id)` |
| `use-meeting-minute.ts` | `MeetingQueryKeys.minutes(meetingId)` | `QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId)` |
| `meeting-detail.screen.tsx` | `MeetingQueryKeys.attendees(id)` | `QUERY_KEYS.MEETINGS_KEYS.ATTENDEES(id)` |
| `use-update-attendee-rsvp.ts` | `MeetingQueryKeys.rsvps(meetingId)` | `QUERY_KEYS.MEETINGS_KEYS.RSVPS(meetingId)` |
| (same) | `MeetingQueryKeys.all()` | `QUERY_KEYS.MEETINGS_KEYS.LIST()` |
| `use-delete-meeting-minute.ts` | `MeetingQueryKeys.minutes(meetingId)` | `QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId)` |
| `use-create-meeting-minute.ts` | `MeetingQueryKeys.minutes(meetingId)` | `QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId)` |

### Fix misspelled meeting keys (3 files with 'minuites' typo)

These files use the wrong key `['meeting', 'minuites', meetingId]`. Replace with the correct shared key:

| File | Old key | New key |
|---|---|---|
| `use-meeting-minuite.ts` | `['meeting', 'minuites', meetingId]` | `QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId)` |
| `use-update-meeting-minuites.ts` | `['meeting', 'minuites', meetingId]` | `QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId)` |
| `use-create-meeting-minuite.ts` | `['meeting', 'minuites', meetingId]` | `QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId)` |

**Note:** This changes the cache key from `['meeting', 'minuites', id]` (typo) to `['meetings', id, 'minutes']` (correct), fixing an existing bug.

---

## Task 22: Replace mobile subscription keys (3 files)

**Factory file to delete:** `apps/mobile/src/features/subscription/utils/constants/query-key.ts`

**Note on key differences:**
- Mobile `SubscriptionQueryKeys.plans()` → `['subscriptions', 'plans']` → Replace with `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` → `['subscription-plans', undefined]`
- Mobile `SubscriptionQueryKeys.paymentHistory()` → `['payment', 'history']` → Replace with `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PAYMENT_HISTORY()` → `['payment-history', undefined]`
- Mobile `SubscriptionQueryKeys.all()` → `['subscriptions']` → Replace with `QUERY_KEYS.SUBSCRIPTIONS_KEYS.ALL()` → `['subscriptions']` ✅

| File | Old key call | New key call |
|---|---|---|
| `use-subscriptions.ts` | `SubscriptionQueryKeys.plans()` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS()` |
| `use-payment-history.ts` | `SubscriptionQueryKeys.paymentHistory()` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PAYMENT_HISTORY()` |
| `use-verify-payment.ts` | `SubscriptionQueryKeys.paymentHistory()` | `QUERY_KEYS.SUBSCRIPTIONS_KEYS.PAYMENT_HISTORY()` |

---

## Task 23: Replace mobile training keys (11 files)

**Factory file to delete:** `apps/mobile/src/features/training/utils/constants/query-key.ts`

**Note on key differences:** Mobile training keys use a `'training'` prefix namespace while shared keys use flat prefixes. Cache keys will change for:
- `myCompletions`: `['training', 'completions', 'my']` → `['my-training-completions']`
- `allCompletions`: `['training', 'completions', 'all', params]` → `['admin-training-completions', page]` (approximate)
- `assignments`: `['training', 'assignments', moduleId]` → `['training-assignments', moduleId, undefined]`
- `supplements`: `['training', 'supplements', moduleId]` → `['training-supplements', moduleId, undefined]`

| File | Old key call | New key call |
|---|---|---|
| `use-training-modules.ts` | `TrainingQueryKeys.all()` | `QUERY_KEYS.TRAINING_KEYS.MY_ALL()` |
| `use-training-module.ts` | `TrainingQueryKeys.detail(id)` | `QUERY_KEYS.TRAINING_KEYS.MODULE_DETAIL(id)` |
| `use-training-assignments.ts` | `TrainingQueryKeys.assignments(moduleId)` | `QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId)` |
| `use-training-supplements.ts` | `TrainingQueryKeys.supplements(id)` | `QUERY_KEYS.TRAINING_KEYS.SUPPLEMENTS(id)` |
| `use-my-training-completions.ts` | `TrainingQueryKeys.myCompletions()` | `QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_MY()` |
| `use-create-training-module.ts` | `TrainingQueryKeys.all()` | `QUERY_KEYS.TRAINING_KEYS.MY_ALL()` |
| `use-update-training-module.ts` | `TrainingQueryKeys.all()` | `QUERY_KEYS.TRAINING_KEYS.MY_ALL()` |
| (same) | `TrainingQueryKeys.detail(moduleId)` | `QUERY_KEYS.TRAINING_KEYS.MODULE_DETAIL(moduleId)` |
| `use-assign-training.ts` | `TrainingQueryKeys.assignments(moduleId)` | `QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId)` |
| `use-bulk-assign-training.ts` | `TrainingQueryKeys.assignments(moduleId)` | `QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId)` |
| `use-remove-training-assignment.ts` | `TrainingQueryKeys.assignments(moduleId)` | `QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId)` |
| `use-complete-training.ts` | `TrainingQueryKeys.myCompletions()` | `QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_MY()` |
| (same) | `TrainingQueryKeys.allCompletions()` | `QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_ADMIN_LIST()` |

---

## Task 24: Replace mobile payment-provider keys (2 files)

**File to edit:** `apps/mobile/src/features/payment-providers/utils/constants.ts` — remove the `ProviderQueryKeys` section (lines 10-13).

**Alternative:** Just leave the `ProviderQueryKeys` definition in place but make it re-export from shared. Simpler to delete the local definition and update imports.

| File | Old key call | New key call |
|---|---|---|
| `use-payment-providers.ts` | `ProviderQueryKeys.all()` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS()` |
| `use-payment-providers.ts` | `ProviderQueryKeys.detail(id)` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDER(id)` |
| `use-payment-provider-mutations.ts` | `ProviderQueryKeys.all()` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS()` |

---

## Task 25: Replace mobile inline keys (no factory existed) — 8 files

### Profile (1 file)
**File:** `apps/mobile/src/features/profile/hooks/use-update-user.ts`
- Rename `const queryKey = useQueryClient()` → `const queryClient = useQueryClient()` (fixes misnamed variable)
- Replace `['auth', 'me']` → `QUERY_KEYS.AUTH_KEYS.ME()`
- Replace `['member', data?.data?.id]` → `QUERY_KEYS.MEMBERS_KEYS.DETAIL(data?.data?.id)`
- Replace `['user']` → `QUERY_KEYS.USER_KEYS.USER()`

### Invoice (2 files)
| File | Old key | New key |
|---|---|---|
| `use-invoice.ts` | `['invoice', id]` | `QUERY_KEYS.INVOICE_KEYS.DETAIL(id)` |
| `use-invoices.ts` | `['invoices', page]` | `QUERY_KEYS.INVOICE_KEYS.LIST(page)` |

### Shared hooks (4 files)
| File | Old key | New key |
|---|---|---|
| `useUser.ts` | `['user']` | `QUERY_KEYS.USER_KEYS.USER()` |
| `use-association.ts` | `['association', 'current']` | `QUERY_KEYS.ASSOCIATIONS_KEYS.CURRENT()` |
| `use-payment-status.ts` | `['payment', 'provider', 'status']` | `QUERY_KEYS.PAYMENTS_KEYS.PROVIDER_STATUS()` |
| `use-member-types.ts` | `['member-types']` | `QUERY_KEYS.MEMBER_TYPES_KEYS.ALL()` |

---

## Task 26: Verify build

- [ ] Run `pnpm --filter @repo/shared run type-check` — PASS
- [ ] Run `pnpm --filter apps/web run type-check` or `pnpm --filter apps/web run lint` — PASS (or verify with TSC)
- [ ] Run `pnpm --filter apps/mobile run type-check` — PASS

---

## Self-Review

After writing, verify:
1. Every inline key in web (~142) has a corresponding task entry above
2. Every mobile factory method call (~51) has a corresponding task entry
3. Every mobile inline key (~16) has a corresponding task entry
4. All 8 mobile factory files are marked for deletion
5. Package.json changes are included
6. Shared key additions (contributions USER_BASE, associations LIST, meetings LISTS) are included as Task 0
