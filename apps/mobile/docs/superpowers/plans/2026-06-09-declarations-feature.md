# Declarations Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Declarations feature with list + create screens, accessible from the drawer navigation.

**Architecture:** New `src/features/contributions/` feature module following existing patterns (announcements, compliance). Uses pre-defined endpoints/query keys from `@repo/shared`. Custom hooks are stubbed for real API integration later.

**Tech Stack:** Expo SDK 54, Expo Router, TanStack React Query, Axios, NativeWind, React Native Reanimated, React Hook Form

---

### Task 1: Declaration Types

**Files:**

- Create: `src/features/contributions/types/declaration.types.ts`
- Create: `src/features/contributions/types/index.ts`

- [ ] **Step 1: Create declaration types file**

```ts
// src/features/contributions/types/declaration.types.ts

export type DeclarationStatus = 'PENDING' | 'APPROVE' | 'REJECT';

export interface DeclarationMember {
  name: string;
  email: string;
  mobile: string;
}

export interface Declaration {
  id: string;
  memberId: string;
  associationId: string;
  declerationStartDate: string;
  declerationEndDate: string;
  amount: string;
  status: DeclarationStatus;
  lastDeclarationDate: string | null;
  reviewBy: string | null;
  reviewAt: string | null;
  remark: string | null;
  member: DeclarationMember;
}
```

- [ ] **Step 2: Create types barrel export**

```ts
// src/features/contributions/types/index.ts

export * from './declaration.types';
```

- [ ] **Step 3: Create feature directories**

```bash
mkdir -p src/features/contributions/{screens,components,hooks,types}
```

Run: `mkdir -p src/features/contributions/{screens,components,hooks,types}`

---

### Task 2: Custom Hooks (use-declarations, use-create-declaration)

**Files:**

- Create: `src/features/contributions/hooks/use-declarations.ts`
- Create: `src/features/contributions/hooks/use-create-declaration.ts`
- Create: `src/features/contributions/hooks/index.ts`

- [ ] **Step 1: Create use-declarations hook**

```ts
// src/features/contributions/hooks/use-declarations.ts

import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { Declaration } from '../types';

export const useDeclarations = () => {
  const query = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS(),
    queryFn: async () => http.get<Declaration[]>(ENDPOINTS.CONTRIBUTION.DECLARATIONS),
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    meta: query.data?.meta,
  };
};
```

- [ ] **Step 2: Create use-create-declaration hook**

```ts
// src/features/contributions/hooks/use-create-declaration.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
// import { toast } from 'sonner-native'; // uncomment when real API is connected

export const useCreateDeclaration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { amount: number }) => http.post(ENDPOINTS.CONTRIBUTION.DECLARATIONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS() });
      // toast.success('Declaration submitted successfully');
    },
    onError: (error: any) => {
      // toast.error(error?.message || 'Failed to submit declaration');
    },
  });
};
```

- [ ] **Step 3: Create hooks barrel export**

```ts
// src/features/contributions/hooks/index.ts

export * from './use-declarations';
export * from './use-create-declaration';
```

---

### Task 3: Declaration Status Badge Component

**Files:**

- Create: `src/features/contributions/components/declaration-status-badge.tsx`

- [ ] **Step 1: Create status badge component**

```tsx
// src/features/contributions/components/declaration-status-badge.tsx

import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import type { DeclarationStatus } from '../types';

const statusStyles: Record<DeclarationStatus, { bg: string; text: string; label: string }> = {
  PENDING: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    label: 'Pending',
  },
  APPROVE: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    label: 'Approved',
  },
  REJECT: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    label: 'Rejected',
  },
};

interface DeclarationStatusBadgeProps {
  status: DeclarationStatus;
}

export const DeclarationStatusBadge = ({ status }: DeclarationStatusBadgeProps) => {
  const style = statusStyles[status];

  return (
    <View className={`self-start rounded px-2 py-0.5 ${style.bg}`}>
      <Text size="xs" weight="medium" className={style.text}>
        {style.label}
      </Text>
    </View>
  );
};
```

---

### Task 4: Declaration Card Component

**Files:**

- Create: `src/features/contributions/components/declaration-card.tsx`
- Modify: `src/features/contributions/components/index.ts` (create)

- [ ] **Step 1: Create declaration card component**

```tsx
// src/features/contributions/components/declaration-card.tsx

import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { formattedDate } from '@src/shared/utils/format';
import { DeclarationStatusBadge } from './declaration-status-badge';
import type { Declaration } from '../types';

interface DeclarationCardProps {
  declaration: Declaration;
}

export const DeclarationCard = ({ declaration }: DeclarationCardProps) => {
  const startDate = new Date(declaration.declerationStartDate);
  const endDate = new Date(declaration.declerationEndDate);

  return (
    <View className="mb-4">
      <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="mb-2 flex-row items-center gap-x-2">
                <DeclarationStatusBadge status={declaration.status} />
                <Text size="xs" variant="subtext">
                  {formattedDate(startDate)} - {formattedDate(endDate)}
                </Text>
              </View>

              <Text
                weight="semibold"
                variant="heading"
                size="xl"
                className="mb-2 text-slate-900 dark:text-white">
                ₹{declaration.amount}
              </Text>

              <View className="flex-row items-center gap-x-1">
                <Ionicons name="person-outline" size={12} color="#64748b" />
                <Text variant="subtext" size="sm" className="text-slate-600 dark:text-slate-400">
                  {declaration.member.name}
                </Text>
              </View>

              {declaration.remark && (
                <View className="mt-2 rounded bg-slate-50 p-2 dark:bg-slate-900">
                  <Text variant="subtext" size="xs" className="text-slate-500">
                    {declaration.remark}
                  </Text>
                </View>
              )}
            </View>

            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </View>
        </CardContent>
      </Card>
    </View>
  );
};
```

