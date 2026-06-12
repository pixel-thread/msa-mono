# My Contributions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Subscription screen's "History" tab with a "Contributions" tab showing the user's contribution periods with paid/due/pending filters.

**Architecture:** Fetch from existing `GET /contributions/my` endpoint, display in a `FlashList` with summary cards and filter chips. Contributions are contribution periods (month/year buckets) with status DUE/PAID/PARTIAL/WAIVED.

**Tech Stack:** Expo Router, TanStack Query, NativeWind, FlashList, TypeScript

---

### Task 1: Contribution Period Types

**Files:**

- Create: `src/features/contributions/types/contribution-period.types.ts`
- Modify: `src/features/contributions/types/index.ts`

- [ ] **Step 1: Create the types file**

```ts
export type ContributionStatus = 'DUE' | 'PAID' | 'PARTIAL' | 'WAIVED';

export interface ContributionPeriodPaymentTransaction {
  id: string;
  amount: number;
  method: string | null;
  status: string;
  paidAt: string | null;
}

export interface ContributionPeriodAllocation {
  id: string;
  allocatedAmount: number;
  paymentTransaction: ContributionPeriodPaymentTransaction;
}

export interface ContributionPeriod {
  id: string;
  associationId: string;
  userId: string;
  year: number;
  month: number;
  expectedAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: ContributionStatus;
  dueDate: string;
  waivedAt: string | null;
  waivedReason: string | null;
  createdAt: string;
  updatedAt: string;
  allocations: ContributionPeriodAllocation[];
}
```

- [ ] **Step 2: Update `types/index.ts`**

```ts
export * from './declaration.types';
export * from './contribution-period.types';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/contributions/types/contribution-period.types.ts src/features/contributions/types/index.ts
git commit -m "feat: add ContributionPeriod types for my contributions"
```

---

### Task 2: useMyContributions Hook

**Files:**

- Create: `src/features/contributions/hooks/use-my-contributions.ts`
- Modify: `src/features/contributions/hooks/index.ts`

- [ ] **Step 1: Create the hook file**

```ts
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { ContributionPeriod } from '../types';

export const useMyContributions = (status?: string) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(undefined, status),
    queryFn: async () => {
      const params = status ? { status } : undefined;
      return http.get<ContributionPeriod[]>(ENDPOINTS.CONTRIBUTION.MY, { params });
    },
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    meta: query.data?.meta,
  };
};
```

- [ ] **Step 2: Update `hooks/index.ts`**

```ts
export * from './use-declarations';
export * from './use-create-declaration';
export * from './use-my-contributions';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/contributions/hooks/use-my-contributions.ts src/features/contributions/hooks/index.ts
git commit -m "feat: add useMyContributions hook"
```

---

### Task 3: MyContributions Component

**Files:**

- Create: `src/features/contributions/components/my-contributions.tsx`
- Modify: `src/features/contributions/components/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyContributions } from './my-contributions';

jest.mock('../hooks/use-my-contributions', () => ({
  useMyContributions: jest.fn(),
}));

import { useMyContributions } from '../hooks/use-my-contributions';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('MyContributions', () => {
  it('shows loading state', () => {
    (useMyContributions as jest.Mock).mockReturnValue({ isLoading: true, data: [] });
    const tree = render(<MyContributions />, { wrapper: createWrapper() });
    expect(tree.getByTestId('contributions-loading')).toBeTruthy();
  });

  it('shows error state', () => {
    (useMyContributions as jest.Mock).mockReturnValue({
      isError: true,
      isLoading: false,
      data: [],
    });
    const tree = render(<MyContributions />, { wrapper: createWrapper() });
    expect(tree.getByText(/failed to load/i)).toBeTruthy();
  });

  it('shows empty state when no data', () => {
    (useMyContributions as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    const tree = render(<MyContributions />, { wrapper: createWrapper() });
    expect(tree.getByText(/no contributions/i)).toBeTruthy();
  });

  it('renders contributions list', () => {
    (useMyContributions as jest.Mock).mockReturnValue({
      data: [
        {
          id: '1',
          year: 2026,
          month: 6,
          expectedAmount: 100,
          paidAmount: 100,
          dueAmount: 0,
          status: 'PAID',
          dueDate: '2026-06-01',
          allocations: [],
        },
        {
          id: '2',
          year: 2026,
          month: 7,
          expectedAmount: 100,
          paidAmount: 0,
          dueAmount: 100,
          status: 'DUE',
          dueDate: '2026-07-01',
          allocations: [],
        },
      ],
      isLoading: false,
      isError: false,
    });
    const tree = render(<MyContributions />, { wrapper: createWrapper() });
    expect(tree.getByText('June 2026')).toBeTruthy();
    expect(tree.getByText('July 2026')).toBeTruthy();
  });

  it('shows summary cards', () => {
    (useMyContributions as jest.Mock).mockReturnValue({
      data: [
        {
          id: '1',
          year: 2026,
          month: 6,
          expectedAmount: 100,
          paidAmount: 100,
          dueAmount: 0,
          status: 'PAID',
          dueDate: '2026-06-01',
          allocations: [],
        },
        {
          id: '2',
          year: 2026,
          month: 7,
          expectedAmount: 100,
          paidAmount: 0,
          dueAmount: 100,
          status: 'DUE',
          dueDate: '2026-07-01',
          allocations: [],
        },
      ],
      isLoading: false,
      isError: false,
    });
    const tree = render(<MyContributions />, { wrapper: createWrapper() });
    expect(tree.getByText(/paid/i)).toBeTruthy();
    expect(tree.getByText(/due/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/contributions/components/__tests__/my-contributions.test.tsx -v`
