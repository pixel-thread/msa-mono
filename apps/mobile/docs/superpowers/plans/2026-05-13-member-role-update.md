# Member Role Update Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow high-role users to add or remove roles for a member using a Manage Roles modal.

**Architecture:** We will create two mutation hooks (`useAddMemberRole`, `useRemoveMemberRole`) that call `PATCH` and `PUT` respectively on `/members/:id/role`. We'll build a `ManageRolesModal` component which displays current roles as removable chips and offers a list of roles to add. This modal will be triggered by a "Manage Roles" button on the `MemberDetailScreen` visible only to users with high roles.

**Tech Stack:** React Native, Expo, React Query, Zustand, Axios.

---

### Task 1: Add API Endpoint

**Files:**
- Modify: `src/features/members/utils/constants/endpoints.ts`

- [ ] **Step 1: Add `manageRole` to `memberEndpoints`**

Modify `src/features/members/utils/constants/endpoints.ts`:

```typescript
export const memberEndpoints = {
  list: '/members',
  detail: (id: string) => `/members/${id}`,
  updateStatus: (id: string) => `/members/${id}/status`,
  manageRole: (id: string) => `/members/${id}/role`,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/members/utils/constants/endpoints.ts
git commit -m "feat(members): add manageRole endpoint constant"
```

---

### Task 2: Create Mutation Hooks

**Files:**
- Create: `src/features/members/hooks/use-add-member-role.ts`
- Create: `src/features/members/hooks/use-remove-member-role.ts`
- Modify: `src/features/members/hooks/index.ts`

- [ ] **Step 1: Create `use-add-member-role.ts`**

Create `src/features/members/hooks/use-add-member-role.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberEndpoints, MemberQueryKeys } from '../utils/constants';
import http from '@src/shared/utils/http';
import type { UserRole } from '@src/shared/types/role';
import type { Member } from '../types';

interface ManageRolePayload {
  id: string;
  role: UserRole;
}

export const useAddMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: ManageRolePayload) => {
      const response = await http.patch<{ data: Member }>(memberEndpoints.manageRole(id), { role });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MemberQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: MemberQueryKeys.all() });
    },
  });
};
```

- [ ] **Step 2: Create `use-remove-member-role.ts`**

Create `src/features/members/hooks/use-remove-member-role.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberEndpoints, MemberQueryKeys } from '../utils/constants';
import http from '@src/shared/utils/http';
import type { UserRole } from '@src/shared/types/role';
import type { Member } from '../types';

interface ManageRolePayload {
  id: string;
  role: UserRole;
}

export const useRemoveMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: ManageRolePayload) => {
      const response = await http.put<{ data: Member }>(memberEndpoints.manageRole(id), { role });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MemberQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: MemberQueryKeys.all() });
    },
  });
};
```

- [ ] **Step 3: Export from index**

Modify `src/features/members/hooks/index.ts` to export the new hooks:

```typescript
// (Keep existing exports)
export * from './use-add-member-role';
export * from './use-remove-member-role';
```

- [ ] **Step 4: Commit**

```bash
git add src/features/members/hooks/
git commit -m "feat(members): create hooks for adding and removing member roles"
```

---

### Task 3: Create ManageRolesModal Component

**Files:**
- Create: `src/features/members/components/manage-roles-modal.component.tsx`
- Modify: `src/features/members/components/index.ts`

- [ ] **Step 1: Create `manage-roles-modal.component.tsx`**

Create `src/features/members/components/manage-roles-modal.component.tsx`:

```tsx
import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Button } from '@src/shared/components/ui';
import { useAddMemberRole, useRemoveMemberRole } from '../hooks';
import type { UserRole } from '@src/shared/types/role';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@src/shared/lib/cn';

interface ManageRolesModalProps {
  memberId: string;
  currentRoles: UserRole[];
  isVisible: boolean;
  onClose: () => void;
}

const ALL_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MEMBER', 'PRESIDENT', 'SECRETARY'];

export const ManageRolesModal = ({ memberId, currentRoles, isVisible, onClose }: ManageRolesModalProps) => {
  const { mutate: addRole, isPending: isAdding } = useAddMemberRole();
  const { mutate: removeRole, isPending: isRemoving } = useRemoveMemberRole();
  const isUpdating = isAdding || isRemoving;

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const availableRoles = ALL_ROLES.filter(r => !currentRoles.includes(r));

  const handleAdd = () => {
    if (!selectedRole) return;
    addRole(
      { id: memberId, role: selectedRole },
      {
        onSuccess: () => {
          setSelectedRole(null);
          Alert.alert('Success', 'Role added successfully.');
        },
        onError: () => Alert.alert('Error', 'Failed to add role.')
      }
    );
  };

  const handleRemove = (role: UserRole) => {
    Alert.alert('Remove Role', `Are you sure you want to remove the ${role} role?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeRole(
            { id: memberId, role },
            {
              onError: () => Alert.alert('Error', 'Failed to remove role.')
            }
          );
        }
      }
    ]);
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-white p-6 dark:bg-slate-900 min-h-[50%]">
          <View className="mb-4 flex-row items-center justify-between">
            <Text variant="heading" size="xl" className="text-slate-900 dark:text-white">Manage Roles</Text>
            <TouchableOpacity onPress={onClose} disabled={isUpdating}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text variant="subtext" className="mb-2">Current Roles</Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {currentRoles.map((role) => (
              <View key={role} className="flex-row items-center gap-x-1 rounded-full bg-indigo-100 px-3 py-1.5 dark:bg-indigo-900/30">
                <Text size="sm" weight="medium" className="text-indigo-700 dark:text-indigo-300">{role}</Text>
                <TouchableOpacity onPress={() => handleRemove(role)} disabled={isUpdating}>
                  <Ionicons name="close-circle" size={16} color="#6366f1" className="opacity-70" />
                </TouchableOpacity>
              </View>
            ))}
            {currentRoles.length === 0 && <Text variant="subtext" size="sm">No roles assigned.</Text>}
          </View>

          <Text variant="subtext" className="mb-2">Add New Role</Text>
          <ScrollView className="mb-4 max-h-40" showsVerticalScrollIndicator={false}>
            {availableRoles.length === 0 ? (
              <Text variant="subtext" size="sm" className="italic">All roles are already assigned.</Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {availableRoles.map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setSelectedRole(role)}
                    disabled={isUpdating}
                    className={cn(
                      'rounded-md border px-3 py-2',
                      selectedRole === role 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-slate-200 bg-transparent dark:border-slate-700'
                    )}
                  >
                    <Text size="sm" className={selectedRole === role ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <Button 
            variant="default" 
            onPress={handleAdd} 
            disabled={!selectedRole || isUpdating}
            loading={isAdding}
            className="mt-auto"
          >
            Add Selected Role
          </Button>
        </View>
      </View>
    </Modal>
  );
};
```

- [ ] **Step 2: Export from components index**

Modify `src/features/members/components/index.ts` to export the new component:

```typescript
// (Keep existing exports)
export * from './manage-roles-modal.component';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/members/components/
git commit -m "feat(members): create ManageRolesModal component"
```

---

### Task 4: Update Member Detail Screen

**Files:**
- Modify: `src/features/members/screens/member-detail.screen.tsx`

- [ ] **Step 1: Import ManageRolesModal and add state**

Modify `src/features/members/screens/member-detail.screen.tsx`. Add the import, state for modal visibility, and render it.

```tsx
import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMember, useUpdateMemberStatus } from '../hooks';
import { LoadingScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';
import { Text, Button } from '@src/shared/components/ui';
import { ErrorBoundary } from '@src/shared/components/common';
import { MemberErrorScreen } from './member-error';
import { MemberInfoCard, ManageRolesModal } from '../components'; // Added ManageRolesModal
import { cn } from '@src/shared/lib/cn';
import { useAuthStore } from '@src/shared/store/auth.store';
import { hasHighRoleAccess } from '@src/features/meetings/utils/permission';

export const MemberDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const memberId = id as string;

  const { data: member, isLoading, isError, refetch, isRefetching } = useMember(memberId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateMemberStatus();
  
  const { user } = useAuthStore();
  const canUpdateStatus = hasHighRoleAccess(user?.role) && member?.status === 'INACTIVE';
  const canManageRoles = hasHighRoleAccess(user?.role); // New permission check

  const [isRolesModalVisible, setIsRolesModalVisible] = useState(false); // New state

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
                  variant="default" 
                  onPress={handleAccept} 
                  disabled={isUpdatingStatus}
                  loading={isUpdatingStatus}
                >
                  Accept Member
                </Button>
                <Button 
                  className="flex-1" 
                  variant="destructive" 
                  onPress={handleReject} 
                  disabled={isUpdatingStatus}
                  loading={isUpdatingStatus}
                >
                  Reject Member
                </Button>
              </View>
            )}

            {/* Manage Roles Button */}
            {canManageRoles && (
              <View className="mt-4">
                <Button
                  variant="outline"
                  onPress={() => setIsRolesModalVisible(true)}
                >
                  Manage Roles
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
        
        {/* Roles Modal */}
        <ManageRolesModal 
          memberId={memberId}
          currentRoles={member.role}
          isVisible={isRolesModalVisible}
          onClose={() => setIsRolesModalVisible(false)}
        />
      </Container>
    </ErrorBoundary>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/members/screens/member-detail.screen.tsx
git commit -m "feat(members): integrate ManageRolesModal into MemberDetailScreen"
```
