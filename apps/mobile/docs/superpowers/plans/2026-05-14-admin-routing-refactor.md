# Admin Routing Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relocate Member and DSAR screens into a unified `admin` route group for better organization and navigation consistency.

**Architecture:** File-based routing refactor within Expo Router's `(protected)` directory. Groups administrative screens under `/(protected)/admin`.

**Tech Stack:** React Native, Expo Router, TypeScript.

---

### Task 1: Verify Directory Moves (Pre-check)

**Files:**
- Check: `src/app/(protected)/admin/members/index.tsx`
- Check: `src/app/(protected)/admin/members/[id]/index.tsx`
- Check: `src/app/(protected)/admin/members/_layout.tsx`

- [ ] **Step 1: Confirm files are in their new locations**

Run: `ls -R "src/app/(protected)/admin"`
Expected: 
```
dsar    members

src/app/(protected)/admin/dsar:
[id].tsx        index.tsx

src/app/(protected)/admin/members:
_layout.tsx     [id]            index.tsx

src/app/(protected)/admin/members/[id]:
index.tsx
```

### Task 2: Ensure DSAR Consistency

**Files:**
- Create: `src/app/(protected)/admin/dsar/_layout.tsx`

- [ ] **Step 1: Create DSAR layout for consistency**

```tsx
// src/app/(protected)/admin/dsar/_layout.tsx
import { Container } from '@src/shared/components';
import { Stack } from 'expo-router';

export default function layout() {
  return (
    <Container>
      <Stack screenOptions={{ headerShown: false }} />
    </Container>
  );
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/app/(protected)/admin/dsar/_layout.tsx
git commit -m "feat: add layout for admin/dsar routes for consistency"
```

### Task 3: Update Navigation in Dashboard

**Files:**
- Modify: `src/features/dashboard/screens/dashboard.screen.tsx`

- [ ] **Step 1: Update navigation route for members**

```tsx
// src/features/dashboard/screens/dashboard.screen.tsx

// Old:
// onPress={() => router.push('/(protected)/members')}

// New:
onPress={() => router.push('/(protected)/admin/members')}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/features/dashboard/screens/dashboard.screen.tsx
git commit -m "refactor: update dashboard navigation to admin/members"
```

### Task 4: Update Navigation in Member Cards

**Files:**
- Modify: `src/features/members/components/member-card.component.tsx`

- [ ] **Step 1: Update navigation route for member details**

```tsx
// src/features/members/components/member-card.component.tsx

const onPress = () => {
  router.push(`/(protected)/admin/members/${member.id}`);
};
```

- [ ] **Step 2: Commit changes**

```bash
git add src/features/members/components/member-card.component.tsx
git commit -m "refactor: update member card navigation to admin/members/[id]"
```

### Task 5: Update Navigation in Custom Drawer

**Files:**
- Modify: `src/shared/components/common/drawer-content.tsx`

- [ ] **Step 1: Update navigation routes for Members and DSAR Management**

```tsx
// src/shared/components/common/drawer-content.tsx

// In menuGroups:
{
  label: 'Members',
  icon: 'people',
  onPress: () => router.push('/(protected)/admin/members'),
},

// In isAdmin section:
{
  label: 'DSAR Management',
  icon: 'shield-checkmark',
  onPress: () => router.push('/(protected)/admin/dsar'),
},
```

- [ ] **Step 2: Commit changes**

```bash
git add src/shared/components/common/drawer-content.tsx
git commit -m "refactor: update drawer navigation to admin routes"
```

### Task 6: Final Validation

- [ ] **Step 1: Verify no remaining old routes**

Run: `grep -r "/(protected)/members" src/`
Expected: No matches (except maybe in docs or comments).

- [ ] **Step 2: Confirm all admin routes exist**

Run: `ls -R "src/app/(protected)/admin"`
Expected: Complete list of DSAR and Member files.
