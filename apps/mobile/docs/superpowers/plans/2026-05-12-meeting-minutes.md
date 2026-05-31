# Meeting Minutes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dedicated Meeting Minutes screen with full CRUD (Create, Read, Update, Delete) capabilities, restricted to high-role users (Super Admin, President, Secretary) for management actions, while allowing all members to view.

**Architecture:** Use Expo Router for navigation, TanStack Query for data fetching/mutations, and React Hook Form with Zod for form management. Permissions will be handled via a central utility function.

**Tech Stack:** React Native (Expo), TypeScript, TanStack Query, React Hook Form, Zod, Lucide Icons, NativeWind (Tailwind CSS).

---

### Task 1: Update User Roles

**Files:**
- Modify: `src/shared/types/role.ts`
- Modify: `src/features/auth/types/auth.types.ts`

- [ ] **Step 1: Update global UserRole type**
Update `src/shared/types/role.ts`:
```typescript
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | 'PRESIDENT' | 'SECRETARY';
```

- [ ] **Step 2: Update auth feature UserRole type**
Update `src/features/auth/types/auth.types.ts`:
```typescript
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | 'PRESIDENT' | 'SECRETARY';
```

- [ ] **Step 3: Commit**
```bash
git add src/shared/types/role.ts src/features/auth/types/auth.types.ts
git commit -m "feat: add PRESIDENT and SECRETARY roles"
```

---

### Task 2: Create Permission Utility

**Files:**
- Create: `src/features/meetings/utils/permission.ts`
- Modify: `src/features/meetings/index.ts`

- [ ] **Step 1: Create hasHighRoleAccess utility**
Create `src/features/meetings/utils/permission.ts`:
```typescript
import { UserRole } from "@src/features/auth";

export const HIGH_ROLE_USERS: UserRole[] = ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY'];

export const hasHighRoleAccess = (role?: UserRole): boolean => {
  if (!role) return false;
  return HIGH_ROLE_USERS.includes(role);
};
```

- [ ] **Step 2: Export utility**
Update `src/features/meetings/index.ts`:
```typescript
export * from './utils/permission';
```

- [ ] **Step 3: Commit**
```bash
git add src/features/meetings/utils/permission.ts src/features/meetings/index.ts
git commit -m "feat: add meeting permission utility"
```

---

### Task 3: Restructure Meeting Routes

**Files:**
- Modify: `src/app/(protected)/meetings/[id].tsx` (Rename/Move)
- Create: `src/app/(protected)/meetings/[id]/index.tsx`
- Create: `src/app/(protected)/meetings/[id]/minutes.tsx`

- [ ] **Step 1: Move [id].tsx to [id]/index.tsx**
```bash
mkdir -p src/app/\(protected\)/meetings/\[id\]
mv src/app/\(protected\)/meetings/\[id\].tsx src/app/\(protected\)/meetings/\[id\]/index.tsx
```

- [ ] **Step 2: Create shell for minutes screen**
Create `src/app/(protected)/meetings/[id]/minutes.tsx`:
```tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import { Container, StackHeader } from '@src/shared/components';

export default function MeetingMinutesPage() {
  return (
    <Container>
      <StackHeader title="Meeting Minutes" showBackButton />
      <View className="flex-1 items-center justify-center p-4">
        <Text>Meeting Minutes Screen (Coming Soon)</Text>
      </View>
    </Container>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/\(protected\)/meetings/\[id\]/index.tsx src/app/\(protected\)/meetings/\[id\]/minutes.tsx
git commit -m "refactor: restructure meeting routes for minutes"
```

---

### Task 4: Add Minutes Button to Detail Screen

**Files:**
- Modify: `src/features/meetings/screens/meeting-detail.screen.tsx`

- [ ] **Step 1: Add navigation button to header**
Update `src/features/meetings/screens/meeting-detail.screen.tsx` to include a button in the `StackHeader` right action or near the top of the content. Let's add it to the `StackHeader` right action next to the share button.

```tsx
// Around line 69
<StackHeader
  showBackButton
  title="Meeting Details"
  rightAction={
    <View className="flex-row items-center">
      <TouchableOpacity 
        onPress={() => router.push(`/meetings/${id}/minutes`)} 
        className="mr-4"
      >
        <Ionicons name="document-text-outline" size={22} color="#4f46e5" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleShare} className="mr-2">
        <Ionicons name="share-outline" size={22} color="#4f46e5" />
      </TouchableOpacity>
    </View>
  }
/>
```

- [ ] **Step 2: Commit**
```bash
git add src/features/meetings/screens/meeting-detail.screen.tsx
git commit -m "feat: add link to meeting minutes on detail screen"
```

---

### Task 5: Implement Delete Minute Hook

