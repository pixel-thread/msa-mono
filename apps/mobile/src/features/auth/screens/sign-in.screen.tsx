import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { View, ScrollView, Image } from 'react-native';
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
  textVariants,
} from '@src/shared/components/ui';
import { useRateLimit } from '@src/shared/hooks/use-rate-limiting';
import { useAuthStore, useSecureTokenStore } from '../store';
import { KeyboardSafeView } from '@src/shared/components/common/keyboard-safe-view';
import { cn } from '@src/shared/lib/cn';

const defaultValues: SignInFormData = {
  email: process.env.EXPO_PUBLIC_EMAIL || '',
  password: process.env.EXPO_PUBLIC_PASSWORD || '',
};

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
    defaultValues,
  });

  const { mutate: signIn, isPending } = useSignIn();

  const onSubmit = async (data: SignInFormData) => {
    const payload = {
      email: data.email,
      password: data.password,
    };

    executeWithLimit(() => signIn(payload));
  };

  if (isAuthenticated && refreshToken) {
    return <Redirect href={'/'} />;
  }

  return (
    <KeyboardSafeView>
      <ScrollView
        contentContainerClassName="flex-grow justify-center items-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="mb-12 w-full max-w-sm items-center justify-center">
          <View className="items-center justify-center gap-y-2">
            <Image
              source={require('@assets/icons/splash-icon.png')}
              className="h-32 w-32"
              alt="msa-logo"
            />
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
            <CardTitle className="text-2xl tracking-widest">SIGN IN</CardTitle>
            <CardDescription>Enter your email and pasword to continue</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <Link href="/(auth)/forgot-password">
                    <Text className="flex-1 uppercase" variant="link" size="sm" weight="medium">
                      Forgot Password?
                    </Text>
                  </Link>
                </View>

                <Button
                  onPress={methods.handleSubmit(onSubmit)}
                  loading={isPending || isProcessing || isLimited}
                  variant={'default'}
                  className="mt-4 h-14 ">
                  Continue
                </Button>
              </View>
            </FormProvider>
          </CardContent>
          <CardFooter className="w-full">
            <View className="w-full flex-row items-center justify-center gap-x-2">
              <View>
                <Text variant="subtext" size="sm" className="w-auto flex-1">
                  Don&apos;t have an account?
                </Text>
              </View>
              <View>
                <Link
                  href="/(auth)/sign-up"
                  className={cn(
                    textVariants({
                      className: 'flex-1 border-b border-primary uppercase',
                      variant: 'link',
                      size: 'sm',
                      weight: 'bold',
                    })
                  )}>
                  Sign-Up
                </Link>
              </View>
            </View>
          </CardFooter>
        </Card>
      </ScrollView>
    </KeyboardSafeView>
  );
};
