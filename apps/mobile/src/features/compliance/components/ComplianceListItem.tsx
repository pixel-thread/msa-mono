import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@src/shared/components/ui/text';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Compliance } from '../types/compliance.types';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { formatDate } from '@src/shared/utils/format';

interface Props {
  compliance: Compliance;
  onPress?: (compliance: Compliance) => void;
}

export const ComplianceListItem = ({ compliance, onPress }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(compliance)} className="mb-4">
      <Card>
        <CardContent className="p-4">
          <View className="mb-2 flex-row items-start justify-between">
            <View className="mr-2 flex-1">
              <Text
                variant="subtext"
                size="xs"
                className="mb-1 font-bold uppercase tracking-widest text-slate-400">
                {compliance.ticketNumber}
              </Text>
              <Text weight="bold" size="lg" className="text-slate-900">
                {compliance.subject}
              </Text>
            </View>
            <ComplianceStatusBadge status={compliance.status} />
          </View>

          <View className="mb-3">
            <Text variant="subtext" size="sm" className="text-slate-600" numberOfLines={2}>
              {compliance.description}
            </Text>
          </View>

          <View className="flex-row items-center justify-between border-t border-slate-100 pt-3">
            <Text variant="subtext" size="xs" className="text-slate-400">
              {compliance?.category?.replace(/_/g, ' ')} · {compliance.priority}
            </Text>
            <Text variant="subtext" size="xs" className="text-slate-400">
              {formatDate(compliance.createdAt)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};
