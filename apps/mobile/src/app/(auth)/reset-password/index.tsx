import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';

import {
  ResetPasswordSchema,
  type ResetPasswordInput,
} from '@features/auth/validators/reset-password';
import { useResetPassword } from '@features/auth/hooks/use-reset-password';
import { Button, Text, FieldInput, Card, CardContent } from '@src/shared/components/ui';
import { useRateLimit } from '@src/shared/hooks/use-rate-limiting';

export default function ResetPasswordPage() {
  const methods = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onBlur',
  });
  const { isLimited, retryAfter, executeWithLimit } = useRateLimit('RESEND_RESET_PASSWORD', {
    limit: 1,
    windowMs: 30000,
  });

  const { mutate: resetPassword, isPending } = useResetPassword();

  const onSubmit = (data: ResetPasswordInput) => resetPassword(data);

  const handleResend = () => executeWithLimit(() => {});

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="mb-12 items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center bg-primary">
            <Ionicons name="lock-closed" size={40} color="#fff" />
          </View>
          <Text variant="heading" size="3xl">
            New Password
          </Text>
          <Text variant="subtext" size="sm" className="mt-2 text-center">
            Enter the code from your email and create a new password
          </Text>
        </View>

        <Card>
          <CardContent className="p-6">
            <FormProvider {...methods}>
              <View className="gap-y-2">
                <FieldInput
                  name="password"
                  label="New Password"
                  placeholder="••••••••"
                  secureTextEntry
                />

                <FieldInput
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="••••••••"
                  secureTextEntry
                />

                <Button
                  onPress={methods.handleSubmit(onSubmit)}
                  loading={isPending}
                  className="mt-4 h-14">
                  {isPending ? 'Updating...' : 'Reset Password'}
                </Button>
              </View>
            </FormProvider>
          </CardContent>
        </Card>

        <View className="mt-8 flex-row items-center justify-center gap-x-2">
          <Text variant="subtext" size="sm">
            Did not receive a code?
          </Text>
          <Button onPress={handleResend} variant={'ghost'}>
            {isLimited ? `${retryAfter} seconds` : 'Resend'}
          </Button>
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-x-2">
          <Text variant="subtext" size="sm">
            Remember your password?
          </Text>
          <Link href="/(auth)/sign-in">
            <Text variant="link" size="sm" weight="bold">
              Sign In
            </Text>
          </Link>
        </View>

        <View className="mt-12 items-center">
          <Text variant="subtext" size="xs" className="text-center">
            Password must be at least 8 characters{'\n'}
            with uppercase, lowercase, number, and special character
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