- [ ] **Step 2: Create components barrel export**

```ts
// src/features/contributions/components/index.ts

export * from './declaration-status-badge';
export * from './declaration-card';
```

---

### Task 5: Declaration List Screen

**Files:**

- Create: `src/features/contributions/screens/declaration-list.screen.tsx`

- [ ] **Step 1: Create list screen**

```tsx
// src/features/contributions/screens/declaration-list.screen.tsx

import React from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeclarations } from '../hooks';
import { DeclarationCard } from '../components';
import { Container, StackHeader } from '@src/shared/components';
import { LoadingScreen, ErrorScreen } from '@src/shared/components/screens';
import { Text } from '@src/shared/components/ui';
import { TouchableOpacity } from 'react-native';

export const DeclarationListScreen = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useDeclarations();

  if (isLoading) {
    return (
      <>
        <StackHeader showBackButton title="Declarations" />
        <LoadingScreen message="Loading declarations..." />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader showBackButton title="Declarations" />
        <ErrorScreen
          title="Failed to load declarations"
          message="There was an error retrieving declarations. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <Container>
      <StackHeader
        title="Declarations"
        showBackButton
        right={
          <TouchableOpacity
            onPress={() => router.push('/(protected)/declarations/create')}
            activeOpacity={0.7}>
            <Ionicons name="add" size={24} color="#6366f1" />
          </TouchableOpacity>
        }
      />
      <FlashList
        data={data}
        renderItem={({ item }) => <DeclarationCard declaration={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        estimatedItemSize={150}
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <View className="mb-6 h-20 w-20 items-center justify-center bg-slate-100 dark:bg-slate-900">
              <Ionicons name="document-text-outline" size={32} color="#6366f1" />
            </View>
            <Text variant="heading" size="lg" className="text-slate-900 dark:text-white">
              No declarations
            </Text>
            <Text variant="subtext" size="sm" className="mt-2 text-center">
              Tap the + button to create your first declaration.
            </Text>
          </View>
        }
      />
    </Container>
  );
};
```

---

### Task 6: Create Declaration Screen

**Files:**

- Create: `src/features/contributions/screens/create-declaration.screen.tsx`

- [ ] **Step 1: Create create-declaration screen**

```tsx
// src/features/contributions/screens/create-declaration.screen.tsx

import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDeclaration } from '../hooks';
import { Container, StackHeader } from '@src/shared/components';
import { Text, Button, FieldInput } from '@src/shared/components/ui';

const createDeclarationSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Amount is required' })
    .positive('Amount must be positive')
    .min(1, 'Minimum amount is 1'),
});

type CreateDeclarationForm = z.infer<typeof createDeclarationSchema>;

export const CreateDeclarationScreen = () => {
  const router = useRouter();
  const { mutate, isPending } = useCreateDeclaration();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDeclarationForm>({
    resolver: zodResolver(createDeclarationSchema),
    defaultValues: { amount: undefined },
  });

  const onSubmit = (data: CreateDeclarationForm) => {
    mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <Container>
      <StackHeader title="New Declaration" showBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 p-4">
          <View className="mb-8">
            <Text
              variant="heading"
              size="2xl"
              weight="bold"
              className="mb-1 text-slate-900 dark:text-white">
              New Declaration
            </Text>
            <Text variant="subtext" size="sm">
              Submit a declaration for the current period.
            </Text>
          </View>

          <View className="mb-6">
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  label="Amount (₹)"
                  placeholder="Enter declaration amount"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value?.toString() ?? ''}
                  error={errors.amount?.message}
                />
              )}
            />
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            loading={isPending}
            className="w-full">
            Submit Declaration
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};
```

---

### Task 7: Feature Barrel Export & Screens Barrel

**Files:**

- Create: `src/features/contributions/screens/index.ts`
- Create: `src/features/contributions/index.ts`

- [ ] **Step 1: Create screens barrel export**

```ts
// src/features/contributions/screens/index.ts

export * from './declaration-list.screen';
export * from './create-declaration.screen';
```

- [ ] **Step 2: Create feature barrel export**

```ts
// src/features/contributions/index.ts

export * from './hooks';
export * from './screens';
export * from './components';
export * from './types';
```

---

### Task 8: Route Files

**Files:**

- Create: `src/app/(protected)/declarations/index.tsx`
- Create: `src/app/(protected)/declarations/create.tsx`

- [ ] **Step 1: Create list route**

```tsx
// src/app/(protected)/declarations/index.tsx

import React from 'react';
import { DeclarationListScreen } from '@src/features/contributions';

export default function DeclarationsPage() {
  return <DeclarationListScreen />;
}
```

- [ ] **Step 2: Create create route**

```tsx
// src/app/(protected)/declarations/create.tsx

import React from 'react';
import { CreateDeclarationScreen } from '@src/features/contributions';

export default function CreateDeclarationPage() {
  return <CreateDeclarationScreen />;
}
```

---

### Task 9: Drawer Configuration

**Files:**

- Modify: `src/shared/constants/drawer.ts`

- [ ] **Step 1: Add Declarations to drawer menu**

Insert after "Consent" item in the "Main Menu" group:

```ts
      {
        label: 'Declarations',
        icon: 'document-text-outline',
        href: '/(protected)/declarations',
      },
```
