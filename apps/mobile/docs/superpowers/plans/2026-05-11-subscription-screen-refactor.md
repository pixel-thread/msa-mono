# Subscription Screen Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Subscription screen to a full-screen "Hero Marketing" layout inspired by Webflow, focusing on a single high-impact card.

**Architecture:** Decompose the UI into focused sub-components (`SubscriptionHero`, `FeatureGrid`) to manage the increased detail. Use `ScrollView` with `flexGrow: 1` to ensure the layout fills the screen.

**Tech Stack:** React Native, NativeWind (Tailwind), Expo Router, Ionicons.

---

### Task 1: Create FeatureGrid Component

**Files:**
- Create: `src/features/subscription/components/feature-grid.component.tsx`

- [ ] **Step 1: Implement the FeatureGrid component**
Define a component that accepts a `features` object and renders a 2-column wrapping grid.

```tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionFeatures } from '../types/subscription.types';

interface FeatureGridProps {
  features: SubscriptionFeatures;
}

export const FeatureGrid = ({ features }: FeatureGridProps) => {
  const featureList = Object.entries(features).filter(([_, value]) => value === true);

  return (
    <View className="flex-row flex-wrap mt-8">
      {featureList.map(([key]) => (
        <View key={key} className="w-1/2 flex-row items-center mb-6 pr-2">
          <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
            <Ionicons name="checkmark-circle" size={16} color="#146ef5" />
          </View>
          <Text variant="body" size="sm" className="capitalize text-slate-900 dark:text-white font-medium">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Text>
        </View>
      ))}
    </View>
  );
};
```

- [ ] **Step 2: Export the component**
Update `src/features/subscription/components/index.ts` (create if doesn't exist).

```tsx
export * from './feature-grid.component.tsx';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/subscription/components/
git commit -m "feat(subscription): add FeatureGrid component"
```

---

### Task 2: Create SubscriptionHero Component

**Files:**
- Create: `src/features/subscription/components/subscription-hero.component.tsx`

- [ ] **Step 1: Implement the SubscriptionHero component**
Focus on the large price display and uppercase plan name.

```tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';

interface SubscriptionHeroProps {
  name: string;
  amount: string;
  billingCycle: string;
}

export const SubscriptionHero = ({ name, amount, billingCycle }: SubscriptionHeroProps) => {
  return (
    <View className="items-center py-10">
      <Text 
        className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-500 mb-2"
        style={{ fontFamily: 'System' }}
      >
        {name}
      </Text>
      <View className="flex-row items-baseline">
        <Text className="text-5xl font-semibold text-[#146ef5]">
          ${amount}
        </Text>
        <Text className="text-slate-500 ml-1 lowercase">
          /{billingCycle}
        </Text>
      </View>
    </View>
  );
};
```

- [ ] **Step 2: Export the component**
Update `src/features/subscription/components/index.ts`.

```tsx
export * from './feature-grid.component';
export * from './subscription-hero.component';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/subscription/components/
git commit -m "feat(subscription): add SubscriptionHero component"
```

---

### Task 3: Refactor SubscriptionScreen Layout

**Files:**
- Modify: `src/features/subscription/screens/subscription.screen.tsx`

- [ ] **Step 1: Update imports and layout structure**
Replace the card content with the new Hero and Grid components. Apply the 5-layer shadow system.

```tsx
import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useSubscriptionPlans } from '../hooks';
import { Container, StackHeader } from '@src/shared/components';
import { Card, CardContent, Text, Button } from '@src/shared/components/ui';
import { ErrorScreen } from '@src/shared/components/screens';
import { ErrorBoundary } from '@components/common/error-boundary';
import { SubscriptionHero, FeatureGrid } from '../components';

export const SubscriptionScreen = () => {
  const { data: plans = [], isLoading, isError, refetch } = useSubscriptionPlans();

  if (isLoading) {
    return (
      <Container>
        <StackHeader title="Subscription" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#146ef5" />
        </View>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <StackHeader title="Subscription" />
        <ErrorScreen
          title="Failed to load plans"
          message="There was an error retrieving the subscription plans. Please try again."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  const plan = plans?.[0];

  return (
    <ErrorBoundary isComponentError componentName="SubscriptionScreen">
      <Container>
        <StackHeader title="Subscription" />
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {!plan ? (
            <View className="flex-1 items-center justify-center py-24">
              <Text variant="heading" size="lg">No plans available</Text>
              <Button title="Refresh" onPress={() => refetch()} className="mt-8 px-8" />
            </View>
          ) : (
            <Card 
              className="flex-1 border-[#d8d8d8] bg-white rounded-[4px]"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.09,
                shadowRadius: 7,
                elevation: 5,
              }}
            >
              <CardContent className="flex-1 p-8 justify-between">
                <View>
                  <SubscriptionHero 
                    name={plan.name} 
                    amount={plan.amount} 
                    billingCycle={plan.billingCycle} 
                  />
                  
                  <View className="h-[1px] bg-[#d8d8d8] w-full my-4" />
                  
                  <Text className="text-slate-600 text-center px-4 leading-6">
                    {plan.description}
                  </Text>

                  <FeatureGrid features={plan.features} />
                </View>

                <View className="mt-auto pt-8">
                  <Button
                    title="Subscribe Now"
                    className="h-14 rounded-[4px] bg-[#146ef5]"
                    onPress={() => console.log('Payment initiated for:', plan.id)}
                  />
                  <Text className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-wider">
                    Secure Payment • Powered by Stripe
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}
        </ScrollView>
      </Container>
    </ErrorBoundary>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/subscription/screens/subscription.screen.tsx
git commit -m "refactor(subscription): implement full-screen hero layout"
```

---

### Task 4: Final Verification

- [ ] **Step 1: Verify layout in browser/emulator**
Ensure the card fills the screen and the 2-column grid aligns correctly.
- [ ] **Step 2: Check dark mode compatibility**
Ensure colors adapt or remain accessible.
