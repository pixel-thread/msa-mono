# Custom Minimalist Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a high-fidelity, custom minimalist drawer for the protected area of the app, featuring MFSA branding, grouped links, and a persistent logout footer.

**Architecture:** Use a custom `drawerContent` component within the `expo-router/drawer` layout to gain full control over the UI while leveraging `expo-router` for navigation state.

**Tech Stack:** React Native, Expo Router, Tailwind CSS (NativeWind), Lucide Icons (or Ionicons), Zustand (useAuthStore).

---

### Task 1: Create DrawerItem UI Component

**Files:**
- Create: `src/shared/components/ui/drawer-item.tsx`

- [ ] **Step 1: Create the DrawerItem component**

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '@lib/cn';

interface DrawerItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  focused?: boolean;
  onPress: () => void;
  variant?: 'default' | 'destructive';
}

export const DrawerItem = ({ label, icon, focused, onPress, variant = 'default' }: DrawerItemProps) => {
  const isDestructive = variant === 'destructive';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(
        'flex-row items-center px-6 py-3.5 mb-1 mx-2 rounded-xl transition-all',
        focused && 'bg-indigo-50 dark:bg-slate-900 border-l-4 border-indigo-600',
        !focused && 'hover:bg-slate-50 dark:hover:bg-slate-900'
      )}
    >
      <Ionicons 
        name={icon} 
        size={22} 
        color={isDestructive ? '#ef4444' : focused ? '#4f46e5' : '#64748b'} 
      />
      <Text
        className={cn(
          'ml-3 font-semibold',
          isDestructive ? 'text-red-500' : focused ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400'
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/ui/drawer-item.tsx
git commit -m "feat: add DrawerItem component"
```

---

### Task 2: Implement CustomDrawerContent Shell

**Files:**
- Modify: `src/app/(protected)/(drawer)/_layout.tsx`

- [ ] **Step 1: Define CustomDrawerContent and Header**

```tsx
import React from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Text } from '@src/shared/components/ui/text';
import { DrawerItem } from '@src/shared/components/ui/drawer-item';
import { useAuthStore } from '@src/shared/store/auth.store';
import { useRouter, useSegments } from 'expo-router';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const router = useRouter();
  const segments = useSegments();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Active route detection
  const currentRoute = segments[segments.length - 1];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      {/* Header */}
      <View className="px-6 py-8 border-b border-slate-100 dark:border-slate-900">
        <Text className="text-2xl font-black text-indigo-600 tracking-tighter">MFSA</Text>
        <Text variant="subtext" size="xs" className="uppercase tracking-widest font-bold opacity-60">
          Association App
        </Text>
      </View>

      <ScrollView className="flex-1 py-4">
        {/* Main Menu Group */}
        <View className="mb-6">
          <Text className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Main Menu
          </Text>
          <DrawerItem 
            label="Home" 
            icon="home" 
            focused={currentRoute === '(tabs)'} 
            onPress={() => router.push('/(protected)/(drawer)/(tabs)')} 
          />
          <DrawerItem 
            label="Meetings" 
            icon="calendar" 
            focused={currentRoute === 'meetings'} 
            onPress={() => router.push('/(protected)/(drawer)/(tabs)/meetings')} 
          />
          <DrawerItem 
            label="Members" 
            icon="people" 
            focused={currentRoute === 'members'} 
            onPress={() => router.push('/(protected)/members')} 
          />
        </View>

        {/* Account Group */}
        <View className="mb-6">
          <Text className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Account
          </Text>
          <DrawerItem 
            label="My Profile" 
            icon="person" 
            focused={currentRoute === 'profile'} 
            onPress={() => router.push('/(protected)/(drawer)/(tabs)/profile')} 
          />
          <DrawerItem 
            label="Subscription" 
            icon="card" 
            focused={currentRoute === 'subscription'} 
            onPress={() => router.push('/(protected)/(drawer)/(tabs)/subscription')} 
          />
        </View>
      </ScrollView>

      {/* Footer Group */}
      <View className="border-t border-slate-100 dark:border-slate-900 pt-4 pb-6">
         <DrawerItem 
            label="Terms & Conditions" 
            icon="document-text" 
            onPress={() => {}} 
          />
          <DrawerItem 
            label="Privacy Policy" 
            icon="shield-checkmark" 
            onPress={() => {}} 
          />
          <DrawerItem 
            label="Logout" 
            icon="log-out" 
            variant="destructive"
            onPress={logout} 
          />
          <View className="px-6 mt-4">
             <Text className="text-[10px] text-slate-400 font-medium">v1.0.0</Text>
          </View>
      </View>
    </SafeAreaView>
  );
};

const DrawerLayout = () => {
  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Home' }} />
    </Drawer>
  );
};

export default DrawerLayout;
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(protected)/(drawer)/_layout.tsx
git commit -m "feat: implement CustomDrawerContent with grouped links and logout"
```

---

### Task 3: Refine Navigation Paths and Styles

**Files:**
- Modify: `src/app/(protected)/(drawer)/_layout.tsx`

- [ ] **Step 1: Ensure all navigation paths are correct**
Verify the links for `Members` and other protected routes. (Currently `members` is at `src/app/(protected)/members/index.tsx`).

- [ ] **Step 2: Commit**

```bash
git add src/app/(protected)/(drawer)/_layout.tsx
git commit -m "chore: refine drawer navigation paths"
```
