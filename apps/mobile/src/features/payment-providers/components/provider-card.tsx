import React from 'react';
import { View, Switch, TouchableOpacity } from 'react-native';
import { PaymentProvider } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@lib/cn';

interface ProviderCardProps {
  provider: PaymentProvider;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
  isActivating?: boolean;
  isDeleting?: boolean;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onActivate,
  onDelete,
  onPress,
  isActivating,
  isDeleting,
}) => {
  return (
    <View className="mb-4">
      <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
        <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(provider.id)}>
          <CardContent className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="mb-2 flex-row items-center gap-x-2">
                  <View
                    className={cn(
                      'px-2 py-0.5',
                      provider.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'bg-slate-100 dark:bg-slate-800'
                    )}>
                    <Text
                      variant="label"
                      size="xs"
                      className={cn(
                        'font-bold tracking-wider',
                        provider.isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-400'
                      )}>
                      {provider.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                  <View className="bg-indigo-50 px-2 py-0.5 dark:bg-indigo-900/20">
                    <Text
                      variant="label"
                      size="xs"
                      className="font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                      {provider.provider}
                    </Text>
                  </View>
                </View>

                <Text
                  weight={'semibold'}
                  variant="heading"
                  size="sm"
                  className="mb-2 text-slate-900 dark:text-white">
                  Key ID: {provider.keyId}
                </Text>

                <View className="gap-y-1.5">
                  <View className="flex-row items-center gap-x-2">
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text variant="subtext" size="xs">
                      Updated: {new Date(provider.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="items-end justify-between self-stretch">
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => onDelete(provider.id)}
                    disabled={isDeleting}
                    className="h-10 w-10 items-center justify-center bg-red-50 dark:bg-red-900/20">
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                  <View className="h-10 w-10 items-center justify-center bg-slate-50 dark:bg-slate-800">
                    <Switch
                      value={provider.isActive}
                      onValueChange={() => onActivate(provider.id)}
                      disabled={isActivating || provider.isActive}
                      trackColor={{ false: '#cbd5e1', true: '#6ee7b7' }}
                      thumbColor={provider.isActive ? '#16a34a' : '#94a3b8'}
                      style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                    />
                  </View>
                </View>
                <Text size="xs" variant="subtext" className="mt-4">
                  {provider.isActive ? 'Receiving payments' : 'Not accepting payments'}
                </Text>
              </View>
            </View>
          </CardContent>
        </TouchableOpacity>
      </Card>
    </View>
  );
};