Expected: FAIL with module not found

Note: If test setup doesn't exist, skip testing files and proceed to implementation.

- [ ] **Step 3: Create `my-contributions.tsx`**

```tsx
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useMyContributions } from '../hooks';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@src/shared/lib/cn';
import { formatCurrency } from '@src/shared/utils/format';
import type { ContributionPeriod, ContributionStatus } from '../types';

type FilterType = 'all' | 'paid' | 'due' | 'pending';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'due', label: 'Due' },
  { key: 'pending', label: 'Pending' },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getStatusColor(status: ContributionStatus) {
  switch (status) {
    case 'PAID':
      return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    case 'DUE':
      return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
    case 'PARTIAL':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    case 'WAIVED':
      return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400';
  }
}

function getStatusBadgeStyle(status: ContributionStatus) {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'DUE':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'PARTIAL':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'WAIVED':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
}

function isDueDatePast(dueDate: string): boolean {
  return new Date(dueDate) <= new Date();
}

function ContributionStatusBadge({ status }: { status: ContributionStatus }) {
  return (
    <View className={cn('self-start rounded px-2 py-0.5', getStatusBadgeStyle(status))}>
      <Text size="xs" weight="medium">
        {status}
      </Text>
    </View>
  );
}

function ContributionRow({ item }: { item: ContributionPeriod }) {
  const monthLabel = MONTHS[item.month - 1] ?? `Month ${item.month}`;
  const dueDate = new Date(item.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View className="mb-3">
      <Card className="overflow-hidden border-slate-100 dark:border-slate-800">
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text weight="semibold" size="md" className="text-slate-900 dark:text-white">
                {monthLabel} {item.year}
              </Text>
              <Text variant="subtext" size="xs" className="mt-1">
                Due: {dueDate}
              </Text>
              <View className="mt-2 flex-row items-center gap-x-3">
                <Text weight="bold" size="lg" className="text-slate-900 dark:text-white">
                  {formatCurrency(item.expectedAmount)}
                </Text>
                {item.paidAmount > 0 && (
                  <Text size="sm" variant="subtext">
                    Paid: {formatCurrency(item.paidAmount)}
                  </Text>
                )}
              </View>
            </View>
            <ContributionStatusBadge status={item.status} />
          </View>
        </CardContent>
      </Card>
    </View>
  );
}

export const MyContributions = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { data, isLoading, isError, refetch, isRefetching } = useMyContributions(
    activeFilter === 'paid'
      ? 'PAID'
      : activeFilter === 'due' || activeFilter === 'pending'
        ? 'DUE'
        : undefined
  );

  const { filteredData, summary } = useMemo(() => {
    const now = new Date();
    const filtered = data.filter((item) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'paid') return item.status === 'PAID' || item.status === 'PARTIAL';
      if (activeFilter === 'due') return item.status === 'DUE' && new Date(item.dueDate) <= now;
      if (activeFilter === 'pending') return item.status === 'DUE' && new Date(item.dueDate) > now;
      return true;
    });

    const totalPaid = data
      .filter((i) => i.status === 'PAID' || i.status === 'PARTIAL')
      .reduce((s, i) => s + i.paidAmount, 0);
    const totalDue = data
      .filter((i) => i.status === 'DUE' && new Date(i.dueDate) <= now)
      .reduce((s, i) => s + i.dueAmount, 0);
    const pendingCount = data.filter((i) => i.status === 'DUE' && new Date(i.dueDate) > now).length;
    const waivedTotal = data
      .filter((i) => i.status === 'WAIVED')
      .reduce((s, i) => s + i.expectedAmount, 0);

    return {
      filteredData: filtered,
      summary: { totalPaid, totalDue, pendingCount, waivedTotal },
    };
  }, [data, activeFilter]);

  if (isLoading) {
    return (
      <View className="items-center justify-center py-12" testID="contributions-loading">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center justify-center py-12">
        <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
        <Text variant="subtext" className="mt-3 text-center">
          Failed to load contributions.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-4 rounded bg-indigo-600 px-6 py-2">
          <Text className="font-medium text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Summary Cards */}
      <View className="mb-4 flex-row flex-wrap gap-2">
        {[
          {
            label: 'Total Paid',
            value: formatCurrency(summary.totalPaid),
            color: 'text-green-600',
          },
          { label: 'Total Due', value: formatCurrency(summary.totalDue), color: 'text-amber-600' },
          { label: 'Pending', value: String(summary.pendingCount), color: 'text-slate-600' },
          { label: 'Waived', value: formatCurrency(summary.waivedTotal), color: 'text-slate-400' },
        ].map((stat, idx) => (
          <View
            key={idx}
            className="min-w-[45%] flex-1 border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <Text variant="subtext" size="xs" className="mb-1 uppercase tracking-wider">
              {stat.label}
            </Text>
            <Text variant="heading" size="md" className={stat.color}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Filter Chips */}
      <View className="mb-4 flex-row gap-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              className={cn(
                'rounded-full px-4 py-2',
                active
                  ? 'bg-indigo-600'
                  : 'border border-slate-200 bg-transparent dark:border-slate-700'
              )}>
              <Text
                size="sm"
                weight="medium"
                className={active ? 'text-white' : 'text-slate-600 dark:text-slate-400'}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {filteredData.length === 0 ? (
        <View className="items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-900/30">
          <Ionicons name="receipt-outline" size={40} color="#94a3b8" />
          <Text variant="subtext" className="mt-2">
            No contributions found
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredData}
          renderItem={({ item }) => <ContributionRow item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
          }
        />
      )}
    </View>
  );
};
```

