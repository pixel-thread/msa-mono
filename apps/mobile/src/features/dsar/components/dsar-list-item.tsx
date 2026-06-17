import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@src/shared/components/ui/text';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { DSARRequest } from '../types/dsar.types';
import { DSARStatusBadge } from './dsar-status-badge';
import { formatDate } from '@src/shared/utils/format';

interface Props {
  request: DSARRequest;
  onPress?: (request: DSARRequest) => void;
}

export const DSARListItem = ({ request, onPress }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(request)} className="mb-4">
      <Card>
        <CardContent className="p-4">
          <View className="mb-2 flex-row items-start justify-between">
            <View className="mr-2 flex-1">
              <Text variant="subtext" size="xs" className="mb-1 font-bold uppercase text-slate-400">
                {request.ticketNumber}
              </Text>
              <Text weight="bold" size="lg" className="text-slate-900">
                {request.requestType.charAt(0) + request.requestType.slice(1).toLowerCase()} Request
              </Text>
            </View>
            <DSARStatusBadge status={request.status} />
          </View>

          <View className="mb-3">
            <Text variant="subtext" size="sm" className="text-slate-600" numberOfLines={1}>
              {request.requestedData.map((d) => d.replace('_', ' ')).join(', ')}
            </Text>
          </View>

          <View className="flex-row items-center justify-between border-t border-slate-100 pt-3">
            <Text variant="subtext" size="xs" className="text-slate-400">
              Requested on {formatDate(request.createdAt)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};
