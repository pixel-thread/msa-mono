# Consent Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the frontend screens, components, and data hooks for the DPDP Act 2023 compliant Consent Management System.

**Architecture:** We will implement the feature following a domain-driven structure in `src/features/consent`. It includes API service layers using Axios, React Query hooks for state, reusable UI components, and Expo Router screens for both Member and Admin (DPO) views.

**Tech Stack:** React Native, Expo Router, TypeScript, React Query, Axios, Tailwind CSS (NativeWind).

---

### Task 1: Define Types and Enums

**Files:**
- Create: `src/features/consent/types/index.ts`

- [ ] **Step 1: Write the consent types and enums**

```typescript
export enum ConsentPurpose {
  PAYMENTS = 'PAYMENTS',
  COMMUNICATIONS = 'COMMUNICATIONS',
  MEETINGS = 'MEETINGS',
  ANALYTICS = 'ANALYTICS',
  MARKETING = 'MARKETING',
}

export enum ConsentStatus {
  GRANTED = 'GRANTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface ConsentReceipt {
  id: string;
  associationId: string;
  userId: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  ipAddress?: string;
  userAgent?: string;
  channel: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ConsentReport {
  [purpose: string]: {
    granted: number;
    withdrawn: number;
    rate: string;
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/consent/types/index.ts
git commit -m "feat(consent): define core types and enums"
```

### Task 2: Create API Services

**Files:**
- Create: `src/features/consent/services/index.ts`

- [ ] **Step 1: Write the API service functions**

```typescript
import axios from 'axios';
import { ConsentPurpose, ConsentReceipt, ConsentReport } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

export const fetchMyConsents = async (): Promise<ConsentReceipt[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/api/consent/my`);
  return data;
};

export const fetchMyConsentHistory = async (): Promise<ConsentReceipt[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/api/consent/history`);
  return data;
};

export const grantConsent = async (purpose: ConsentPurpose): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/consent/grant`, { purpose });
};

export const revokeConsent = async (purpose: ConsentPurpose): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/consent/revoke`, { purpose });
};

export const fetchAllConsents = async (filters?: any): Promise<ConsentReceipt[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/api/consent/all`, { params: filters });
  return data;
};

