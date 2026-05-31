# Subscription Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subscription tab that fetches plans from `/api/subscriptions/plans`, displays a single primary plan, and includes a payment button. Uses the existing `@src/features/subscription` structure.

**Architecture:** Use React Query for data fetching, leverage existing constants and hooks in the subscription feature module, and integrate the screen into the main tab navigation as "Subscription".

**Tech Stack:** React Native (Expo), React Query (TanStack Query), NativeWind (Tailwind CSS), Ionicons.

---

### Task 1: Define Subscription Types

**Files:**
- Create: `src/features/subscription/types/subscription.types.ts`
- Modify: `src/features/subscription/types/index.ts`

- [ ] **Step 1: Create `subscription.types.ts`**

```typescript
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}
```

- [ ] **Step 2: Update `index.ts` to export types**

```typescript
export * from './subscription.types';
```

---

### Task 2: Update Subscription Endpoints

**Files:**
- Modify: `src/features/subscription/utils/constants/endpoints.ts`

- [ ] **Step 1: Update `endpoints.ts` to include plans endpoint**

```typescript
export const SubScriptionEndpoints = {
  list: () => `/subscriptions`,
  plans: () => `/subscriptions/plans`,
} as const;
```

---

### Task 3: Update Fetching Hook

**Files:**
- Modify: `src/features/subscription/hooks/use-subscriptions.ts`
- Modify: `src/features/subscription/hooks/index.ts`

- [ ] **Step 1: Update `use-subscriptions.ts` to fetch plans specifically**

```typescript
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { SubScriptionEndpoints } from '../utils/constants/endpoints';
import { SubscriptionPlan } from '../types';

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () => {
      const response = await http.get<SubscriptionPlan[]>(SubScriptionEndpoints.plans());
      return response.data;
    },
  });
}
```

- [ ] **Step 2: Update `index.ts` to export the new hook**

```typescript
export { useSubscriptionPlans } from './use-subscriptions';
```

---

### Task 4: Create Subscription Screen

**Files:**
- Create: `src/features/subscription/screens/subscription.screen.tsx`
- Modify: `src/features/subscription/screens/index.ts`

- [ ] **Step 1: Create `subscription.screen.tsx`**

```tsx
import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useSubscriptionPlans } from '../hooks';
import { Container, StackHeader } from '@src/shared/components';
import { Card, CardContent, Text, Button } from '@src/shared/components/ui';
import { Ionicons } from '@expo/vector-icons';

export const SubscriptionScreen = () => {
  const { data: plans, isLoading, isError, refetch } = useSubscriptionPlans();

  if (isLoading) {
    return (
      <Container>
        <StackHeader title="Subscription" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </Container>
    );
  }

  // Only show the first plan as per requirements
  const plan = plans?.[0];

  return (
    <Container>
      <StackHeader title="Subscription" />
      <ScrollView className="flex-1 p-4">
        {!plan ? (
          <View className="items-center justify-center py-20">
            <Text>No subscription plans available at the moment.</Text>
            <Button title="Retry" onPress={() => refetch()} className="mt-4" />
          </View>
        ) : (
          <Card className="border-indigo-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-6">
              <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20">
                <Ionicons name="star" size={24} color="#4f46e5" />
              </View>
              
              <Text variant="heading" size="xl" className="mb-1 text-slate-900 dark:text-white">
                {plan.name}
              </Text>
              <Text variant="subtext" className="mb-6">
                {plan.description}
              </Text>

              <View className="mb-6 flex-row items-baseline">
                <Text variant="heading" size="3xl" className="text-indigo-600 dark:text-indigo-400">
                  ${plan.price}
                </Text>
                <Text variant="subtext" className="ml-1">
                  /{plan.interval}
                </Text>
              </View>

              <View className="mb-8 gap-y-3">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row items-center gap-x-3">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text className="text-slate-600 dark:text-slate-400">{feature}</Text>
                  </View>
                ))}
              </View>

              <Button 
                title="Pay for Subscription" 
                className="h-14 rounded-2xl bg-indigo-600"
                onPress={() => console.log('Payment initiated for:', plan.id)}
              />
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </Container>
  );
};
```

- [ ] **Step 2: Update `index.ts` to export screens**

```typescript
export { SubscriptionScreen } from './subscription.screen';
```

---

### Task 5: Update Feature Entry Point

**Files:**
- Modify: `src/features/subscription/index.ts`

- [ ] **Step 1: Update `index.ts`**

```typescript
export * from './hooks';
export * from './screens';
export * from './types';
```

---

### Task 6: Integrate into Navigation Tabs

**Files:**
- Modify: `src/app/(protected)/(drawer)/(tabs)/_layout.tsx`
- Create: `src/app/(protected)/(drawer)/(tabs)/subscription.tsx`

- [ ] **Step 1: Add tab to `_layout.tsx`**

Add after Profile tab:
```tsx
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'Subscription',
          tabBarIcon: ({ color }) => <TabBarIcon name="card" color={color} />,
        }}
      />
```

- [ ] **Step 2: Create route file `subscription.tsx`**

```tsx
import { SubscriptionScreen } from '@src/features/subscription';
export default SubscriptionScreen;
```
