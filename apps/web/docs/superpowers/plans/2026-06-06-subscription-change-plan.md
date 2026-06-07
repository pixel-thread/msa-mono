# Change User Subscription Plan — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/subscriptions/change-plan` page where FINANCE+ role users can search for a member, view their current subscription, and change their plan.

**Architecture:** Frontend-only changes. Reuses existing `POST /api/subscriptions/upgrade` backend endpoint (which supports `userId` for admin users). The new `useUserSubscription` hook will call a backend endpoint TBD by the user. Member search reuses the existing `/members?search=` endpoint.

**Tech Stack:** Next.js 14 App Router, React Query, Zod, shadcn/ui, Tailwind CSS

---

### File Structure

**Create (4 files):**

| File                                                      | Responsibility                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/app/(dashboard)/subscriptions/change-plan/page.tsx`  | Route wrapper — renders `ChangePlanPage`                               |
| `src/features/subscriptions/pages/change-plan.tsx`        | Main page — member search, current plan display, plan selector, submit |
| `src/features/subscriptions/hooks/useUserSubscription.ts` | Query hook — fetches a user's subscription by userId                   |
| `src/features/subscriptions/hooks/useChangePlan.ts`       | Mutation hook — changes a user's plan via upgrade endpoint             |

**Modify (3 files):**

| File                                                      | Change                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/features/subscriptions/utils/constants/endpoints.ts` | Add `userSubscription(userId)` and `upgrade` endpoint constants    |
| `src/features/subscriptions/validators/index.ts`          | Add optional `userId` to `UpgradeSubscriptionSchema` + export type |
| `src/features/subscriptions/pages/index.ts`               | Export `ChangePlanPage`                                            |

---

### Task 1: Add endpoint constants

**Files:**

- Modify: `src/features/subscriptions/utils/constants/endpoints.ts`

- [ ] **Step 1: Add userSubscription and upgrade constants**

Edit `src/features/subscriptions/utils/constants/endpoints.ts`:

```ts
export const subscriptionEndpoints = {
  plans: '/subscriptions/plans' as const,
  plansList: (page: number = 1) => `/subscriptions/plans?page=${page}`,
  planById: (id: string) => `/subscriptions/plans/${id}`,
  default: '/subscriptions/plans/default' as const,
  my: '/subscriptions/my' as const,
  myList: (page: number = 1) => `/subscriptions/my?page=${page}`,
  subscribe: '/subscriptions/subscribe' as const,
  upgrade: '/subscriptions/upgrade' as const,
  waive: '/subscriptions/waive' as const,
  userSubscription: (userId: string) => `/subscriptions/user/${userId}`,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/subscriptions/utils/constants/endpoints.ts
git commit -m "feat: add upgrade and userSubscription endpoint constants"
```

---

### Task 2: Update upgrade validator to support userId

**Files:**

- Modify: `src/features/subscriptions/validators/index.ts`

- [ ] **Step 1: Add optional userId to UpgradeSubscriptionSchema**

Edit `src/features/subscriptions/validators/index.ts`. Change the `UpgradeSubscriptionSchema` block:

```ts
export const UpgradeSubscriptionSchema = z.object({
  planId: z.uuid(),
  userId: z.string().optional(),
});
export type UpgradeSubscriptionInput = z.infer<typeof UpgradeSubscriptionSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/subscriptions/validators/index.ts
git commit -m "feat: add optional userId to upgrade subscription schema"
```

---

### Task 3: Create useUserSubscription query hook

**Files:**

- Create: `src/features/subscriptions/hooks/useUserSubscription.ts`

- [ ] **Step 1: Create the hook**

Create `src/features/subscriptions/hooks/useUserSubscription.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { Subscription } from '../types';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

export function useUserSubscription(userId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-subscription', userId],
    queryFn: () => http.get<Subscription>(subscriptionEndpoints.userSubscription(userId)),
    enabled: !!userId,
  });

  return {
    subscription: data?.data ?? null,
    isLoading,
    error,
    refetch,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/subscriptions/hooks/useUserSubscription.ts
git commit -m "feat: add useUserSubscription query hook"
```

---

### Task 4: Create useChangePlan mutation hook

**Files:**

- Create: `src/features/subscriptions/hooks/useChangePlan.ts`

- [ ] **Step 1: Create the hook**

Create `src/features/subscriptions/hooks/useChangePlan.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { toast } from 'sonner';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

interface ChangePlanData {
  planId: string;
  userId: string;
}

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, userId }: ChangePlanData) =>
      http.post(subscriptionEndpoints.upgrade, { planId, userId }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Plan changed successfully');
        queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to change plan');
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/subscriptions/hooks/useChangePlan.ts
git commit -m "feat: add useChangePlan mutation hook"
```

---

### Task 5: Create the ChangePlanPage component

**Files:**

- Create: `src/features/subscriptions/pages/change-plan.tsx`

- [ ] **Step 1: Create the page component**

