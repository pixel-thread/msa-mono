# Profile MFA & Edit Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new screen to edit user profile details (name, email, avatar) and allow toggling MFA status directly from the Profile tab.

**Architecture:** We will create an `edit-profile.screen.tsx` feature component, register it in the expo-router at `/profile/edit`, and modify the main `profile.screen.tsx` to include an "Edit Profile" button and an MFA toggle button in the Security accordion. We will use `react-hook-form` and `zod` for the edit form, and optimistic UI updates for `auth.store.ts`.

**Tech Stack:** React Native, Expo Router, NativeWind (Tailwind), React Hook Form, Zod, Zustand.

---

### Task 1: Create the Edit Profile Screen Component

**Files:**
- Create: `src/features/profile/screens/edit-profile.screen.tsx`
- Modify: `src/features/profile/index.ts`

- [ ] **Step 1: Write the Edit Profile Screen**

```tsx
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@src/shared/store';
import { Container, StackHeader } from '@src/shared/components';
import { Button, Text } from '@src/shared/components/ui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';

// A simple local text input since we don't know the exact UI library text input
// Alternatively, use a raw TextInput wrapped in styling.
import { TextInput } from 'react-native';

const editProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export const EditProfileScreen = () => {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: EditProfileForm) => {
    if (!user) return;
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 800));
      
      setUser({
        ...user,
        name: data.name,
        email: data.email,
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <Container>
      <StackHeader title="Edit Profile" showBackButton />
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
          <View className="relative">
            <View className="h-28 w-28 items-center justify-center rounded-full bg-indigo-600 shadow-xl">
              <Text weight="bold" className="text-4xl text-white">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-slate-100">
              <Ionicons name="camera" size={16} color="#475569" />
            </TouchableOpacity>
          </View>
          <Text className="mt-2 text-slate-500">Tap to change avatar</Text>
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-slate-700 font-medium">Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`h-12 border rounded-lg px-4 bg-white ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter your name"
              />
            )}
          />
          {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>}
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-slate-700 font-medium">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`h-12 border rounded-lg px-4 bg-white ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>}
        </View>

        <Button 
          title={isSubmitting ? "Saving..." : "Save Changes"} 
          onPress={handleSubmit(onSubmit)} 
          disabled={isSubmitting}
        />
      </ScrollView>
    </Container>
  );
};
```

- [ ] **Step 2: Export the component in profile index**

```typescript
// Replace src/features/profile/index.ts completely:
export * from './screens/profile.screen';
export * from './screens/edit-profile.screen';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/profile/screens/edit-profile.screen.tsx src/features/profile/index.ts
git commit -m "feat(profile): create edit profile screen component"
```

### Task 2: Register Edit Profile Route

**Files:**
- Create: `src/app/(protected)/(drawer)/(tabs)/profile/edit.tsx`

- [ ] **Step 1: Create the route file**

```tsx
import { EditProfileScreen } from '@src/features/profile';

export default function EditProfileRoute() {
  return <EditProfileScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(protected\)/\(drawer\)/\(tabs\)/profile/edit.tsx
git commit -m "feat(profile): register edit profile route"
```

### Task 3: Update Main Profile Screen (Add Buttons)

**Files:**
- Modify: `src/features/profile/screens/profile.screen.tsx`

- [ ] **Step 1: Update the ProfileScreen to add navigation and MFA toggle**

*Note: You will need to import `useRouter` from 'expo-router', add `useRouter()` inside the component, and inject the buttons. You also need the `setUser` function from `useAuthStore`.*

```tsx
// At the top of src/features/profile/screens/profile.screen.tsx add/modify imports:
// Add: import { useRouter } from 'expo-router';
// Change: const { user, setUser } = useAuthStore();
// Add inside component: const router = useRouter();
```

Inside the component, locate the Profile Header section and add the Edit Profile button:
```tsx
          {/* Profile Header */}
          <View className="items-center px-4 pb-8 pt-10">
            {/* existing avatar and camera icon */}
            <Text variant="heading" size="2xl" className="text-slate-900 dark:text-white">
              {user.name}
            </Text>
            <Text variant="subtext" size="sm" className="mt-1">
              {user.email}
            </Text>
            {/* NEW BUTTON */}
            <Button
              variant="outline"
              size="sm"
              title="Edit Profile"
              className="mt-4 h-10 w-32"
              onPress={() => router.push('/profile/edit')}
            />
          </View>
```

Next, locate the Security Accordion section and update it:
```tsx
              <AccordionItem value="security">
                <AccordionTrigger>
                  <View className="flex-row items-center gap-x-3">
                    <Ionicons name="lock-closed-outline" size={20} color="#6366f1" />
                    <Text weight="medium">Security</Text>
                  </View>
                </AccordionTrigger>
                <AccordionContent>
                  <Text variant="subtext" size="sm">
                    Update your password, manage MFA devices, and view active sessions.
                  </Text>
                  <View className="mt-3 flex-row gap-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      title="Security Settings"
                      className="flex-1 h-10"
                    />
                    <Button
                      variant={user.mfaEnabled ? "outline" : "default"}
                      size="sm"
                      title={user.mfaEnabled ? "Disable MFA" : "Enable MFA"}
                      className="flex-1 h-10"
                      onPress={() => {
                        setUser({ ...user, mfaEnabled: !user.mfaEnabled });
                        // Simulated alert for demo purposes
                        alert(`MFA ${user.mfaEnabled ? 'Disabled' : 'Enabled'}`);
                      }}
                    />
                  </View>
                </AccordionContent>
              </AccordionItem>
```

- [ ] **Step 2: Commit**

```bash
git add src/features/profile/screens/profile.screen.tsx
git commit -m "feat(profile): add edit profile button and mfa toggle"
```

### Task 4: Verify Functionality

**Files:**
- Manual Verification

- [ ] **Step 1: Check build**

Run: `npm run lint` and `npx tsc --noEmit` to ensure there are no formatting or type errors.

- [ ] **Step 2: Commit any fixes**

If any fixes were applied:
```bash
git add .
git commit -m "fix(profile): resolve type and lint errors"
```
