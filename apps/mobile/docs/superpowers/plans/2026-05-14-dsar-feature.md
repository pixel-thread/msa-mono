# DSAR Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete Data Subject Access Request (DSAR) system for both members (requesting data) and admins (processing requests with SLA tracking).

**Architecture:** Modular feature pattern in `src/features/dsar` using TanStack Query for state, Axios for API calls, and Zod for validation.

**Tech Stack:** React Native (Expo), TanStack Query, React Hook Form, Zod, Tailwind CSS (NativeWind).

---

### Task 1: Types & Constants

**Files:**
- Create: `src/features/dsar/types/dsar.types.ts`
- Create: `src/features/dsar/constants/index.ts`

- [ ] **Step 1: Define DSAR Types**

```typescript
// src/features/dsar/types/dsar.types.ts
export type DSARStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type DSARRequestType = 'ACCESS' | 'CORRECTION' | 'DELETION' | 'PORTABILITY';
export type DSARDataCategory = 'PROFILE_DATA' | 'PAYMENT_HISTORY' | 'COMMUNICATION_LOGS' | 'ACTIVITY_DATA';

export interface DSARRequest {
  id: string;
  ticketNumber: string;
  userId: string;
  requestType: DSARRequestType;
  requestedData: DSARDataCategory[];
  description?: string;
  status: DSARStatus;
  responseDeadline: string;
  createdAt: string;
  notes?: string;
  responseType?: string;
  storageKey?: string;
  rejectedReason?: string;
  assignedToId?: string;
}

export interface DSARSubmitPayload {
  requestType: DSARRequestType;
  requestedData: DSARDataCategory[];
  description?: string;
}

export interface DSARResponsePayload {
  status: Exclude<DSARStatus, 'PENDING'>;
  notes?: string;
  responseType?: string;
  storageKey?: string;
  rejectedReason?: string;
}

export interface SLAReport {
  breached: number;
  atRisk: number;
  onTrack: number;
}
```

- [ ] **Step 2: Define Constants**

```typescript
// src/features/dsar/constants/index.ts
import { DSARDataCategory, DSARRequestType } from '../types/dsar.types';

export const DATA_CATEGORIES: { label: string; value: DSARDataCategory }[] = [
  { label: 'Profile Data', value: 'PROFILE_DATA' },
  { label: 'Payment History', value: 'PAYMENT_HISTORY' },
  { label: 'Communication Logs', value: 'COMMUNICATION_LOGS' },
  { label: 'Activity Data', value: 'ACTIVITY_DATA' },
];

export const REQUEST_TYPES: { label: string; value: DSARRequestType }[] = [
  { label: 'Access', value: 'ACCESS' },
  { label: 'Correction', value: 'CORRECTION' },
  { label: 'Deletion', value: 'DELETION' },
  { label: 'Portability', value: 'PORTABILITY' },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/features/dsar/types/dsar.types.ts src/features/dsar/constants/index.ts
git commit -m "feat(dsar): add types and constants"
```

---

### Task 2: Validators

**Files:**
- Create: `src/features/dsar/validators/dsar.validator.ts`

- [ ] **Step 1: Create Submission Schema**

```typescript
// src/features/dsar/validators/dsar.validator.ts
import { z } from 'zod';

export const dsarSubmitSchema = z.object({
  requestType: z.enum(['ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY']),
  requestedData: z.array(z.string()).min(1, 'At least one data category is required'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export type DSARSubmitFormData = z.infer<typeof dsarSubmitSchema>;

export const dsarResponseSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'REJECTED']),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  responseType: z.string().optional(),
  storageKey: z.string().optional(),
  rejectedReason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
}).refine((data) => {
  if (data.status === 'REJECTED' && !data.rejectedReason) {
    return false;
  }
  return true;
}, {
  message: "Rejected reason is required when status is REJECTED",
  path: ["rejectedReason"],
});

export type DSARResponseFormData = z.infer<typeof dsarResponseSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dsar/validators/dsar.validator.ts
git commit -m "feat(dsar): add zod validators"
```

---