Create `src/features/subscriptions/pages/change-plan.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { usePlans } from '@src/features/subscriptions/hooks/usePlans';
import { useUserSubscription } from '@src/features/subscriptions/hooks/useUserSubscription';
import { useChangePlan } from '@src/features/subscriptions/hooks/useChangePlan';
import { MemberSearch } from '@src/features/payments/components/member-search';
import { SectionHeader } from '@src/shared/components/section-header';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import { formattedAmount } from '@src/shared/utils/format';
import { User, CreditCard, ArrowRight, Loader2, Calendar, BadgeCheck, XCircle } from 'lucide-react';

interface SelectedMember {
  id: string;
  name: string;
  email: string;
}

export function ChangePlanPage() {
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const { subscription, isLoading: subscriptionLoading } = useUserSubscription(
    selectedMember?.id ?? '',
  );
  const { plans } = usePlans();
  const changePlanMutation = useChangePlan();

  const currentPlanId = subscription?.planId ?? '';
  const hasSubscription = !!subscription;
  const canSubmit = selectedPlanId && selectedPlanId !== currentPlanId && selectedMember;

  const handleSubmit = () => {
    if (!selectedMember || !selectedPlanId) return;
    changePlanMutation.mutate(
      { planId: selectedPlanId, userId: selectedMember.id },
      {
        onSuccess: () => {
          setSelectedPlanId('');
        },
      },
    );
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setSelectedPlanId('');
  };

  return (
    <>
      <SectionHeader
        title="Change Subscription Plan"
        description="Search for a member to view and change their subscription plan"
      />

      <Card className="border-hairline bg-surface-card">
        <CardContent className="pt-6">
          {!selectedMember ? (
            <>
              <p className="text-sm font-medium text-ink mb-3">Select Member</p>
              <MemberSearch onSelect={(member) => setSelectedMember(member as SelectedMember)} />
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-primary/10 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{selectedMember.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedMember.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearMember}>
                Change Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMember && (
        <>
          {subscriptionLoading ? (
            <Card className="border-hairline bg-surface-card">
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="ml-3 text-body">Loading subscription...</p>
              </CardContent>
            </Card>
          ) : hasSubscription ? (
            <Card className="border-hairline bg-surface-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Current Plan
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Plan</p>
                    <p className="text-sm font-medium text-ink mt-1">
                      {subscription?.plan?.name ?? '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Amount</p>
                    <p className="text-sm font-medium text-ink mt-1">
                      {subscription?.planVersion
                        ? formattedAmount(
                            subscription.planVersion.amount,
                            subscription.planVersion.currency,
                          )
                        : '-'}
                      <span className="text-xs text-muted-foreground ml-1">
                        /{subscription?.planVersion?.billingCycle?.toLowerCase() ?? ''}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1 mt-1">
                      {subscription?.status === 'ACTIVE' ? (
                        <BadgeCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-ink">{subscription?.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Period</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-ink">
                        {subscription?.startDate
                          ? new Date(subscription.startDate).toLocaleDateString()
                          : '-'}
                        {' — '}
                        {subscription?.endDate
                          ? new Date(subscription.endDate).toLocaleDateString()
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-hairline bg-surface-card">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <XCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-ink">No Active Subscription</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This member does not have an active subscription. Select a plan below to subscribe
                  them.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-hairline bg-surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  New Plan
                </h2>
              </div>

              <div className="max-w-sm">
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} — {formattedAmount(plan.activeVersion?.amount ?? 0)}/
                        {plan.activeVersion?.billingCycle?.toLowerCase() ?? ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlanId && selectedPlanId === currentPlanId && (
                <p className="text-xs text-amber-600 mt-2">
                  This is the member&apos;s current plan. Select a different plan to change.
                </p>
              )}

              <div className="mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || changePlanMutation.isPending}
                >
                  {changePlanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Plan...
                    </>
                  ) : (
                    'Change Plan'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/subscriptions/pages/change-plan.tsx
git commit -m "feat: add ChangePlanPage component"
```

---

### Task 6: Create route wrapper page

**Files:**

- Create: `src/app/(dashboard)/subscriptions/change-plan/page.tsx`

- [ ] **Step 1: Create route wrapper**

Create `src/app/(dashboard)/subscriptions/change-plan/page.tsx`:

```tsx
import { ChangePlanPage } from '@src/features/subscriptions/pages/change-plan';

export default function Page() {
  return <ChangePlanPage />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/subscriptions/change-plan/page.tsx
git commit -m "feat: add change-plan route page"
```

---

### Task 7: Export ChangePlanPage from the subscriptions pages barrel

**Files:**

- Modify: `src/features/subscriptions/pages/index.ts`

- [ ] **Step 1: Add export**

Edit `src/features/subscriptions/pages/index.ts`:

```ts
export { default as PlansPage } from './plans';
export * from './plan-detail';
export * from './my-subscription';
export * from './change-plan';
```

- [ ] **Step 2: Commit**

```bash
git add src/features/subscriptions/pages/index.ts
git commit -m "feat: export ChangePlanPage from pages barrel"
```

---

## Self-Review

**Spec coverage:**

- Task 3 covers the `useUserSubscription` query hook that will call the future backend endpoint
- Task 4 covers the mutation to call the existing upgrade endpoint with `userId`
- Task 5 covers the full page with member search, current plan display, plan selector, and submit
- Task 1-2, 6-7 cover infrastructure (endpoints, validators, routing, exports)

**Placeholder scan:** No TBDs, TODOs, or vague placeholders remain.

**Type consistency:** `useChangePlan` accepts `{ planId: string, userId: string }` matching `UpgradeSubscriptionInput` from Task 2. `useUserSubscription` returns `{ subscription: Subscription | null }` matching the `Subscription` type.
