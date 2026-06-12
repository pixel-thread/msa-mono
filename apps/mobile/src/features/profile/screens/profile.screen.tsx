import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@src/shared/store';
import { Container, StackHeader } from '@src/shared/components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@src/shared/components/ui';
import { cn } from '@lib/cn';
import { truncateText } from '@src/shared/utils/text';
import { LoadingScreen } from '@src/shared/components/screens';
import { LogoutButton } from '../components/logout-button';
import { useRouter } from 'expo-router';

export const ProfileScreen = () => {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  if (!user)
    return (
      <>
        <StackHeader showDrawerButton title="Profile" />
        <LoadingScreen message="Loading profile..." />
      </>
    );

  return (
    <Container>
      <StackHeader title="Profile" showDrawerButton />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center px-4 pb-8 pt-10">
          <View className="relative mb-4">
            <View className="h-28 w-28 items-center justify-center bg-indigo-600 shadow-xl shadow-indigo-200">
              <Text weight="bold" className="text-4xl text-white">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center border-4 border-slate-50 bg-slate-100 dark:border-slate-950 dark:bg-slate-800">
              <Ionicons name="camera" size={16} color="#475569" />
            </TouchableOpacity>
          </View>
          <Text variant="heading" size="2xl" className="text-slate-900 dark:text-white">
            {user.name}
          </Text>
          <Text variant="subtext" size="sm" className="mt-1">
            {user.email}
          </Text>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-10 w-32"
            onPress={() => router.push('/(protected)/profile/edit')}>
            Edit Profile
          </Button>
        </View>

        {/* Account Details */}
        <View className="px-4">
          <Card className="border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle size="sm" className="uppercase tracking-widest text-slate-400">
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-y-4">
              <InfoItem icon="briefcase-outline" label="Role" value={user.role[0]} />
              <InfoItem
                icon="shield-checkmark-outline"
                label="MFA Status"
                value={user.mfaEnabled ? 'Enabled' : 'Disabled'}
                valueClassName={user.mfaEnabled ? 'text-emerald-600' : 'text-slate-400'}
              />
              <InfoItem
                icon="finger-print-outline"
                label="User ID"
                value={truncateText({ text: user.id, maxLength: 20 })}
              />
            </CardContent>
          </Card>
        </View>

        {/* Preferences & Settings */}
        <View className="mt-6 px-4">
          <Text
            variant="label"
            className="mb-3 ml-1 uppercase tracking-widest text-slate-400"
            size="xs">
            Preferences
          </Text>
          <Card className="border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Accordion className="px-4">
              <AccordionItem value="notifications">
                <AccordionTrigger>
                  <View className="flex-row items-center gap-x-3">
                    <Ionicons name="notifications-outline" size={20} color="#6366f1" />
                    <Text weight="medium">Notifications</Text>
                  </View>
                </AccordionTrigger>
                <AccordionContent>
                  <Text variant="subtext" size="sm">
                    Configure how you receive updates about meetings and institutional
                    announcements.
                  </Text>
                  <Button variant="outline" size="sm" className="mt-3 h-10">
                    Manage Alerts
                  </Button>
                </AccordionContent>
              </AccordionItem>

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
                    <Button variant="outline" size="sm" className="h-10 flex-1">
                      Security Settings
                    </Button>
                    <Button
                      variant={user.mfaEnabled ? 'outline' : 'default'}
                      size="sm"
                      className="h-10 flex-1"
                      onPress={() => {
                        setUser({ ...user, mfaEnabled: !user.mfaEnabled });
                        alert(`MFA ${user.mfaEnabled ? 'Disabled' : 'Enabled'}`);
                      }}>
                      {user.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                    </Button>
                  </View>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="invoices">
                <AccordionTrigger>
                  <View className="flex-row items-center gap-x-3">
                    <Ionicons name="document-text-outline" size={20} color="#6366f1" />
                    <Text weight="medium">Invoices</Text>
                  </View>
                </AccordionTrigger>
                <AccordionContent>
                  <Text variant="subtext" size="sm">
                    View your payment history and download invoices as PDFs.
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-10"
                    onPress={() => router.push('/(protected)/profile/invoices')}>
                    View Invoices
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy">
                <AccordionTrigger>
                  <View className="flex-row items-center gap-x-3">
                    <Ionicons name="shield-outline" size={20} color="#6366f1" />
                    <Text weight="medium">Privacy & Data</Text>
                  </View>
                </AccordionTrigger>
                <AccordionContent>
                  <Text variant="subtext" size="sm">
                    Submit Data Subject Access Requests (DSAR) or manage your data preferences.
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-10"
                    onPress={() => router.push('/(protected)/profile/privacy/requests')}>
                    Privacy Requests
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="help" className="border-b-0">
                <AccordionTrigger>
                  <View className="flex-row items-center gap-x-3">
                    <Ionicons name="help-circle-outline" size={20} color="#6366f1" />
                    <Text weight="medium">Support</Text>
                  </View>
                </AccordionTrigger>
                <AccordionContent>
                  <Text variant="subtext" size="sm">
                    Get assistance with your account or report issues with the application.
                  </Text>
                  <Button variant="outline" size="sm" className="mt-3 h-10">
                    Contact Support
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </View>

        {/* Action Section */}
        <View className="mt-10 px-4 pb-12">
          <LogoutButton />

          <View className="mt-8 items-center">
            <View className="bg-slate-100 px-3 py-1 dark:bg-slate-800">
              <Text variant="subtext" size="xs" weight="medium">
                Version 1.0.0 (Stable)
              </Text>
            </View>
            <Text variant="subtext" size="xs" className="mt-2 opacity-50">
              Authorized Government Personnel Only
            </Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <View className="flex-row items-center justify-between py-1">
    <View className="flex-row items-center gap-x-3">
      <View className="h-9 w-9 items-center justify-center bg-slate-50 dark:bg-slate-800">
        <Ionicons name={icon} size={18} color="#64748b" />
      </View>
      <Text variant="label" className="text-slate-500">
        {label}
      </Text>
    </View>
    <Text
      weight="semibold"
      size="sm"
      className={cn('text-slate-900 dark:text-slate-100', valueClassName)}
      numberOfLines={1}>
      {value}
    </Text>
  </View>
);