export const fetchConsentReport = async (): Promise<ConsentReport> => {
  const { data } = await axios.get(`${API_BASE_URL}/api/consent/report`);
  return data;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/consent/services/index.ts
git commit -m "feat(consent): add API service functions"
```

### Task 3: Create React Query Hooks

**Files:**
- Create: `src/features/consent/hooks/index.ts`

- [ ] **Step 1: Write the custom hooks**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsentPurpose } from '../types';
import {
  fetchMyConsents,
  fetchMyConsentHistory,
  grantConsent,
  revokeConsent,
  fetchAllConsents,
  fetchConsentReport,
} from '../services';

export const useMyConsents = () => {
  return useQuery({
    queryKey: ['myConsents'],
    queryFn: fetchMyConsents,
  });
};

export const useConsentHistory = () => {
  return useQuery({
    queryKey: ['myConsentHistory'],
    queryFn: fetchMyConsentHistory,
  });
};

export const useUpdateConsent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ purpose, grant }: { purpose: ConsentPurpose; grant: boolean }) => {
      return grant ? grantConsent(purpose) : revokeConsent(purpose);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myConsents'] });
      queryClient.invalidateQueries({ queryKey: ['myConsentHistory'] });
    },
  });
};

export const useAllConsents = (filters?: any) => {
  return useQuery({
    queryKey: ['allConsents', filters],
    queryFn: () => fetchAllConsents(filters),
  });
};

export const useConsentReport = () => {
  return useQuery({
    queryKey: ['consentReport'],
    queryFn: fetchConsentReport,
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/consent/hooks/index.ts
git commit -m "feat(consent): create react query hooks"
```

### Task 4: Create Consent Components

**Files:**
- Create: `src/features/consent/components/ConsentToggleCard.tsx`
- Create: `src/features/consent/components/ConsentHistoryItem.tsx`
- Create: `src/features/consent/components/ConsentReportWidget.tsx`
- Modify: `src/features/consent/components/index.ts`

- [ ] **Step 1: Write `ConsentToggleCard.tsx`**

```typescript
import React from 'react';
import { View, Switch, Text, ActivityIndicator } from 'react-native';
import { ConsentPurpose, ConsentStatus } from '../types';

interface ConsentToggleCardProps {
  purpose: ConsentPurpose;
  status?: ConsentStatus;
  isLoading: boolean;
  onToggle: (purpose: ConsentPurpose, grant: boolean) => void;
}

export const ConsentToggleCard = ({ purpose, status, isLoading, onToggle }: ConsentToggleCardProps) => {
  const isGranted = status === ConsentStatus.GRANTED;

  return (
    <View className="flex-row items-center justify-between p-4 mb-2 bg-white rounded-lg shadow-sm border border-slate-200">
      <View className="flex-1 mr-4">
        <Text className="text-base font-semibold text-slate-900">{purpose}</Text>
        <Text className="text-sm text-slate-500 mt-1">
          Allow us to process your data for {purpose.toLowerCase()} purposes.
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color="#4f46e5" />
      ) : (
        <Switch
          value={isGranted}
          onValueChange={(val) => onToggle(purpose, val)}
          trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
          thumbColor={isGranted ? '#4f46e5' : '#f8fafc'}
        />
      )}
    </View>
  );
};
```

- [ ] **Step 2: Write `ConsentHistoryItem.tsx`**

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { ConsentReceipt } from '../types';

export const ConsentHistoryItem = ({ receipt }: { receipt: ConsentReceipt }) => {
  return (
    <View className="p-3 mb-2 bg-slate-50 rounded-lg border border-slate-200">
      <View className="flex-row justify-between mb-1">
        <Text className="font-semibold text-slate-800">{receipt.purpose}</Text>
        <Text className={`font-bold ${receipt.status === 'GRANTED' ? 'text-green-600' : 'text-red-600'}`}>
          {receipt.status}
        </Text>
      </View>
      <Text className="text-xs text-slate-500">
        {new Date(receipt.createdAt).toLocaleString()} via {receipt.channel}
      </Text>
    </View>
  );
};
```

- [ ] **Step 3: Write `ConsentReportWidget.tsx`**

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { ConsentReport } from '../types';

export const ConsentReportWidget = ({ report }: { report: ConsentReport }) => {
  return (
    <View className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 mb-4">
      <Text className="text-lg font-bold text-slate-900 mb-3">Consent Metrics</Text>
      {Object.entries(report).map(([purpose, metrics]) => (
        <View key={purpose} className="flex-row justify-between py-2 border-b border-slate-100 last:border-0">
          <Text className="text-slate-700 font-medium">{purpose}</Text>
          <Text className="text-indigo-600 font-semibold">{metrics.rate}</Text>
        </View>
      ))}
    </View>
  );
};
```

- [ ] **Step 4: Export components from `index.ts`**

```typescript
export * from './ConsentToggleCard';
export * from './ConsentHistoryItem';
export * from './ConsentReportWidget';
```

- [ ] **Step 5: Commit**

```bash
git add src/features/consent/components
git commit -m "feat(consent): add UI components for consent management"
```

### Task 5: Create Member Screens

**Files:**
- Create: `src/app/(protected)/consent/index.tsx`
- Create: `src/app/(protected)/consent/history.tsx`
- Create: `src/app/(protected)/consent/_layout.tsx`

- [ ] **Step 1: Write `_layout.tsx` for consent stack**

```typescript
import { Stack } from 'expo-router';

export default function ConsentLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Manage Consent' }} />
      <Stack.Screen name="history" options={{ title: 'Consent History' }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Write Member Consent Screen (`index.tsx`)**

```typescript
import React from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useMyConsents, useUpdateConsent } from '@src/features/consent/hooks';
import { ConsentToggleCard } from '@src/features/consent/components';
import { ConsentPurpose } from '@src/features/consent/types';

