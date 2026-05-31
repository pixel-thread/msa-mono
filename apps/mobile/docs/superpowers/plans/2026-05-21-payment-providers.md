# Payment Providers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the UI and state management for adding, listing, detailing, deleting, and activating Payment Providers.

**Architecture:** We use a feature-sliced design under `@src/features/payment-providers/`. We manage API calls via React Query hooks and `http` utility. UI forms use `react-hook-form` + `zod`. Screens are exported from features and mapped in `@src/app/(protected)/payments/providers/`.

**Tech Stack:** React Native, Expo Router, React Query, Zustand, React Hook Form, Zod, NativeWind.

---

### Task 1: Types, Constants, and Validators

**Files:**
- Create: `src/features/payment-providers/types/index.ts`
- Create: `src/features/payment-providers/utils/constants.ts`
- Create: `src/features/payment-providers/validators/index.ts`

- [ ] **Step 1: Write Types**

```typescript
// src/features/payment-providers/types/index.ts
export type ProviderType = 'RAZORPAY' | 'STRIPE' | 'PAYU' | 'CASHFREE';

export interface PaymentProvider {
  id: string;
  associationId: string;
  provider: ProviderType;
  keyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProviderPayload {
  provider: ProviderType;
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  isActive?: boolean;
}
```

- [ ] **Step 2: Write Constants**

```typescript
// src/features/payment-providers/utils/constants.ts
export const paymentProviderEndpoints = {
  list: '/api/payments/providers',
  add: '/api/payments/providers',
  detail: (id: string) => `/api/payments/providers/${id}`,
  update: (id: string) => `/api/payments/providers/${id}`,
  delete: (id: string) => `/api/payments/providers/${id}`,
  activate: (id: string) => `/api/payments/providers/${id}/activate`,
};

export const ProviderQueryKeys = {
  all: () => ['payment-providers'] as const,
  detail: (id: string) => ['payment-providers', id] as const,
};
```

- [ ] **Step 3: Write Validators**

```typescript
// src/features/payment-providers/validators/index.ts
import { z } from 'zod';
import { ProviderType } from '../types';

export const providerTypes: ProviderType[] = ['RAZORPAY', 'STRIPE', 'PAYU', 'CASHFREE'];

export const addProviderSchema = z.object({
  provider: z.enum(['RAZORPAY', 'STRIPE', 'PAYU', 'CASHFREE']),
  keyId: z.string().min(1, 'Key ID is required'),
  keySecret: z.string().min(1, 'Key Secret is required'),
  webhookSecret: z.string().optional(),
});

export type AddProviderFormValues = z.infer<typeof addProviderSchema>;
```

- [ ] **Step 4: Commit**

```bash
git add src/features/payment-providers/types/index.ts src/features/payment-providers/utils/constants.ts src/features/payment-providers/validators/index.ts
git commit -m "feat: add payment provider types, constants, and validators"
```

---

### Task 2: React Query Hooks

**Files:**
- Create: `src/features/payment-providers/hooks/use-payment-providers.ts`
- Create: `src/features/payment-providers/hooks/use-payment-provider-mutations.ts`

- [ ] **Step 1: Write fetch hooks**

```typescript
// src/features/payment-providers/hooks/use-payment-providers.ts
import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { paymentProviderEndpoints, ProviderQueryKeys } from '../utils/constants';
import { PaymentProvider } from '../types';

export const useProviders = () => {
  return useQuery({
    queryKey: ProviderQueryKeys.all(),
    queryFn: () => http.get<PaymentProvider[]>(paymentProviderEndpoints.list),
    select: (data) => data.data,
  });
};

export const useProviderDetail = (id: string) => {
  return useQuery({
    queryKey: ProviderQueryKeys.detail(id),
    queryFn: () => http.get<PaymentProvider>(paymentProviderEndpoints.detail(id)),
    select: (data) => data.data,
    enabled: !!id,
  });
};
```

- [ ] **Step 2: Write mutation hooks**

```typescript
// src/features/payment-providers/hooks/use-payment-provider-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { paymentProviderEndpoints, ProviderQueryKeys } from '../utils/constants';
import { PaymentProviderPayload, PaymentProvider } from '../types';

export const useAddProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentProviderPayload) => 
      http.post<PaymentProvider>(paymentProviderEndpoints.add, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ProviderQueryKeys.all() });
    },
  });
};

export const useDeleteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      http.delete(paymentProviderEndpoints.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ProviderQueryKeys.all() });
    },
  });
};

export const useActivateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      http.post<PaymentProvider>(paymentProviderEndpoints.activate(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ProviderQueryKeys.all() });
    },
  });
};
```

- [ ] **Step 3: Commit**