### Task 3: API Service

**Files:**
- Create: `src/features/dsar/services/dsar.service.ts`

- [ ] **Step 1: Implement DSAR Service**

```typescript
// src/features/dsar/services/dsar.service.ts
import apiClient from '@src/shared/lib/api-client';
import { 
  DSARRequest, 
  DSARSubmitPayload, 
  DSARResponsePayload, 
  SLAReport 
} from '../types/dsar.types';

export const dsarService = {
  submitRequest: async (payload: DSARSubmitPayload): Promise<DSARRequest> => {
    const response = await apiClient.post<{ data: DSARRequest }>('/dsar/submit', payload);
    return response.data.data;
  },

  getMyRequests: async (): Promise<DSARRequest[]> => {
    const response = await apiClient.get<{ data: DSARRequest[] }>('/dsar/my');
    return response.data.data;
  },

  getAllRequests: async (params?: Record<string, any>): Promise<DSARRequest[]> => {
    const response = await apiClient.get<{ data: DSARRequest[] }>('/dsar', { params });
    return response.data.data;
  },

  respondToRequest: async (ticketId: string, payload: DSARResponsePayload): Promise<DSARRequest> => {
    const response = await apiClient.post<{ data: DSARRequest }>(`/dsar/${ticketId}/respond`, payload);
    return response.data.data;
  },

  assignTicket: async (ticketId: string, assignedToId: string): Promise<DSARRequest> => {
    const response = await apiClient.patch<{ data: DSARRequest }>(`/dsar/${ticketId}/assign`, { assignedToId });
    return response.data.data;
  },

  getSlaReport: async (): Promise<SLAReport> => {
    const response = await apiClient.get<{ data: SLAReport }>('/dsar/sla-report');
    return response.data.data;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dsar/services/dsar.service.ts
git commit -m "feat(dsar): implement api service layer"
```

---

### Task 4: SLA Utilities

**Files:**
- Create: `src/features/dsar/utils/sla.utils.ts`

- [ ] **Step 1: Implement SLA calculation**

```typescript
// src/features/dsar/utils/sla.utils.ts
export type SLAStatus = 'BREACHED' | 'AT_RISK' | 'ON_TRACK';

export const getSLAStatus = (createdAt: string | Date): SLAStatus => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 21) return 'BREACHED';
  if (diffDays >= 15) return 'AT_RISK';
  return 'ON_TRACK';
};

export const getSLAColor = (status: SLAStatus): string => {
  switch (status) {
    case 'BREACHED': return '#ef4444'; // Red-500
    case 'AT_RISK': return '#f97316';  // Orange-500
    case 'ON_TRACK': return '#22c55e'; // Green-500
    default: return '#6b7280';       // Gray-500
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dsar/utils/sla.utils.ts
git commit -m "feat(dsar): add sla calculation utilities"
```

---

### Task 5: React Query Hooks

**Files:**
- Create: `src/features/dsar/hooks/use-dsar.ts`
- Create: `src/features/dsar/hooks/use-dsar-mutations.ts`

- [ ] **Step 1: Implement data fetching hooks**

```typescript
// src/features/dsar/hooks/use-dsar.ts
import { useQuery } from '@tanstack/react-query';
import { dsarService } from '../services/dsar.service';

export const useMyDSARRequests = () => {
  return useQuery({
    queryKey: ['dsar', 'my'],
    queryFn: dsarService.getMyRequests,
  });
};

export const useAllDSARRequests = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['dsar', 'all', params],
    queryFn: () => dsarService.getAllRequests(params),
  });
};

export const useSlaReport = () => {
  return useQuery({
    queryKey: ['dsar', 'sla-report'],
    queryFn: dsarService.getSlaReport,
  });
};
```

- [ ] **Step 2: Implement mutation hooks**

```typescript
// src/features/dsar/hooks/use-dsar-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dsarService } from '../services/dsar.service';
import { toast } from 'sonner-native';

export const useSubmitDSAR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dsarService.submitRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsar', 'my'] });
      toast.success('Request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit request');
    },
  });
};

export const useRespondToDSAR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: any }) => 
      dsarService.respondToRequest(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsar'] });
      toast.success('Response sent successfully');
    },
  });
};
```

