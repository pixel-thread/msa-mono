import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '@src/shared/components/common/Container';
import { StackHeader } from '@src/shared/components/common/header/stack-header.component';
import { Button } from '@src/shared/components/ui/button';
import { Text } from '@src/shared/components/ui/text';
import { Input } from '@src/shared/components/ui/input';
import {
  complianceSubmitSchema,
  ComplianceSubmitFormData,
} from '../validators/compliance.validator';
import { useSubmitCompliance } from '../hooks/use-compliance-mutations';
import { COMPLIANCE_CATEGORIES, COMPLIANCE_PRIORITIES } from '../constants';
import { cn } from '@src/shared/lib/cn';

export const MemberSubmitComplianceScreen = () => {
  const router = useRouter();
  const { mutate, isPending } = useSubmitCompliance();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplianceSubmitFormData>({
    resolver: zodResolver(complianceSubmitSchema),
    defaultValues: {
      category: 'OTHER',
      subject: '',
      description: '',
      priority: 'MEDIUM',
    },
  });

  const selectedCategory = watch('category');
  const selectedPriority = watch('priority');

  const onSubmit = (data: ComplianceSubmitFormData) => {
    mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <Container>
      <StackHeader title="Submit Compliance" showBackButton />
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="heading" size="2xl" weight="bold" className="mb-2">
          Submit a Compliance
        </Text>
        <Text className="mb-6 text-slate-500">
          Describe your issue and we&apos;ll look into it as soon as possible.
        </Text>

        <View className="mb-6">
          <Text weight="medium" className="mb-3 text-slate-700">
            Category
          </Text>
          <View className="flex-row flex-wrap">
            {COMPLIANCE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setValue('category', cat.value)}
                className={cn(
                  'mb-2 mr-2 flex-row items-center border px-4 py-2',
                  selectedCategory === cat.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 bg-white'
                )}>
                {selectedCategory === cat.value && (
                  <Ionicons name="checkmark-circle" size={16} color="#4F46E5" className="mr-1" />
                )}
                <Text
                  size="sm"
                  className={cn(
                    selectedCategory === cat.value ? 'text-indigo-600' : 'text-slate-600'
                  )}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.category && (
            <Text variant="error" size="xs" className="mt-1">
              {errors.category.message}
            </Text>
          )}
        </View>

        <View className="mb-6">
          <Text weight="medium" className="mb-3 text-slate-700">
            Priority
          </Text>
          <View className="flex-row flex-wrap">
            {COMPLIANCE_PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                onPress={() => setValue('priority', p.value)}
                className={cn(
                  'mb-2 mr-2 flex-row items-center border px-4 py-2',
                  selectedPriority === p.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 bg-white'
                )}>
                {selectedPriority === p.value && (
                  <Ionicons name="checkmark-circle" size={16} color="#4F46E5" className="mr-1" />
                )}
                <Text
                  size="sm"
                  className={cn(
                    selectedPriority === p.value ? 'text-indigo-600' : 'text-slate-600'
                  )}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.priority && (
            <Text variant="error" size="xs" className="mt-1">
              {errors.priority.message}
            </Text>
          )}
        </View>

        <View className="mb-6">
          <Text weight="medium" className="mb-2 text-slate-700">
            Subject
          </Text>
          <Controller
            control={control}
            name="subject"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Brief summary of your compliance"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.subject && (
            <Text variant="error" size="xs" className="mt-1">
              {errors.subject.message}
            </Text>
          )}
        </View>

        <View className="mb-8">
          <Text weight="medium" className="mb-2 text-slate-700">
            Description
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Provide detailed information about your compliance..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="min-h-[120px] pt-4"
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

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className="mt-2">
          {isPending ? 'Submitting...' : 'Submit Compliance'}
        </Button>
      </ScrollView>
    </Container>
  );
};