- [ ] **Step 4: Update `components/index.ts`**

```ts
export * from './declaration-status-badge';
export * from './declaration-card';
export * from './my-contributions';
```

- [ ] **Step 5: Run the tests (if test infra exists)**

Run: `npx jest src/features/contributions/components/__tests__/my-contributions.test.tsx -v`
Expected: PASS

- [ ] **Step 6: Manually verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 7: Commit**

```bash
git add src/features/contributions/components/my-contributions.tsx src/features/contributions/components/index.ts
git commit -m "feat: add MyContributions component"
```

---

### Task 4: Update Subscription Screen

**Files:**

- Modify: `src/features/subscription/screens/subscription.screen.tsx`

- [ ] **Step 1: Modify subscription screen**

Replace the `PaymentHistory` import with `MyContributions`:

Change:

```tsx
import { PaymentHistory } from '../components';
```

To:

```tsx
import { MyContributions } from '@src/features/contributions/components';
```

Change:

```tsx
const [activeTab, setActiveTab] = useState<'plan' | 'history'>('plan');
```

To:

```tsx
const [activeTab, setActiveTab] = useState<'plan' | 'contributions'>('plan');
```

Change the tabs array:

```tsx
{(['plan', 'history'] as const).map((tab) => {
```

To:

```tsx
{(['plan', 'contributions'] as const).map((tab) => {
```

Change the history tab icon:

```tsx
name={tab === 'plan' ? 'receipt-outline' : 'time-outline'}
```

To:

```tsx
name={tab === 'plan' ? 'receipt-outline' : 'wallet-outline'}
```

Change the history tab label to display "Contributions" instead of "history":
Keep the `capitalize` class but the value will now be `contributions` which will display as "Contributions" with capitalize.

Actually, looking at the current code, `{tab}` is used directly with `capitalize`. For `'history'` it shows "History" and for `'contributions'` it will show "Contributions".

Replace the content section:
Change:

```tsx
{activeTab === 'plan' ? (
  ...
) : (
  <ScrollView ...>
    <PaymentHistory />
  </ScrollView>
)}
```

To:

```tsx
{activeTab === 'plan' ? (
  <>
    <ScrollView ...>
      ... (same plan content) ...
    </ScrollView>
    {plan && <PayButton />}
  </>
) : (
  <ScrollView
    className="flex-1"
    contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    showsVerticalScrollIndicator={false}>
    <MyContributions />
  </ScrollView>
)}
```

The full changed file:

```tsx
import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useSubscriptionPlans } from '../hooks';

import { Container, StackHeader } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';

import { EmptyScreen, ErrorScreen, LoadingScreen } from '@src/shared/components/screens';
import { ErrorBoundary } from '@components/common/error-boundary';

import { MyContributions } from '@src/features/contributions/components';
import { PayButton } from '../components/pay-button';

import { formatSubscriptionBillingCycle } from '@src/shared/utils';

const Divider = () => <View className="h-px bg-slate-100 dark:bg-slate-800/60" />;

export const SubscriptionScreen = () => {
  const [activeTab, setActiveTab] = useState<'plan' | 'contributions'>('plan');

  const { data: plan, isLoading, isError, refetch } = useSubscriptionPlans();

  if (isLoading) {
    return (
      <>
        <StackHeader showBackButton title="Subscription" />
        <LoadingScreen message="Loading subscription plans..." />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader title="Subscription" showBackButton />
        <ErrorScreen
          title="Failed to load plans"
          message="There was an error retrieving the subscription plans."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <StackHeader title="Subscription" showBackButton />
        <EmptyScreen
          title="No plans found"
          description="There are no subscription plans available."
        />
      </>
    );
  }

  return (
    <ErrorBoundary isComponentError componentName="SubscriptionScreen">
      <Container>
        <StackHeader title="Subscription" showBackButton />

        {/* Tab Bar */}
        <View className="flex-row border-b border-slate-100 px-6 dark:border-slate-800">
          {(['plan', 'contributions'] as const).map((tab) => {
            const active = activeTab === tab;

            return (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className="flex-1 py-4">
                <View className="flex-row items-center justify-center gap-x-2">
                  <Ionicons
                    name={tab === 'plan' ? 'receipt-outline' : 'wallet-outline'}
                    size={20}
                    color={active ? '#6366f1' : '#94a3b8'}
                  />
                  <Text
                    className={`text-center text-base font-semibold capitalize ${
                      active
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                    {tab}
                  </Text>
                </View>
                {active && (
                  <View className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'plan' ? (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{
                padding: 24,
                paddingBottom: 160,
              }}>
              <View>
                {/* Plan Header */}
                <View className="mb-8">
                  <Text
                    variant="subtext"
                    size="xs"
                    className="mb-2 font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Current Plan
                  </Text>
                  <Text variant="heading" size="2xl" className="text-slate-900 dark:text-white">
                    {plan.name}
                  </Text>
                  {plan.description && (
                    <Text variant="subtext" size="sm" className="mt-2 leading-relaxed">
                      {plan.description}
                    </Text>
                  )}
                </View>

                <Divider />

                {/* Pricing */}
                <View className="my-8 flex-row items-end">
                  <Text className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                    ₹
                    {plan?.activeVersion?.amount
                      ? Number(plan?.activeVersion?.amount).toFixed(2)
                      : 0}
                  </Text>
                  <Text className="mb-1.5 ml-2 text-base text-slate-400 dark:text-slate-500">
                    / {formatSubscriptionBillingCycle(plan.activeVersion.billingCycle)}
                  </Text>
                </View>

                <Divider />

                {/* Details */}
                <View className="mt-8">
                  <Text
                    variant="subtext"
                    size="xs"
                    className="mb-3 font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    About
                  </Text>
                  <Text className="text-base leading-7 text-slate-600 dark:text-slate-300">
                    Your subscription supports the association&apos;s operations, events, and member
                    welfare programs. Payments are processed securely through Razorpay and a receipt
                    will be generated after each transaction.
                  </Text>
                </View>

                {/* Info Row */}
                <View className="mt-8 flex-row items-center gap-x-3 bg-slate-50 px-4 py-3.5 dark:bg-slate-900/50">
                  <Ionicons name="shield-checkmark-outline" size={18} color="#6366f1" />
                  <Text variant="subtext" size="sm" className="flex-1 leading-snug">
                    Secure payments powered by Razorpay
                  </Text>
                </View>
              </View>
            </ScrollView>

            {plan && <PayButton />}
          </>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              padding: 24,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}>
            <MyContributions />
          </ScrollView>
        )}
      </Container>
    </ErrorBoundary>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/subscription/screens/subscription.screen.tsx
git commit -m "feat: replace History tab with Contributions tab on Subscription screen"
```