- [ ] **Step 3: Commit**

```bash
git add src/features/dsar/hooks/use-dsar.ts src/features/dsar/hooks/use-dsar-mutations.ts
git commit -m "feat(dsar): add react-query hooks"
```

---

### Task 6: UI Components (Part 1)

**Files:**
- Create: `src/features/dsar/components/DSARStatusBadge.tsx`
- Create: `src/features/dsar/components/SLAIndicator.tsx`

- [ ] **Step 1: Create Status Badge**

```tsx
// src/features/dsar/components/DSARStatusBadge.tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui/text';
import { DSARStatus } from '../types/dsar.types';
import { cn } from '@src/shared/lib/cn';

interface Props {
  status: DSARStatus;
  className?: string;
}

export const DSARStatusBadge = ({ status, className }: Props) => {
  const getStyles = () => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <View className={cn('px-2 py-0.5 rounded-full border', getStyles(), className)}>
      <Text className="text-xs font-medium uppercase">{status.replace('_', ' ')}</Text>
    </View>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dsar/components/DSARStatusBadge.tsx
git commit -m "feat(dsar): add status badge component"
```

---

### Task 7: Member Submission Screen

**Files:**
- Create: `src/features/dsar/screens/MemberSubmitDSARScreen.tsx`
- Create: `src/app/(protected)/profile/privacy/submit.tsx`

- [ ] **Step 1: Implement Submission Screen UI & Logic**
(Use `react-hook-form` and `DATA_CATEGORIES` checkboxes)

- [ ] **Step 2: Commit**

```bash
git add src/features/dsar/screens/MemberSubmitDSARScreen.tsx src/app/(protected)/profile/privacy/submit.tsx
git commit -m "feat(dsar): implement member request submission"
```

---

### Task 8: Member Request List

**Files:**
- Create: `src/features/dsar/screens/MemberDSARListScreen.tsx`
- Create: `src/app/(protected)/profile/privacy/requests.tsx`

- [ ] **Step 1: Implement List Screen**
(Use `useMyDSARRequests` and `DSARListItem` component)

- [ ] **Step 2: Commit**

```bash
git add src/features/dsar/screens/MemberDSARListScreen.tsx src/app/(protected)/profile/privacy/requests.tsx
git commit -m "feat(dsar): implement member request list view"
```

---

### Task 9: Admin Dashboard & SLA Report

**Files:**
- Create: `src/features/dsar/screens/AdminDSARDashboardScreen.tsx`
- Create: `src/app/(protected)/admin/dsar/index.tsx`

- [ ] **Step 1: Implement Admin Dashboard**
(Show SLA report metrics at top, followed by list of all requests sorted by deadline)

- [ ] **Step 2: Commit**

```bash
git add src/features/dsar/screens/AdminDSARDashboardScreen.tsx src/app/(protected)/admin/dsar/index.tsx
git commit -m "feat(dsar): implement admin dashboard with sla report"
```

---

### Task 10: Admin Response Flow

**Files:**
- Create: `src/features/dsar/screens/AdminDSARDetailScreen.tsx`
- Create: `src/app/(protected)/admin/dsar/[id].tsx`

- [ ] **Step 1: Implement Detail & Response Screen**
(Allow DPO to change status, add notes, and link storage key)

- [ ] **Step 2: Commit**

```bash
git add src/features/dsar/screens/AdminDSARDetailScreen.tsx src/app/(protected)/admin/dsar/[id].tsx
git commit -m "feat(dsar): implement admin response and detail view"
```

---

### Task 11: Final Integration & Navigation

**Files:**
- Modify: `src/app/(protected)/profile/index.tsx`
- Modify: `src/app/(protected)/(drawer)/_layout.tsx`

- [ ] **Step 1: Link Privacy in Profile**

- [ ] **Step 2: Add DSAR to Admin Drawer**

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(dsar): final navigation integration"
```