export default function MemberConsentScreen() {
  const { data: consents, isLoading } = useMyConsents();
  const updateConsent = useUpdateConsent();

  const handleToggle = (purpose: ConsentPurpose, grant: boolean) => {
    updateConsent.mutate({ purpose, grant });
  };

  const getStatus = (purpose: ConsentPurpose) => {
    return consents?.find(c => c.purpose === purpose)?.status;
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      <Text className="text-lg font-bold text-slate-800 mb-4">Your Data Preferences</Text>
      
      {Object.values(ConsentPurpose).map((purpose) => (
        <ConsentToggleCard
          key={purpose}
          purpose={purpose}
          status={getStatus(purpose)}
          isLoading={updateConsent.isPending && updateConsent.variables?.purpose === purpose}
          onToggle={handleToggle}
        />
      ))}

      <Link href="/consent/history" className="mt-6 p-4 bg-indigo-50 rounded-lg text-center font-semibold text-indigo-700">
        View Consent Audit History
      </Link>
    </ScrollView>
  );
}
```

- [ ] **Step 3: Write Member History Screen (`history.tsx`)**

```typescript
import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useConsentHistory } from '@src/features/consent/hooks';
import { ConsentHistoryItem } from '@src/features/consent/components';

export default function ConsentHistoryScreen() {
  const { data: history, isLoading } = useConsentHistory();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      {history?.length === 0 ? (
        <Text className="text-slate-500 text-center mt-10">No consent history found.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConsentHistoryItem receipt={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/consent
git commit -m "feat(consent): implement member consent screens"
```

### Task 6: Create Admin Screens

**Files:**
- Modify: `src/app/(protected)/admin/consent/index.tsx`
- Create: `src/app/(protected)/admin/consent/audit.tsx`
- Create: `src/app/(protected)/admin/consent/_layout.tsx`

- [ ] **Step 1: Write `_layout.tsx` for Admin Consent stack**

```typescript
import { Stack } from 'expo-router';

export default function AdminConsentLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Consent Dashboard' }} />
      <Stack.Screen name="audit" options={{ title: 'Consent Audit Trail' }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Write Admin Dashboard Screen (`index.tsx`)**

```typescript
import React from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { Link } from 'expo-router';
import { useConsentReport } from '@src/features/consent/hooks';
import { ConsentReportWidget } from '@src/features/consent/components';

export default function AdminConsentDashboard() {
  const { data: report, isLoading } = useConsentReport();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      <Text className="text-xl font-bold text-slate-800 mb-6">DPO Dashboard</Text>
      
      {report ? (
        <ConsentReportWidget report={report} />
      ) : (
        <Text className="text-slate-500">No report data available.</Text>
      )}

      <Link href="/admin/consent/audit" className="mt-4 p-4 bg-indigo-600 rounded-lg text-center font-bold text-white">
        View Full Audit Trail
      </Link>
    </ScrollView>
  );
}
```

- [ ] **Step 3: Write Admin Audit Screen (`audit.tsx`)**

```typescript
import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useAllConsents } from '@src/features/consent/hooks';
import { ConsentHistoryItem } from '@src/features/consent/components';

export default function AdminConsentAuditScreen() {
  const { data: allConsents, isLoading } = useAllConsents();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-lg font-bold mb-4">Association Audit Trail</Text>
      {allConsents?.length === 0 ? (
        <Text className="text-slate-500 text-center mt-10">No consent records found.</Text>
      ) : (
        <FlatList
          data={allConsents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mb-3">
              <Text className="text-xs text-slate-400 mb-1">User ID: {item.userId}</Text>
              <ConsentHistoryItem receipt={item} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/admin/consent
git commit -m "feat(consent): implement admin consent screens"
```
