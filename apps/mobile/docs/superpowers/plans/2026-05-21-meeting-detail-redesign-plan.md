# Meeting Detail Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the MeetingDetailScreen to match a "Modern Civic" government app aesthetic characterized by high-contrast typography, reduced border radii, and a formal layout.

**Architecture:** We will modify the tailwind utility classes (`className`) across two files: the `MeetingInfoCard` component and the `MeetingDetailScreen` component. Changes focus on updating `bg-`, `text-`, `rounded-`, and `shadow-` utility classes.

**Tech Stack:** React Native, Expo, NativeWind (Tailwind CSS), lucide-react-native / @expo/vector-icons.

---

### Task 1: Update MeetingInfoCard Component Styling

**Files:**
- Modify: `src/features/meetings/components/meeting-info-card.tsx`

- [ ] **Step 1: Write the updated implementation**

Edit `src/features/meetings/components/meeting-info-card.tsx` to simplify borders, remove tinted backgrounds, and use `rounded-lg` instead of `rounded-2xl` for the icon container.

```tsx
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@lib/cn';
import { View } from 'react-native';

export const MeetingInfoCard = ({
  icon,
  label,
  value,
  className,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  className?: string;
}) => (
  <Card
    className={cn(
      'border-slate-200 bg-white shadow-none dark:border-slate-700 dark:bg-slate-900',
      className
    )}>
    <CardContent className="flex-row items-center justify-center gap-x-3 p-4">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
        <Ionicons name={icon} size={20} color="#64748b" />
      </View>
      <View className="flex-1">
        <Text variant="label" size="xs" className="uppercase tracking-widest text-slate-500">
          {label}
        </Text>
        <Text weight="bold" size="sm" className="mt-0.5 text-slate-900 dark:text-white">
          {value}
        </Text>
      </View>
    </CardContent>
  </Card>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/features/meetings/components/meeting-info-card.tsx
git commit -m "style(meetings): update MeetingInfoCard to Modern Civic aesthetic"
```

### Task 2: Update Hero Badges and Typography in MeetingDetailScreen

**Files:**
- Modify: `src/features/meetings/screens/meeting-detail.screen.tsx`

- [ ] **Step 1: Update the Hero Section badges**

In `src/features/meetings/screens/meeting-detail.screen.tsx`, find the hero section and update the meeting type badge and status badge classes. Also increase description line height.

Replace the meeting type badge container:
```tsx
            <View className="rounded-md bg-slate-900 dark:bg-slate-800 px-2 py-0.5">
              <Text weight="bold" size="xs" className="uppercase tracking-widest text-white">
                {meeting.type}
              </Text>
            </View>
```

Replace the meeting status badge container and text:
```tsx
            <View
              className={cn(
                'rounded-md border px-2 py-0.5',
                meeting.status === 'SCHEDULED'
                  ? 'border-slate-300 bg-transparent dark:border-slate-600'
                  : 'border-slate-300 bg-transparent dark:border-slate-600'
              )}>
              <Text
                size="xs"
                weight="medium"
                className={cn(
                  'text-[10px]',
                  meeting.status === 'SCHEDULED'
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-600 dark:text-slate-400'
                )}>
                {meeting.status}
              </Text>
            </View>
```

Replace the description text:
```tsx
          {meeting.description && (
            <Text variant="subtext" size="sm" className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
              {meeting.description}
            </Text>
          )}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/meetings/screens/meeting-detail.screen.tsx
git commit -m "style(meetings): update hero section badges for govt aesthetic"
```

### Task 3: Update RSVP Action Buttons

**Files:**
- Modify: `src/features/meetings/screens/meeting-detail.screen.tsx`

- [ ] **Step 1: Update RSVP Action Buttons**

In `src/features/meetings/screens/meeting-detail.screen.tsx`, locate the primary "Confirm Attendance" button and secondary "Unable to Attend" button.

Replace the primary button:
```tsx
              <Button
                title={
                  attendees?.some((a) => a.user.id === user?.id && a.rsvpStatus !== 'PENDING')
                    ? 'Update RSVP'
                    : 'Confirm Attendance'
                }
                loading={isUpdatingRsvp}
                disabled={isUpdatingRsvp || isAccepted}
                onPress={() => handleRsvp('ACCEPTED')}
                className="h-14 flex-[2] rounded-lg bg-slate-900 shadow-none dark:bg-slate-800"
              />
```

Replace the secondary button:
```tsx
              <Button
                title="Unable to Attend"
                variant="outline"
                loading={isUpdatingRsvp}
                disabled={isUpdatingRsvp || isDeclined}
                onPress={() => handleRsvp('DECLINED')}
                className="h-14 flex-1 rounded-lg border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"
              />
```

- [ ] **Step 2: Commit**

```bash
git add src/features/meetings/screens/meeting-detail.screen.tsx
git commit -m "style(meetings): update RSVP buttons to use slate colors and rounded-lg"
```

### Task 4: Update Agenda & Attendance Sections

**Files:**
- Modify: `src/features/meetings/screens/meeting-detail.screen.tsx`

- [ ] **Step 1: Update Agenda card borders and numbering**

Find the "Order of Business" agenda rendering block.

Update the Card:
```tsx
            <Card className="border-slate-200 bg-white shadow-none dark:border-slate-700 dark:bg-slate-900 rounded-xl">
```

Update the list item rendering:
```tsx
                {agenda?.map((item, index) => (
                  <View
                    key={index}
                    className={cn(
                      'flex-1 flex-col gap-x-4 p-4',
                      index !== agenda.length - 1 &&
                        'border-b border-slate-100 dark:border-slate-800'
                    )}>
                    <View className="flex-row items-start gap-x-3">
                      <View className="pt-0.5">
                        <Text size="sm" weight="bold" className="text-slate-400">
                          {String(index + 1).padStart(2, '0')}.
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="leading-tight text-slate-900 dark:text-slate-100 font-semibold">
                          {item.title}
                        </Text>
                        {item.description && (
                          <Text className="mt-1 leading-tight text-slate-600 dark:text-slate-400">
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
```

- [ ] **Step 2: Update Attendance card borders, numbering, and Institutional Lead icon**

Find the "Attendance" section Card.

Update the Card:
```tsx
          <Card className="border-slate-200 bg-white shadow-none dark:border-slate-700 dark:bg-slate-900 rounded-xl">
```

Update the Registered Attendees list numbering:
```tsx
                      <View className="flex-row items-center gap-x-3">
                        <View className="w-8 items-center justify-center">
                          <Text size="sm" weight="bold" className="text-slate-400">
                            {String(index + 1).padStart(2, '0')}.
                          </Text>
                        </View>
                        <Text className="flex-1 leading-tight text-slate-900 dark:text-slate-100 font-medium">
                          {attendee.user.name}
                        </Text>
                      </View>
```

Update the Institutional Lead section:
```tsx
                  <View className="flex-row items-center gap-x-3 py-2">
                    <View className="h-10 w-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                      <Text weight="bold" className="text-slate-900 dark:text-slate-100">
                        {meeting.createdBy.name?.charAt(0) ||
                          meeting.createdBy.email.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text weight="semibold" size="sm" className="text-slate-900 dark:text-slate-100">
                        {meeting.createdBy.name || 'Administrative Office'}
                      </Text>
                      <Text variant="subtext" size="xs" className="text-slate-500">
                        {meeting.createdBy.email}
                      </Text>
                    </View>
                  </View>
```

- [ ] **Step 3: Commit**

```bash
git add src/features/meetings/screens/meeting-detail.screen.tsx
git commit -m "style(meetings): update agenda and attendance sections to formal civic style"
```
