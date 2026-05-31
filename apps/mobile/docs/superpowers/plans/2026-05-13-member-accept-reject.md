# Member Accept/Reject Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow high-role users to accept (`ACTIVE`) or reject (`SUSPENDED`) inactive members directly from the Member Details screen.

**Architecture:** We will add a new `useUpdateMemberStatus` mutation hook that calls a `PATCH /members/:id/status` endpoint. The `MemberDetailScreen` will conditionally render Accept/Reject buttons based on the user's role and the member's status, showing an alert confirmation before execution, and invalidating React Query cache upon success.

**Tech Stack:** React Native, Expo, React Query, Zustand, Axios.

---

### Task 1: Add API Endpoint

**Files:**
- Modify: `src/features/members/utils/constants/endpoints.ts`

- [ ] **Step 1: Add `updateStatus` to `memberEndpoints`**

Modify `src/features/members/utils/constants/endpoints.ts`:

```typescript
export const memberEndpoints = {
  list: '/members',
  detail: (id: string) => `/members/${id}`,
  updateStatus: (id: string) => `/members/${id}/status`,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/members/utils/constants/endpoints.ts
git commit -m "feat(members): add updateStatus endpoint constant"
```

---

### Task 2: Create Mutation Hook

**Files:**
- Create: `src/features/members/hooks/use-update-member-status.ts`
- Modify: `src/features/members/hooks/index.ts`

- [ ] **Step 1: Create `use-update-member-status.ts`**

Create `src/features/members/hooks/use-update-member-status.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberEndpoints, MemberQueryKeys } from '../utils/constants';
import http from '@src/shared/utils/http';
import type { UserStatus } from '@src/shared/types/role';
import type { Member } from '../types';

interface UpdateStatusPayload {
  id: string;
  status: UserStatus;
}

export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateStatusPayload) => {
      const response = await http.patch<{ data: Member }>(memberEndpoints.updateStatus(id), { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the detail view and the lists
      queryClient.invalidateQueries({ queryKey: MemberQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: MemberQueryKeys.all() });
    },
  });
};
```

- [ ] **Step 2: Export from index**

Modify `src/features/members/hooks/index.ts` to export the new hook:

```typescript
// (Keep existing exports)
export * from './use-update-member-status';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/members/hooks/use-update-member-status.ts src/features/members/hooks/index.ts
git commit -m "feat(members): create useUpdateMemberStatus mutation hook"
```

---

### Task 3: Update Member Detail Screen

**Files:**
- Modify: `src/features/members/screens/member-detail.screen.tsx`

- [ ] **Step 1: Update imports and add UI logic**

Modify `src/features/members/screens/member-detail.screen.tsx`:

```tsx
import React from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMember, useUpdateMemberStatus } from '../hooks';
import { LoadingScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';
import { Text, Button } from '@src/shared/components/ui';
import { ErrorBoundary } from '@src/shared/components/common';
import { MemberErrorScreen } from './member-error';
import { MemberInfoCard } from '../components';
import { cn } from '@src/shared/lib/cn';
import { useAuthStore } from '@src/shared/store/auth.store';
import { hasHighRoleAccess } from '@src/features/meetings/utils/permission';

export const MemberDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const memberId = id as string;

  const { data: member, isLoading, isError, refetch, isRefetching } = useMember(memberId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMemberStatus();
  
  const { user } = useAuthStore();
  const canUpdateStatus = hasHighRoleAccess(user?.role) && member?.status === 'INACTIVE';

  const handleAccept = () => {
    Alert.alert('Approve Member', 'Are you sure you want to approve this member?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Accept', 
        style: 'default',
        onPress: () => updateStatus(
          { id: memberId, status: 'ACTIVE' },
          { onError: () => Alert.alert('Error', 'Failed to update member status.') }
        )
      }
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Member', 'Are you sure you want to reject and suspend this member?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Reject', 
        style: 'destructive',
        onPress: () => updateStatus(
          { id: memberId, status: 'SUSPENDED' },
          { onError: () => Alert.alert('Error', 'Failed to update member status.') }
        )
      }
    ]);
  };

  if (isLoading) return <LoadingScreen message="Loading member details..." />;

  if (isError || !member) return <MemberErrorScreen refetch={refetch} />;

  return (
    <ErrorBoundary componentName="MemberDetailScreen">
      <Container>
        <StackHeader showBackButton title="Member Details" />
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
          }>
          {/* Hero Section */}
          <View className="px-4 pb-8 pt-6">
            <View className="mb-3 flex-row items-center gap-x-2">
              <View className="rounded-md bg-indigo-600 px-2 py-0.5">
                <Text weight="bold" size="xs" className="uppercase tracking-widest text-white">
                  {member.role.join(', ')}
                </Text>
              </View>
              <View
                className={cn(
                  'rounded-full px-2 py-0.5',
                  member.status === 'ACTIVE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/20'
                    : 'bg-slate-50 dark:bg-slate-950/20'
                )}>
                <Text
                  size="xs"
                  weight="medium"
                  className={cn(
                    'text-[10px]',
                    member.status === 'ACTIVE'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-400'
                  )}>
                  {member.status}
                </Text>
              </View>
            </View>

            <Text variant="heading" size="3xl" className="text-slate-900 dark:text-white">
              {member.name}
            </Text>

            <Text variant="subtext" size="sm" className="mt-3 leading-relaxed">
              {member.email}
            </Text>
            
            {/* Accept/Reject Buttons */}
            {canUpdateStatus && (
              <View className="mt-6 flex-row gap-x-4">
                <Button 
                  className="flex-1" 
                  variant="primary" 
                  onPress={handleAccept} 
                  disabled={isUpdating}
                  isLoading={isUpdating}
                >
                  Accept Member
                </Button>
                <Button 
                  className="flex-1" 
                  variant="destructive" 
                  onPress={handleReject} 
                  disabled={isUpdating}
                  isLoading={isUpdating}
                >
                  Reject Member
                </Button>
              </View>
            )}
          </View>

          {/* Quick Info Grid */}
          <View className="flex-1 flex-row flex-wrap gap-4 px-4">
            <MemberInfoCard
              icon="mail-outline"
              label="Email"
              value={member.email}
              className="min-w-[45%] flex-1"
            />
            {member.membershipNumber && (
              <MemberInfoCard
                icon="card-outline"
                label="Member ID"
                value={member.membershipNumber}
                className="min-w-[45%] flex-1"
              />
            )}
            <MemberInfoCard
              icon="calendar-outline"
              label="Joined"
              value={new Date(member.createdAt).toLocaleDateString()}
              className="min-w-[45%] flex-1"
            />
          </View>
        </ScrollView>
      </Container>
    </ErrorBoundary>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/members/screens/member-detail.screen.tsx
git commit -m "feat(members): add accept/reject functionality for high-role users"
```