```bash
git add src/features/payment-providers/hooks/use-payment-providers.ts src/features/payment-providers/hooks/use-payment-provider-mutations.ts
git commit -m "feat: add payment provider react query hooks"
```

---

### Task 3: ProviderCard Component

**Files:**
- Create: `src/features/payment-providers/components/ProviderCard.tsx`

- [ ] **Step 1: Write component**

```tsx
// src/features/payment-providers/components/ProviderCard.tsx
import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { PaymentProvider } from '../types';
import { Trash } from 'lucide-react-native';

interface ProviderCardProps {
  provider: PaymentProvider;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
  isActivating?: boolean;
  isDeleting?: boolean;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ 
  provider, 
  onActivate, 
  onDelete, 
  onPress,
  isActivating,
  isDeleting
}) => {
  return (
    <TouchableOpacity 
      onPress={() => onPress(provider.id)}
      className="p-4 bg-white rounded-lg mb-3 flex-row justify-between items-center shadow-sm"
    >
      <View>
        <Text className="font-semibold text-lg">{provider.provider}</Text>
        <Text className="text-gray-500 text-sm">Key ID: {provider.keyId}</Text>
        <Text className="text-gray-400 text-xs">
          Status: {provider.isActive ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <View className="flex-row items-center space-x-3 gap-2">
        <Switch 
          value={provider.isActive}
          onValueChange={() => onActivate(provider.id)}
          disabled={isActivating || provider.isActive}
        />
        <TouchableOpacity onPress={() => onDelete(provider.id)} disabled={isDeleting}>
          <Trash color="red" size={20} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/payment-providers/components/ProviderCard.tsx
git commit -m "feat: add ProviderCard component"
```

---

### Task 4: Add Provider Screen

**Files:**
- Create: `src/features/payment-providers/screens/ProviderAddScreen.tsx`
- Create: `src/app/(protected)/payments/providers/add.tsx`

- [ ] **Step 1: Write feature screen**

```tsx
// src/features/payment-providers/screens/ProviderAddScreen.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { addProviderSchema, AddProviderFormValues } from '../validators';
import { useAddProvider } from '../hooks/use-payment-provider-mutations';

export const ProviderAddScreen = () => {
  const router = useRouter();
  const { mutateAsync: addProvider, isPending } = useAddProvider();
  
  const { control, handleSubmit, formState: { errors } } = useForm<AddProviderFormValues>({
    resolver: zodResolver(addProviderSchema),
    defaultValues: {
      provider: 'RAZORPAY',
      keyId: '',
      keySecret: '',
      webhookSecret: '',
    }
  });

  const onSubmit = async (data: AddProviderFormValues) => {
    try {
      await addProvider(data);
      toast.success('Provider added successfully');
      router.back();
    } catch (error) {
      toast.error('Failed to add provider');
    }
  };

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text className="text-xl font-bold mb-4">Add Payment Provider</Text>
      
      <Text className="mb-1 font-medium">Provider Type</Text>
      <Controller
        control={control}
        name="provider"
        render={({ field: { onChange, value } }) => (
          <TextInput 
            className="border border-gray-300 rounded p-3 mb-1 bg-white"
            placeholder="RAZORPAY, STRIPE, PAYU, or CASHFREE"
            value={value}
            onChangeText={onChange}
            autoCapitalize="characters"
          />
        )}
      />
      {errors.provider && <Text className="text-red-500 mb-3">{errors.provider.message}</Text>}

      <Text className="mb-1 mt-2 font-medium">Key ID</Text>
      <Controller
        control={control}
        name="keyId"
        render={({ field: { onChange, value } }) => (
          <TextInput 
            className="border border-gray-300 rounded p-3 mb-1 bg-white"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.keyId && <Text className="text-red-500 mb-3">{errors.keyId.message}</Text>}

      <Text className="mb-1 mt-2 font-medium">Key Secret</Text>
      <Controller
        control={control}
        name="keySecret"
        render={({ field: { onChange, value } }) => (
          <TextInput 
            className="border border-gray-300 rounded p-3 mb-1 bg-white"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.keySecret && <Text className="text-red-500 mb-3">{errors.keySecret.message}</Text>}

      <Text className="mb-1 mt-2 font-medium">Webhook Secret (Optional)</Text>
      <Controller
        control={control}
        name="webhookSecret"
        render={({ field: { onChange, value } }) => (
          <TextInput 
            className="border border-gray-300 rounded p-3 mb-1 bg-white"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.webhookSecret && <Text className="text-red-500 mb-3">{errors.webhookSecret.message}</Text>}

      <TouchableOpacity 
        className="bg-blue-600 p-4 rounded-lg items-center mt-6"
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        {isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Provider</Text>}
      </TouchableOpacity>
    </View>
  );
};
```

- [ ] **Step 2: Write app router page**

