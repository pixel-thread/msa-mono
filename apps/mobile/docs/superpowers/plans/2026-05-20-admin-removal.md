# Admin Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all admin-related pages, features, and navigation from the mobile app, transitioning administrative management to the web platform.

**Architecture:** Systematic deletion of admin routes and features, followed by refactoring shared UI components (Drawer, Dashboard, Meetings) to remove admin-only logic and buttons.

**Tech Stack:** React Native, Expo Router, TypeScript, Tailwind CSS (NativeWind).

---

### Task 1: Remove Admin Routes and Strictly Admin Features

**Files:**
- Delete: `src/app/(protected)/admin/`
- Delete: `src/features/members/`
- Delete: `src/features/payment/`
- Delete: `src/shared/components/auth/admin-auth-guard.tsx`

- [ ] **Step 1: Delete admin routes directory**

Run: `rm -rf src/app/(protected)/admin`

- [ ] **Step 2: Delete strictly admin features**

Run: `rm -rf src/features/members src/features/payment`

- [ ] **Step 3: Delete admin auth guard**

Run: `rm src/shared/components/auth/admin-auth-guard.tsx`

- [ ] **Step 4: Commit deletions**

```bash
git add src/app/(protected)/admin src/features/members src/features/payment src/shared/components/auth/admin-auth-guard.tsx
git commit -m "feat: remove admin routes, members feature, and admin auth guard"
```

### Task 2: Remove Admin Screens from Shared Features

**Files:**
- Delete: `src/features/dsar/screens/AdminDSARDashboardScreen.tsx`
- Delete: `src/features/dsar/screens/AdminDSARDetailScreen.tsx`
- Delete: `src/features/training/screens/admin-record-completion.screen.tsx`
- Delete: `src/features/training/screens/admin-training-assign.screen.tsx`
- Delete: `src/features/training/screens/admin-training-completions.screen.tsx`
- Delete: `src/features/training/screens/admin-training-detail.screen.tsx`
- Delete: `src/features/training/screens/admin-training-form.screen.tsx`
- Delete: `src/features/training/screens/admin-training-list.screen.tsx`

- [ ] **Step 1: Delete DSAR admin screens**

Run: `rm src/features/dsar/screens/AdminDSARDashboardScreen.tsx src/features/dsar/screens/AdminDSARDetailScreen.tsx`

- [ ] **Step 2: Delete Training admin screens**

Run: `rm src/features/training/screens/admin-*.screen.tsx`

- [ ] **Step 3: Update DSAR index exports**

Modify: `src/features/dsar/index.ts`
```typescript
// src/features/dsar/index.ts
export * from './screens/MemberDSARListScreen';
export * from './screens/MemberSubmitDSARScreen';
// Remove Admin exports
```

- [ ] **Step 4: Update Training index exports**

Modify: `src/features/training/index.ts`
```typescript
// src/features/training/index.ts
export * from './screens/training-list.screen';
export * from './screens/training-detail.screen';
// Remove Admin exports
```

- [ ] **Step 5: Commit changes**

```bash
git add src/features/dsar src/features/training
git commit -m "feat: remove admin screens from DSAR and Training features"
```

### Task 3: Refactor Drawer Navigation

**Files:**
- Modify: `src/shared/components/common/drawer-content.tsx`

- [ ] **Step 1: Remove admin-related logic and menu groups**

```tsx
// src/shared/components/common/drawer-content.tsx
// ... remove import { canManageTraining } from '@src/features/training';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  // ...
  const { user, logout } = useAuthStore();
  
  // REMOVE: const isAdmin = hasHighRoleAccess(user?.role);

  const menuGroups: DrawerMenuGroup[] = [
    // ... Main Menu and Account groups remain unchanged
  ];

  /* REMOVE entire if (isAdmin) { ... } block */

  return (
    // ... render logic remains same, but menuGroups no longer includes Administrative
  );
};
```

- [ ] **Step 2: Verify drawer functionality**

Run: Check the app (if possible) or verify via unit tests if they exist.

