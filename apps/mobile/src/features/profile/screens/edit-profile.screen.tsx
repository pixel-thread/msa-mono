import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, StackHeader } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';
import { EditProfileForm } from '../components/edit-profile-form';
import { useUser } from '@src/shared/hooks/useUser';

export const EditProfileScreen = () => {
  const { data: user } = useUser();
  if (!user) return <StackHeader title="Edit Profile" showBackButton />;

  return (
    <Container>
      <StackHeader title="Edit Profile" showBackButton={true} />
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8 items-center">
          <View className="relative">
            <View className="h-28 w-28 items-center justify-center bg-indigo-600 shadow-xl">
              <Text weight="bold" className="text-4xl text-white">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center border-4 border-white bg-slate-100">
              <Ionicons name="camera" size={16} color="#475569" />
            </TouchableOpacity>
          </View>
          <Text className="mt-2 text-slate-500">Tap to change avatar</Text>
        </View>
        <EditProfileForm />
      </ScrollView>
    </Container>
  );
};
