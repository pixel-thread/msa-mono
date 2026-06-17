import React from 'react';
import { Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { addProviderSchema, AddProviderFormValues } from '../validators';
import { useAddProvider } from '../hooks/use-payment-provider-mutations';
import { Container, StackHeader } from '@src/shared/components';
import { logger } from '@src/shared/utils';

export const ProviderAddScreen = () => {
  const router = useRouter();
  const { mutateAsync: addProvider, isPending } = useAddProvider();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddProviderFormValues>({
    resolver: zodResolver(addProviderSchema),
    defaultValues: {
      provider: 'RAZORPAY',
      keyId: '',
      keySecret: '',
      webhookSecret: '',
    },
  });

  const onSubmit = async (data: AddProviderFormValues) => {
    try {
      await addProvider(data);
      toast.success('Provider added successfully');
      router.back();
    } catch (error) {
      logger.error('Failed to add payment provider', { error });
      toast.error('Failed to add provider');
    }
  };

  return (
    <Container className="flex-1 bg-gray-50 p-4">
      <StackHeader title="Providers" showBackButton />
      <Text className="mb-4 text-xl font-bold">Add Payment Provider</Text>

      <Text className="mb-1 font-medium">Provider Type</Text>
      <Controller
        control={control}
        name="provider"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="mb-1 border border-gray-300 bg-white p-3"
            placeholder="RAZORPAY, STRIPE, PAYU, or CASHFREE"
            value={value}
            onChangeText={onChange}
            autoCapitalize="characters"
          />
        )}
      />
      {errors.provider && <Text className="mb-3 text-red-500">{errors.provider.message}</Text>}

      <Text className="mb-1 mt-2 font-medium">Key ID</Text>
      <Controller
        control={control}
        name="keyId"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="mb-1 border border-gray-300 bg-white p-3"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.keyId && <Text className="mb-3 text-red-500">{errors.keyId.message}</Text>}

      <Text className="mb-1 mt-2 font-medium">Key Secret</Text>
      <Controller
        control={control}
        name="keySecret"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="mb-1 border border-gray-300 bg-white p-3"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.keySecret && <Text className="mb-3 text-red-500">{errors.keySecret.message}</Text>}

      <Text className="mb-1 mt-2 font-medium">Webhook Secret (Optional)</Text>
      <Controller
        control={control}
        name="webhookSecret"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="mb-1 border border-gray-300 bg-white p-3"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.webhookSecret && (
        <Text className="mb-3 text-red-500">{errors.webhookSecret.message}</Text>
      )}

      <TouchableOpacity
        className="mt-6 items-center bg-blue-600 p-4"
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}>
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-lg font-bold text-white">Save Provider</Text>
        )}
      </TouchableOpacity>
    </Container>
  );
};