- [ ] **Step 3: Commit changes**

```bash
git add src/shared/components/common/drawer-content.tsx
git commit -m "refactor: remove administrative section from drawer"
```

### Task 4: Refactor Dashboard Quick Actions

**Files:**
- Modify: `src/features/dashboard/screens/dashboard.screen.tsx`

- [ ] **Step 1: Remove members quick action**

```tsx
// src/features/dashboard/screens/dashboard.screen.tsx

// In DashboardScreen component:
<View className="flex-row gap-x-4 px-4">
  <QuickAction
    icon="calendar"
    label="Meetings"
    onPress={() => router.push('/(protected)/(drawer)/(tabs)/meetings')}
    className="bg-indigo-600"
  />
  <QuickAction
    icon="document-text"
    label="Documents"
    onPress={() => {}}
    className="bg-slate-800"
  />
  {/* REMOVE: QuickAction for members */}
</View>
```

- [ ] **Step 2: Commit changes**

```bash
git add src/features/dashboard/screens/dashboard.screen.tsx
git commit -m "refactor: remove members quick action from dashboard"
```

### Task 5: Refactor Meeting Minutes (Read-Only)

**Files:**
- Modify: `src/features/meetings/screens/meeting-minutes.screen.tsx`
- Modify: `src/features/meetings/components/meeting-minute-card.tsx`

- [ ] **Step 1: Remove admin actions from MeetingMinutesScreen**

```tsx
// src/features/meetings/screens/meeting-minutes.screen.tsx
export const MeetingMinutesScreen = () => {
  // ...
  // REMOVE: const isAdmin = hasHighRoleAccess(role);
  // REMOVE: const [isModalOpen, setIsModalOpen] = useState(false);
  // REMOVE: const [editingMinute, setEditingMinute] = useState<MeetingMinute | null>(null);
  // REMOVE: const deleteMutation = useDeleteMeetingMinute({ meetingId: id as string });
  
  // REMOVE handleAdd, handleEdit, handleDelete functions

  return (
    <Container>
      <StackHeader
        showBackButton
        title="Meeting Minutes"
        // REMOVE rightAction prop
      />
      <FlashList
        data={minutes}
        // ...
        renderItem={({ item }) => (
          <MinuteCard
            minute={item}
            // REMOVE isAdmin={isAdmin}, onEdit, onDelete
          />
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            {/* ... */}
            <Text variant="subtext" className="mt-4">
              No minutes recorded for this meeting.
            </Text>
            {/* REMOVE: isAdmin && <Button ... /> */}
          </View>
        )}
      />

      {/* REMOVE: <MinuteFormModal ... /> */}
    </Container>
  );
};
```

- [ ] **Step 2: Remove admin actions from MinuteCard**

```tsx
// src/features/meetings/components/meeting-minute-card.tsx
export const MinuteCard = ({
  minute,
  // REMOVE isAdmin, onEdit, onDelete
}: MinuteCardProps) => {
  return (
    <Card>
      <CardContent>
        {/* ... render content ... */}
        {/* REMOVE block that renders Edit/Delete buttons conditionally based on isAdmin */}
      </CardContent>
    </Card>
  );
};
```

- [ ] **Step 3: Commit changes**

```bash
git add src/features/meetings/screens/meeting-minutes.screen.tsx src/features/meetings/components/meeting-minute-card.tsx
git commit -m "refactor: make meeting minutes read-only on mobile"
```

### Task 6: Final Verification and Cleanup

**Files:**
- Modify: `src/features/meetings/utils/permission.ts` (Check if `hasHighRoleAccess` is still needed)

- [ ] **Step 1: Check for remaining admin route references**

Run: `grep -r "/admin" src/`
Expected: No active navigation links to admin routes.

- [ ] **Step 2: Run Type Check**

Run: `npx tsc --noEmit`
Expected: No errors related to missing imports or broken types.

- [ ] **Step 3: Commit final cleanup**

```bash
git commit -m "chore: final cleanup after admin removal"
```
