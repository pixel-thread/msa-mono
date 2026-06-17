import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDeclaration } from '../hooks';
import { Container, StackHeader } from '@src/shared/components';
import { Text, Button, FieldInput } from '@src/shared/components/ui';

const createDeclarationSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
});

type CreateDeclarationForm = z.infer<typeof createDeclarationSchema>;

export const CreateDeclarationScreen = () => {
  const router = useRouter();
  const { mutate, isPending } = useCreateDeclaration();

  const methods = useForm<CreateDeclarationForm>({
    resolver: zodResolver(createDeclarationSchema),
  });

  const onSubmit = (data: CreateDeclarationForm) => {
    mutate(
      { amount: Number(data.amount) },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <Container>
      <StackHeader title="New Declaration" showBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 p-4">
          <View className="mb-8">
            <Text
              variant="heading"
              size="2xl"
              weight="bold"
              className="mb-1 text-slate-900 dark:text-white">
              New Declaration
            </Text>
            <Text variant="subtext" size="sm">
              Submit a declaration for the current period.
            </Text>
          </View>

          <FormProvider {...methods}>
            <View className="mb-6">
              <FieldInput
                name="amount"
                label="Amount (₹)"
                placeholder="Enter declaration amount"
                keyboardType="numeric"
              />
            </View>

            <Button
              onPress={methods.handleSubmit(onSubmit)}
              disabled={isPending}
              loading={isPending}
              className="w-full">
              Submit Declaration
            </Button>
          </FormProvider>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};
