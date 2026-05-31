import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { SignUpSchema, type SignUpFormData } from '../validators';
import { useSignUp } from '../hooks';
import {
  Button,
  Text,
  FieldInput,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@src/shared/components/ui';
import { useRateLimit } from '@src/shared/hooks/use-rate-limiting';
import { useAuthStore } from '../store';
import { StackHeader } from '@src/shared/components';

export const SignUpScreen = () => {
  const { isAuthenticated } = useAuthStore();
  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    mode: 'onBlur',
    defaultValues: { associationSlug: process.env.EXPO_PUBLIC_ASSOCIATION_SLUG },
  });
  const { mutate: signUp, isPending, error } = useSignUp();
  const { isLimited, executeWithLimit } = useRateLimit('SIGN_UP_BUTTON', {
    limit: 1,
    windowMs: 30000,
  });
  const onSubmit = (data: SignUpFormData) => executeWithLimit(() => signUp(data));

  if (isAuthenticated) {
    return <Redirect href={'/'} />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StackHeader title="Membership Application" showBackButton />
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="mb-12 items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center bg-primary">
            <Ionicons name="shield-checkmark" size={40} color="#fff" />
          </View>
          <Text variant="heading" size="3xl">
            Membership Application
          </Text>
          <Text variant="subtext" size="sm" className="mt-2 text-center">
            Fill out the form below to apply for membership.
          </Text>
        </View>

        <Card>
          <CardHeader className="gap-y-2">
            <CardTitle className="leader-3 text-2xl">Membership Application</CardTitle>
            <CardDescription>Fill out the form below to apply for membership.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <FormProvider {...methods}>
              <View className="gap-y-2">
                <View className="flex-row gap-x-2">
                  <FieldInput
                    className="w-1/2"
                    name="firstName"
                    label="First Name"
                    placeholder="John"
                  />
                  <FieldInput
                    className="w-1/2"
                    name="lastName"
                    label="Last Name"
                    placeholder="Doe"
                  />
                </View>
                <FieldInput
                  name="email"
                  label="Official Email"
                  placeholder="name@institution.gov"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <FieldInput
                  name="phone"
                  label="Phone"
                  placeholder="+1 (555) 000-0000"
                  keyboardType="phone-pad"
                />
                <View className="flex-row gap-x-2">
                  <FieldInput
                    className="flex-[1.5]"
                    name="dobDay"
                    label="Day"
                    placeholder="DD"
                    keyboardType="number-pad"
                  />
                  <FieldInput
                    className="flex-[1.5]"
                    name="dobMonth"
                    label="Month"
                    placeholder="MM"
                    keyboardType="number-pad"
                  />
                  <FieldInput
                    className="flex-[3]"
                    name="dobYear"
                    label="Year"
                    placeholder="YYYY"
                    keyboardType="number-pad"
                  />
                </View>
                <FieldInput name="age" label="Age" placeholder="1" />
                <FieldInput multiline name="address" label="Address" />

                <View className="flex-row gap-x-2">
                  <FieldInput className="w-1/2" name="city" label="City" placeholder="Shillong" />
                  <FieldInput
                    className="w-1/2"
                    name="state"
                    label="State"
                    placeholder="Meghalaya"
                  />
                </View>
                <View className="flex-row gap-x-2">
                  <FieldInput className="w-1/2" name="country" label="Country" placeholder="IN" />
                  <FieldInput
                    className="w-1/2"
                    name="postalCode"
                    label="Postal-code"
                    placeholder="793120"
                  />
                </View>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Registration Failed</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onPress={methods.handleSubmit(onSubmit)}
                  disabled={isPending || isLimited}
                  loading={isPending || isLimited}
                  variant={'default'}
                  className="mt-4 h-14 uppercase">
                  {isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </View>
            </FormProvider>
          </CardContent>
        </Card>

        <View className="mt-8 flex-row items-center justify-center gap-x-2">
          <Text variant="subtext" size="sm">
            Already registered?
          </Text>
          <Link href="/(auth)/sign-in">
            <Text variant="link" size="sm" weight="bold">
              Sign In
            </Text>
          </Link>
        </View>

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