```tsx
// src/app/(protected)/payments/providers/add.tsx
import { ProviderAddScreen } from '@src/features/payment-providers/screens/ProviderAddScreen';

export default function AddProviderPage() {
  return <ProviderAddScreen />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/payment-providers/screens/ProviderAddScreen.tsx src/app/(protected)/payments/providers/add.tsx
git commit -m "feat: add provider creation screen"
```

---

### Task 5: Provider Detail Screen

**Files:**
- Create: `src/features/payment-providers/screens/ProviderDetailScreen.tsx`
- Create: `src/app/(protected)/payments/providers/[id].tsx`

- [ ] **Step 1: Write feature screen**

```tsx
// src/features/payment-providers/screens/ProviderDetailScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useProviderDetail } from '../hooks/use-payment-providers';

export const ProviderDetailScreen = ({ id }: { id: string }) => {
  const { data: provider, isLoading, error } = useProviderDetail(id);

  if (isLoading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
  if (error || !provider) return <View className="flex-1 justify-center items-center"><Text>Error loading provider details</Text></View>;

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="bg-white p-6 rounded-lg shadow-sm">
        <Text className="text-2xl font-bold mb-4">{provider.provider}</Text>
        
        <View className="mb-3">
          <Text className="text-gray-500 text-sm">Status</Text>
          <Text className="font-medium">{provider.isActive ? 'Active' : 'Inactive'}</Text>
        </View>

        <View className="mb-3">
          <Text className="text-gray-500 text-sm">Key ID</Text>
          <Text className="font-medium">{provider.keyId}</Text>
        </View>

        <View className="mb-3">
          <Text className="text-gray-500 text-sm">Created At</Text>
          <Text className="font-medium">{new Date(provider.createdAt).toLocaleString()}</Text>
        </View>
        
        <View className="mb-3">
          <Text className="text-gray-500 text-sm">Updated At</Text>
          <Text className="font-medium">{new Date(provider.updatedAt).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};
```

- [ ] **Step 2: Write app router page**

```tsx
// src/app/(protected)/payments/providers/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ProviderDetailScreen } from '@src/features/payment-providers/screens/ProviderDetailScreen';

export default function ProviderDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <ProviderDetailScreen id={id} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/payment-providers/screens/ProviderDetailScreen.tsx src/app/(protected)/payments/providers/[id].tsx
git commit -m "feat: add provider detail screen"
```

---

### Task 6: Providers List Screen

**Files:**
- Create: `src/features/payment-providers/screens/ProvidersListScreen.tsx`
- Edit: `src/app/(protected)/payments/providers/index.tsx`

- [ ] **Step 1: Write feature screen**

```tsx
// src/features/payment-providers/screens/ProvidersListScreen.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { useProviders } from '../hooks/use-payment-providers';
import { useActivateProvider, useDeleteProvider } from '../hooks/use-payment-provider-mutations';
import { ProviderCard } from '../components/ProviderCard';

export const ProvidersListScreen = () => {
  const router = useRouter();
  const { data: providers, isLoading, error } = useProviders();
  const { mutate: activateProvider, isPending: isActivating } = useActivateProvider();
  const { mutate: deleteProvider, isPending: isDeleting } = useDeleteProvider();

  const handleActivate = (id: string) => {
    activateProvider(id, {
      onSuccess: () => toast.success('Provider activated'),
      onError: () => toast.error('Failed to activate provider')
    });
  };

  const handleDelete = (id: string) => {
    deleteProvider(id, {
      onSuccess: () => toast.success('Provider deleted'),
      onError: () => toast.error('Failed to delete provider')
    });
  };

  const handlePress = (id: string) => {
    router.push(`/payments/providers/${id}`);
  };

  if (isLoading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
  if (error) return <View className="flex-1 justify-center items-center"><Text>Error loading providers</Text></View>;

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ProviderCard 
            provider={item}
            onActivate={handleActivate}
            onDelete={handleDelete}
            onPress={handlePress}
            isActivating={isActivating}
            isDeleting={isDeleting}
          />
        )}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-gray-500">No payment providers configured</Text>
          </View>
        }
      />
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          className="bg-blue-600 p-4 rounded-lg items-center"
          onPress={() => router.push('/payments/providers/add')}
        >
          <Text className="text-white font-bold text-lg">Add Provider</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

- [ ] **Step 2: Update app router page**

```tsx
// src/app/(protected)/payments/providers/index.tsx
import { ProvidersListScreen } from '@src/features/payment-providers/screens/ProvidersListScreen';

export default function ProvidersPage() {
  return <ProvidersListScreen />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/payment-providers/screens/ProvidersListScreen.tsx src/app/(protected)/payments/providers/index.tsx
git commit -m "feat: update provider index page to show provider list screen"
```
