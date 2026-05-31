import { View } from 'react-native';
import { Text, TextInput, Button } from '@components/ui';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { UpdateUserInput, UpdateUserSchema } from '../validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateUser } from '../hooks/use-update-user';
import { useRouter } from 'expo-router';
import { cn } from '@lib/cn';
import { useUser } from '@hooks/useUser';

export const EditProfileForm = () => {
  const { data: user, isFetching } = useUser();
  const router = useRouter();
  const { mutate, isPending } = useUpdateUser();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      name: user?.name || '',
      mobile: user?.mobile || '',
      designation: user?.designation || '',
      dateOfJoiningGovt: user?.dateOfJoiningGovt || new Date(),
      dateOfJoiningMfsa: user?.dateOfJoiningMfsa || new Date(),
    },
  });

  const onSubmit: SubmitHandler<UpdateUserInput> = async (data) => {
    mutate(data);
    router.back();
  };

  return (
    <>
      <View className="mb-4">
        <Text className="mb-2 font-medium text-slate-700">Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={cn(
                'h-12  border bg-white px-4 ',
                errors.name ? 'border-red-500' : 'border-slate-200'
              )}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your name"
            />
          )}
        />
        {errors.name && <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 font-medium text-slate-700">Mobile</Text>
        <Controller
          control={control}
          name="mobile"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={cn(
                'h-12  border bg-white px-4 ',
                errors.mobile ? 'border-red-500' : 'border-slate-200'
              )}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.mobile && (
          <Text className="mt-1 text-xs text-red-500">{errors.mobile.message}</Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 font-medium text-slate-700">Date of Joining Govt. (YYYY-MM-DD)</Text>
        <Controller
          control={control}
          name="dateOfJoiningGovt"
          render={({ field: { onChange, onBlur, value } }) => {
            const dateValue =
              typeof value === 'string'
                ? value
                : value instanceof Date && !isNaN(value.getTime())
                  ? value.toISOString().split('T')[0]
                  : '';
            return (
              <TextInput
                className={cn(
                  'h-12 border bg-white px-4 ',
                  errors.dateOfJoiningGovt ? 'border-red-500' : 'border-slate-200'
                )}
                onBlur={onBlur}
                onChangeText={onChange}
                value={dateValue}
                placeholder="YYYY-MM-DD"
              />
            );
          }}
        />
        {errors.dateOfJoiningGovt && (
          <Text className="mt-1 text-xs text-red-500">{errors.dateOfJoiningGovt.message}</Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="mb-2 font-medium text-slate-700">Date of Joining MFSA (YYYY-MM-DD)</Text>
        <Controller
          control={control}
          name="dateOfJoiningMfsa"
          render={({ field: { onChange, onBlur, value } }) => {
            const dateValue =
              typeof value === 'string'
                ? value
                : value instanceof Date && !isNaN(value.getTime())
                  ? value.toISOString().split('T')[0]
                  : '';
            return (
              <TextInput
                className={cn(
                  'h-12 border bg-white px-4 ',
                  errors.dateOfJoiningMfsa ? 'border-red-500' : 'border-slate-200'
                )}
                onBlur={onBlur}
                onChangeText={onChange}
                value={dateValue}
                placeholder="YYYY-MM-DD"
              />
            );
          }}
        />
        {errors.dateOfJoiningMfsa && (
          <Text className="mt-1 text-xs text-red-500">{errors.dateOfJoiningMfsa.message}</Text>
        )}
      </View>

      <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting || isPending || isFetching}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </>
  );
};
