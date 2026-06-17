import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '@src/shared/components/common/container';
import { StackHeader } from '@src/shared/components/common/header/stack-header.component';
import { Button } from '@src/shared/components/ui/button';
import { Text } from '@src/shared/components/ui/text';
import { Input } from '@src/shared/components/ui/input';
import { dsarSubmitSchema, DSARSubmitFormData } from '../validators/dsar.validator';
import { useSubmitDSAR } from '../hooks/use-dsar-mutations';
import { DATA_CATEGORIES, REQUEST_TYPES } from '../constants';
import { cn } from '@src/shared/lib/cn';

export const MemberSubmitDSARScreen = () => {
  const router = useRouter();
  const { mutate, isPending } = useSubmitDSAR();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DSARSubmitFormData>({
    resolver: zodResolver(dsarSubmitSchema),
    defaultValues: {
      requestType: 'ACCESS',
      requestedData: [],
      description: '',
    },
  });

  const selectedRequestType = watch('requestType');
  const selectedDataCategories = watch('requestedData');

  const onSubmit = (data: DSARSubmitFormData) => {
    mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  const toggleDataCategory = (value: string) => {
    const current = [...selectedDataCategories];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    setValue('requestedData', current, { shouldValidate: true });
  };

  return (
    <Container>
      <StackHeader title="New Privacy Request" showBackButton={true} />
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="heading" size={'2xl'} weight="bold" className="mb-2">
          Submit DSAR
        </Text>
        <Text className="mb-6 text-slate-500">
          Request access to your data, corrections, or deletion of your information.
        </Text>

        {/* Request Type */}
        <View className="mb-6">
          <Text weight="medium" className="mb-3 text-slate-700">
            Request Type
          </Text>
          <View className="flex-row flex-wrap">
            {REQUEST_TYPES.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => setValue('requestType', type.value)}
                className={cn(
                  'mb-2 mr-2 flex-row items-center border px-4 py-2',
                  selectedRequestType === type.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 bg-white'
                )}>
                {selectedRequestType === type.value && (
                  <Ionicons name="checkmark-circle" size={16} color="#4F46E5" className="mr-1" />
                )}
                <Text
                  size="sm"
                  className={cn(
                    selectedRequestType === type.value ? 'text-indigo-600' : 'text-slate-600'
                  )}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.requestType && (
            <Text variant="error" size="xs" className="mt-1">
              {errors.requestType.message}
            </Text>
          )}
        </View>

        {/* Data Categories */}
        <View className="mb-6">
          <Text weight="medium" className="mb-3 text-slate-700">
            Information Requested
          </Text>
          <View className="gap-y-2">
            {DATA_CATEGORIES.map((category) => {
              const isSelected = selectedDataCategories.includes(category.value);
              return (
                <Pressable
                  key={category.value}
                  onPress={() => toggleDataCategory(category.value)}
                  className={cn(
                    'flex-row items-center justify-between border p-4',
                    isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
                  )}>
                  <Text className={isSelected ? 'text-indigo-900' : 'text-slate-700'}>
                    {category.label}
                  </Text>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? '#4F46E5' : '#94A3B8'}
                  />
                </Pressable>
              );
            })}
          </View>
          {errors.requestedData && (
            <Text variant="error" size="xs" className="mt-1">
              {errors.requestedData.message}
            </Text>
          )}
        </View>

        {/* Description */}
        <View className="mb-8">
          <Text weight="medium" className="mb-2 text-slate-700">
            Additional Details (Optional)
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Provide any additional context for your request..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="min-h-[100px] pt-4"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.description && (
            <Text variant="error" size="xs" className="mt-1">
              {errors.description.message}
            </Text>
          )}
        </View>

        <Button onPress={handleSubmit(onSubmit)} disabled={isPending} className="mt-2">
          {isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </ScrollView>
    </Container>
  );
};
