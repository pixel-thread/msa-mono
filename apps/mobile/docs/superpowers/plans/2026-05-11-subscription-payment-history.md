# Subscription Payment History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the Subscription screen with a detailed user profile header, a tabbed interface, and a comprehensive payment history with a full audit trail.

**Architecture:** Update the Subscription screen to use a local state-controlled tab view. Create reusable sub-components for the user profile, transaction list items (with expandable details), and the overall payment history view (stats grid + list).

**Tech Stack:** React Native, NativeWind, Zustand (Auth Store), React Query (Payment History), Lucide/Ionicons.

---

### Task 1: Create UserProfileHeader Component

**Files:**
- Create: `src/features/subscription/components/user-profile-header.component.tsx`
- Modify: `src/features/subscription/components/index.ts` (if it exists, otherwise create it)

- [x] **Step 1: Write the component implementation**
  Fetch user from `useAuthStore` and display Name, Email, and ID in a card-like header.

```tsx
import React from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@src/shared/store/auth.store';
import { Text } from '@src/shared/components/ui';
import { Ionicons } from '@expo/vector-icons';

export const UserProfileHeader = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <View className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-800">
      <View className="flex-row items-center gap-4">
        <View className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center">
          <Ionicons name="person" size={24} color="#4f46e5" />
        </View>
        <View className="flex-1">
          <Text variant="heading" size="md" className="text-slate-900 dark:text-white">
            {user.name}
          </Text>
          <Text variant="subtext" size="xs" className="text-slate-500">
            {user.email}
          </Text>
          <Text variant="subtext" size="xs" className="mt-1 font-mono text-slate-400">
            ID: {user.id}
          </Text>
        </View>
      </View>
    </View>
  );
};
```

- [x] **Step 2: Export the component**
  Add `export * from './user-profile-header.component';` to `src/features/subscription/components/index.ts`.

- [x] **Step 3: Commit**
```bash
git add src/features/subscription/components/
git commit -m "feat(subscription): add UserProfileHeader component"
```

---

### Task 2: Create TransactionListItem Component

**Files:**
- Create: `src/features/subscription/components/transaction-list-item.component.tsx`

- [x] **Step 1: Write the component implementation**
  Display basic transaction info and an expandable section for the full audit trail (Created By, Allocations).

```tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Transaction } from '../types/payment';
import { Text } from '@src/shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@src/shared/utils/format';

interface Props {
  transaction: Transaction;
}

export const TransactionListItem = ({ transaction }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600';
      case 'PENDING': return 'text-amber-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <TouchableOpacity 
      onPress={toggleExpand}
      className="mb-3 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50"
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text variant="subtext" size="xs" className="mb-1">
            {formatDate(transaction.paymentDate)}
          </Text>
          <Text variant="heading" size="sm">
            {transaction.amount} {transaction.currency}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text variant="subtext" size="xs" className={`${getStatusColor(transaction.status)} font-bold`}>
            {transaction.status}
          </Text>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#94a3b8" />
        </View>
      </View>

      {isExpanded && (
        <View className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
          <View className="flex-row justify-between mb-2">
            <Text variant="subtext" size="xs">Created By</Text>
            <Text variant="subtext" size="xs" className="text-slate-900 dark:text-white">
              {transaction.createdById || 'System'}
            </Text>
          </View>
          
          <Text variant="subtext" size="xs" className="font-bold mb-2">Allocations</Text>
          {transaction.allocations.map((allocation, idx) => (
            <View key={idx} className="flex-row justify-between mb-1 ml-2">
              <Text variant="subtext" size="xs">
                {allocation.contributionPeriod.month}/{allocation.contributionPeriod.year}
              </Text>
              <Text variant="subtext" size="xs" className="text-slate-900 dark:text-white">
                {allocation.allocatedAmount} {transaction.currency}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};
```

- [x] **Step 2: Commit**
```bash
git add src/features/subscription/components/transaction-list-item.component.tsx
git commit -m "feat(subscription): add TransactionListItem component"
```

