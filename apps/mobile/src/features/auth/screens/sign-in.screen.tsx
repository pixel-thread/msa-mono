import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { View,  KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { SignInSchema, type SignInFormData } from '../validators';
import { useSignIn } from '../hooks';
import {
  Button,
  Text,
  FieldInput,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@src/shared/components/ui';
import { useRateLimit } from '@src/shared/hooks/use-rate-limiting';
import { useAuthStore, useSecureTokenStore } from '../store';

export const SignInScreen = () => {
  const { isAuthenticated } = useAuthStore();
  const { refreshToken } = useSecureTokenStore();
  const { isProcessing, isLimited, executeWithLimit } = useRateLimit('SIGN_IN', {
    limit: 3,
    windowMs: 10000,
  });

  const methods = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    mode: 'onBlur',
  });

  const { mutate: signIn, isPending } = useSignIn();

  const onSubmit = (data: SignInFormData) => executeWithLimit(() => signIn(data));

  if (isAuthenticated && refreshToken) {
    return <Redirect href={'/'} />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerClassName="flex-grow justify-center items-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="mb-12 w-full max-w-sm items-center justify-center">
          <View>
            <Text variant="heading" className="text-center" weight={'semibold'} size="3xl">
              Sign In to {process.env.EXPO_PUBLIC_ASSOCIATION_SLUG?.toLocaleUpperCase()} Connect
            </Text>
            <Text variant="subtext" size="sm" className="mt-2 text-center">
              Secure authentication for authorized personnel
            </Text>
          </View>
        </View>

        <Card>
          <CardHeader className="gap-y-2 p-6">
            <CardTitle className="text-2xl font-bold tracking-widest">SIGN IN</CardTitle>
            <CardDescription>Enter your email and pasword to continue</CardDescription>
          </CardHeader>
          <CardContent className="">
            <FormProvider {...methods}>
              <View className="gap-y-2">
                <FieldInput
                  name="email"
                  label="Email"
                  placeholder="name@institution.gov"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <FieldInput
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  onEndEditing={methods.handleSubmit(onSubmit)}
                  secureTextEntry
                />

                <View className="flex-row justify-end py-1">
                  <Link href="/(auth)/forgot-password" className="border-b border-primary">
                    <Text className="uppercase" variant="link" size="sm" weight="medium">
                      Forgot Password?
                    </Text>
                  </Link>
                </View>

                <Button
                  onPress={methods.handleSubmit(onSubmit)}
                  loading={isPending || isProcessing || isLimited}
                  variant={'default'}
                  className="mt-4 h-14 ">
                  {isPending ? 'Signing in' : 'Signin'}
                </Button>
              </View>
            </FormProvider>
          </CardContent>
          <CardFooter className="w-full">
            <View className="w-full flex-row items-center justify-center gap-x-2">
              <Text variant="subtext" size="sm">
                Don&apos;t have an account?
              </Text>
              <Link href="/(auth)/sign-up" className="border-b border-primary">
                <Text variant="link" className="uppercase" size="sm" weight="bold">
                  Sign Up
                </Text>
              </Link>
            </View>
          </CardFooter>
        </Card>

        <View className="mt-12 items-center">
          <Text variant="subtext" size="xs" className="text-center">
            Protected by end-to-end encryption.{'\n'}
            Unauthorized access is strictly prohibited.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