**Files:**
- Create: `src/features/meetings/hooks/use-delete-meeting-minute.ts`
- Modify: `src/features/meetings/hooks/index.ts`

- [ ] **Step 1: Create delete hook**
Create `src/features/meetings/hooks/use-delete-meeting-minute.ts`:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';

type Props = {
  meetingId: string;
};

export function useDeleteMeetingMinute({ meetingId }: Props) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingMinuteId: string) =>
      http.delete(`/meeting/${meetingId}/minuite/${meetingMinuteId}`),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Minute deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['meeting', 'minuites', meetingId] });
        return data;
      }
      toast.error(data.message || 'Failed to delete minute');
      return data;
    },
  });
}
```

- [ ] **Step 2: Export hook**
Update `src/features/meetings/hooks/index.ts`:
```typescript
export { useDeleteMeetingMinute } from './use-delete-meeting-minute';
export { useUpdateMeetingMinuite } from './use-update-meeting-minuites';
```

- [ ] **Step 3: Commit**
```bash
git add src/features/meetings/hooks/use-delete-meeting-minute.ts src/features/meetings/hooks/index.ts
git commit -m "feat: add useDeleteMeetingMinute hook"
```

---

### Task 6: Implement Meeting Minutes Screen

**Files:**
- Create: `src/features/meetings/screens/meeting-minutes.screen.tsx`
- Modify: `src/features/meetings/screens/index.ts`
- Modify: `src/app/(protected)/meetings/[id]/minutes.tsx`

- [ ] **Step 1: Create the Minutes screen component**
Create `src/features/meetings/screens/meeting-minutes.screen.tsx`. It should include:
- `useMeetingMinuite` to fetch data.
- `useCreateMeetingMinuite`, `useUpdateMeetingMinuite`, `useDeleteMeetingMinute` for actions.
- `hasHighRoleAccess` check using `useAuthStore`'s `user.role`.
- A list of `MinuteCard` components.
- A `MinuteFormModal` for Create/Edit.

```tsx
import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Container, StackHeader } from '@src/shared/components';
import { Card, CardContent, Text, Button, Input } from '@src/shared/components/ui';
import { useMeetingMinuite, useCreateMeetingMinuite, useUpdateMeetingMinuite, useDeleteMeetingMinute } from '../hooks';
import { useAuthStore } from '@src/features/auth';
import { hasHighRoleAccess } from '../utils/permission';
import { LoadingScreen } from '@src/shared/components/screens';

export const MeetingMinutesScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const isAdmin = hasHighRoleAccess(user?.role);
  
  const { data: minutes = [], isLoading, refetch, isRefetching } = useMeetingMinuite({ meetingId: id as string });
  const { mutate: deleteMinute } = useDeleteMeetingMinute({ meetingId: id as string });
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMinute, setEditingMinute] = useState<any>(null);

  if (isLoading) return <LoadingScreen message="Loading minutes..." />;

  return (
    <Container>
      <StackHeader 
        title="Meeting Minutes" 
        showBackButton 
        rightAction={isAdmin && (
          <TouchableOpacity onPress={() => { setEditingMinute(null); setModalVisible(true); }}>
            <Ionicons name="add-circle-outline" size={24} color="#4f46e5" />
          </TouchableOpacity>
        )}
      />
      <ScrollView 
        className="flex-1 px-4 py-6"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {minutes.map((minute: any) => (
          <Card key={minute.id} className="mb-4">
            <CardContent className="p-4">
              <View className="flex-row justify-between">
                <Text weight="bold" size="lg">{minute.agendaPoint}</Text>
                {isAdmin && (
                  <View className="flex-row gap-x-2">
                    <TouchableOpacity onPress={() => { setEditingMinute(minute); setModalVisible(true); }}>
                      <Ionicons name="create-outline" size={20} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteMinute(minute.id)}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Text className="mt-2 text-slate-600">{minute.decision}</Text>
              {/* Action items rendering logic here */}
            </CardContent>
          </Card>
        ))}
      </ScrollView>
      {/* Modal implementation here using MinuteForm */}
    </Container>
  );
};
```

- [ ] **Step 2: Export the screen**
Update `src/features/meetings/screens/index.ts`:
```typescript
export * from './meeting-minutes.screen';
```

- [ ] **Step 3: Use the screen in the app route**
Update `src/app/(protected)/meetings/[id]/minutes.tsx`:
```tsx
import React from 'react';
import { MeetingMinutesScreen } from '@src/features/meetings';

export default function MeetingMinutesPage() {
  return <MeetingMinutesScreen />;
}
```

- [ ] **Step 4: Commit**
```bash
git add src/features/meetings/screens/meeting-minutes.screen.tsx src/features/meetings/screens/index.ts src/app/\(protected\)/meetings/\[id\]/minutes.tsx
git commit -m "feat: implement meeting minutes management screen"
```

