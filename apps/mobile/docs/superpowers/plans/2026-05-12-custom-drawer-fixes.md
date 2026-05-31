# Custom Drawer Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve accessibility, remove web-specific styles, and add missing links to the custom drawer.

**Architecture:** Updating existing `DrawerItem` UI component and the `DrawerLayout` configuration.

**Tech Stack:** React Native, Expo Router, NativeWind (Tailwind CSS).

---

### Task 1: Update `DrawerItem` for Accessibility and Cleanup

**Files:**
- Modify: `src/shared/components/ui/drawer-item.tsx`

- [ ] **Step 1: Apply accessibility roles and labels**

Add `accessibilityRole="button"` and `accessibilityLabel={label}` to the `TouchableOpacity`.

- [ ] **Step 2: Remove web-specific Tailwind classes**

Remove `transition-all`, `hover:bg-slate-50`, and `dark:hover:bg-slate-900`.

```tsx
<<<<
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(
        'flex-row items-center px-6 py-3.5 mb-1 mx-2 rounded-xl transition-all',
        focused && 'bg-indigo-50 dark:bg-slate-900 border-l-4 border-indigo-600',
        !focused && 'hover:bg-slate-50 dark:hover:bg-slate-900'
      )}
    >
====
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn(
        'flex-row items-center px-6 py-3.5 mb-1 mx-2 rounded-xl',
        focused && 'bg-indigo-50 dark:bg-slate-900 border-l-4 border-indigo-600'
      )}
    >
>>>>
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/ui/drawer-item.tsx
git commit -m "style: remove web-specific hover classes and add accessibility props to DrawerItem"
```

### Task 2: Add Support Link to Drawer Footer

**Files:**
- Modify: `src/app/(protected)/(drawer)/_layout.tsx`

- [ ] **Step 1: Add Support link to Footer Group**

Add a new `DrawerItem` for "Support" with the `help-circle` icon before the "Logout" item.

```tsx
<<<<
      {/* Footer Group */}
      <View className="border-t border-slate-100 pb-6 pt-4 dark:border-slate-900">
        <DrawerItem label="Terms & Conditions" icon="document-text" onPress={() => {}} />
        <DrawerItem label="Privacy Policy" icon="shield-checkmark" onPress={() => {}} />
        <DrawerItem label="Logout" icon="log-out" variant="destructive" onPress={logout} />
====
      {/* Footer Group */}
      <View className="border-t border-slate-100 pb-6 pt-4 dark:border-slate-900">
        <DrawerItem label="Support" icon="help-circle" onPress={() => {}} />
        <DrawerItem label="Terms & Conditions" icon="document-text" onPress={() => {}} />
        <DrawerItem label="Privacy Policy" icon="shield-checkmark" onPress={() => {}} />
        <DrawerItem label="Logout" icon="log-out" variant="destructive" onPress={logout} />
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(protected)/(drawer)/_layout.tsx
git commit -m "feat: add Support link to drawer footer"
```

### Task 3: Final Verification

- [ ] **Step 1: Verify changes manually**

Check that `DrawerItem` no longer has hover classes and includes accessibility props.
Verify "Support" link is visible in the drawer footer.

- [ ] **Step 2: Final commit and cleanup**

```bash
git add .
git commit -m "chore: apply code review fixes for accessibility and missing links"
```
