import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { formattedDate } from '@src/shared/utils/format';
import { DeclarationStatusBadge } from './declaration-status-badge';
import type { Declaration } from '../types';

interface DeclarationCardProps {
  declaration: Declaration;
}

export const DeclarationCard = ({ declaration }: DeclarationCardProps) => {
  const startDate = new Date(declaration.declerationStartDate);
  const endDate = new Date(declaration.declerationEndDate);

  return (
    <View className="mb-4">
      <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="mb-2 flex-row items-center gap-x-2">
                <DeclarationStatusBadge status={declaration.status} />
                <Text size="xs" variant="subtext">
                  {formattedDate(startDate)} - {formattedDate(endDate)}
                </Text>
              </View>

              <Text
                weight="semibold"
                variant="heading"
                size="xl"
                className="mb-2 text-slate-900 dark:text-white">
                ₹{declaration.amount}
              </Text>

              <View className="flex-row items-center gap-x-1">
                <Ionicons name="person-outline" size={12} color="#64748b" />
                <Text variant="subtext" size="sm" className="text-slate-600 dark:text-slate-400">
                  {declaration.member.name}
                </Text>
              </View>

              {declaration.remark && (
                <View className="mt-2 rounded bg-slate-50 p-2 dark:bg-slate-900">
                  <Text variant="subtext" size="xs" className="text-slate-500">
                    {declaration.remark}
                  </Text>
                </View>
              )}
            </View>

            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </View>
        </CardContent>
      </Card>
    </View>
  );
};
