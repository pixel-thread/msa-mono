import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { Invoice } from '../types/invoice.types';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@lib/cn';

const STATUS_CONFIG = {
  PAID: {
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  PENDING: {
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  FAILED: {
    bgClass: 'bg-rose-50 dark:bg-rose-900/20',
    textClass: 'text-rose-700 dark:text-rose-400',
  },
};

export const InvoiceListItem = ({ invoice }: { invoice: Invoice }) => {
  const router = useRouter();
  const status = invoice.status || 'PENDING';
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

  const formattedDate = new Date(invoice.paymentDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View className="mb-4">
      <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/(protected)/profile/invoices/${invoice.id}`)}>
          <CardContent className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 gap-y-2">
                <Text
                  weight={'semibold'}
                  variant="heading"
                  size="sm"
                  className="mb-2 text-slate-900 dark:text-white">
                  #INV-{invoice.id.substring(0, 8).toUpperCase()}
                </Text>

                <View className="gap-y-1.5">
                  <View className="flex-row items-center gap-x-2">
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text variant="subtext" size="xs">
                      {formattedDate}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-start gap-x-2">
                  <View className={cn('px-2 py-0.5', config.bgClass)}>
                    <Text size="xs" weight="medium" className={cn('text-[10px]', config.textClass)}>
                      {status}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="items-end justify-between self-stretch">
                <View className="h-10 w-10 items-center justify-center bg-slate-50 dark:bg-slate-800">
                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </View>
                <View className="mt-4 items-end">
                  <Text
                    weight="semibold"
                    size="sm"
                    className="font-sans-bold text-slate-900 dark:text-slate-100">
                    {invoice.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text
                    variant="subtext"
                    size="xs"
                    className="uppercase tracking-widest opacity-60">
                    {invoice.currency}
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </TouchableOpacity>
      </Card>
    </View>
  );
};