---

### Task 3: Create PaymentHistory Component

**Files:**
- Create: `src/features/subscription/components/payment-history.component.tsx`

- [x] **Step 1: Write the component implementation**
  Fetch data using `usePaymentHistory`, render the Stats Grid and the List of transactions.

```tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { usePaymentHistory } from '../hooks/use-payment-history';
import { Text, Card, CardContent } from '@src/shared/components/ui';
import { TransactionListItem } from './transaction-list-item.component';

export const PaymentHistory = () => {
  const { data, isLoading, isError } = usePaymentHistory();

  if (isLoading) {
    return <ActivityIndicator size="small" color="#4f46e5" className="py-8" />;
  }

  if (isError || !data) {
    return (
      <View className="py-8 items-center">
        <Text variant="subtext">Failed to load payment history</Text>
      </View>
    );
  }

  const { transactions, summary } = data;

  return (
    <View>
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-2 mb-6">
        {[
          { label: 'Total Paid', value: `${summary.totalPaid}` },
          { label: 'Total Due', value: `${summary.totalDue}` },
          { label: 'Overdue', value: `${summary.overdueMonths} mo` },
          { label: 'Paid', value: `${summary.paidMonths} mo` },
        ].map((stat, idx) => (
          <View key={idx} className="flex-1 min-w-[45%] bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <Text variant="subtext" size="xs" className="mb-1 uppercase tracking-wider">
              {stat.label}
            </Text>
            <Text variant="heading" size="md" className="text-indigo-600 dark:text-indigo-400">
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Transactions List */}
      <Text variant="heading" size="sm" className="mb-4">Recent Transactions</Text>
      {transactions.length === 0 ? (
        <Text variant="subtext" className="text-center py-8">No transactions found</Text>
      ) : (
        transactions.map((t) => <TransactionListItem key={t.id} transaction={t} />)
      )}
    </View>
  );
};
```

- [x] **Step 2: Commit**
```bash
git add src/features/subscription/components/payment-history.component.tsx
git commit -m "feat(subscription): add PaymentHistory component with stats grid"
```

---

### Task 4: Refactor SubscriptionScreen with Tab Layout

**Files:**
- Modify: `src/features/subscription/screens/subscription.screen.tsx`

- [x] **Step 1: Implement the Tab View and Header**
  Introduce `activeTab` state, render `UserProfileHeader`, and switch between Plan and History views.

```tsx
// ... existing imports
import { UserProfileHeader } from '../components/user-profile-header.component';
import { PaymentHistory } from '../components/payment-history.component';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';

export const SubscriptionScreen = () => {
  const [activeTab, setActiveTab] = useState<'plan' | 'history'>('plan');
  // ... existing hooks (plans, paymentOption, verifyPayment)

  // ... loading and error states for plans (keep as is for the Plan tab)

  return (
    <ErrorBoundary isComponentError componentName="SubscriptionScreen">
      <Container>
        <StackHeader title="Subscription" />
        <UserProfileHeader />
        
        {/* Tab Bar */}
        <View className="flex-row border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          {(['plan', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === tab ? 'border-indigo-600' : 'border-transparent'
              }`}
            >
              <Text
                className={`font-semibold capitalize ${
                  activeTab === tab ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {activeTab === 'plan' ? (
            /* Existing Plan Logic */
            !plan ? (
              <View className="items-center justify-center py-24">
                {/* ... existing no plan view */}
              </View>
            ) : (
              <Card className="border-indigo-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* ... existing plan card */}
              </Card>
            )
          ) : (
            <PaymentHistory />
          )}
        </ScrollView>
      </Container>
    </ErrorBoundary>
  );
};
```

- [x] **Step 2: Verify and Commit**
  Ensure all imports are correct and the screens render properly in both tabs.

```bash
git add src/features/subscription/screens/subscription.screen.tsx
git commit -m "feat(subscription): implement tabbed layout and integrate payment history"
```
