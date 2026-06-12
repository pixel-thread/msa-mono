import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from '@src/shared/components/ui';
import { Invoice } from '../types/invoice.types';
import { generateAndShareInvoicePdf } from '../utils/pdf';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@lib/cn';

const STATUS_CONFIG = {
  PAID: {
    bgClass: 'bg-emerald-500/10 border border-emerald-500/20 dark:bg-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  PENDING: {
    bgClass: 'bg-amber-500/10 border border-amber-500/20 dark:bg-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  FAILED: {
    bgClass: 'bg-destructive/10 border border-destructive/20 dark:bg-destructive/20',
    textClass: 'text-destructive',
  },
};

export const InvoiceDetailView = ({ invoice }: { invoice: Invoice }) => {
  const status = invoice.status || 'PENDING';
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

  const formattedDate = new Date(invoice.paymentDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSharePdf = async () => {
    await generateAndShareInvoicePdf(invoice);
  };

  return (
    <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
      {/* Invoice Card */}
      <View className="mb-6 rounded-none border border-border bg-card p-6 shadow-sm">
        {/* Header Block */}
        <View className="flex-row items-start justify-between border-b border-border pb-6">
          <View className="gap-y-1">
            <Text variant="label" className="uppercase tracking-widest text-slate-400" size="xs">
              Invoice
            </Text>
            <Text weight="bold" size="xl" className="text-slate-900 dark:text-slate-100">
              #INV-{invoice.id.substring(0, 8).toUpperCase()}
            </Text>
            <Text variant="subtext" size="xs" className="opacity-60">
              ID: {invoice.id}
            </Text>
          </View>

          <View className={cn('rounded-none px-3 py-1', config.bgClass)}>
            <Text
              weight="medium"
              size="xs"
              className={cn('uppercase tracking-wider', config.textClass)}>
              {status}
            </Text>
          </View>
        </View>

        {/* Billing & Details Split */}
        <View className="flex-row flex-wrap justify-between gap-y-6 py-6">
          <View className="w-[48%] min-w-[140px] gap-y-2">
            <Text variant="label" className="uppercase tracking-widest text-slate-400" size="xs">
              Billed To
            </Text>
            <View>
              <Text weight="semibold" className="text-slate-900 dark:text-slate-100" size="sm">
                {invoice.user?.name}
              </Text>
              <Text size="xs" className="mt-0.5 text-slate-500">
                {invoice.user?.email}
              </Text>
              {invoice.user?.designation && (
                <Text
                  size="xs"
                  className="mt-0.5 font-sans-medium uppercase tracking-wider text-slate-400">
                  {invoice.user?.designation}
                </Text>
              )}
              {invoice.user?.membershipNumber && (
                <Text
                  size="xs"
                  className="mt-0.5 font-sans-medium uppercase tracking-wider text-slate-400">
                  Member: {invoice.user?.membershipNumber}
                </Text>
              )}
            </View>
          </View>

          <View className="w-[48%] min-w-[140px] gap-y-2">
            <Text variant="label" className="uppercase tracking-widest text-slate-400" size="xs">
              Issued Date
            </Text>
            <View className="flex-row items-center gap-x-1.5">
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text weight="medium" size="sm" className="text-slate-900 dark:text-slate-100">
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Allocations Table */}
        <View className="border-t border-border pt-4">
          <View className="mb-2 flex-row justify-between">
            <Text variant="label" className="uppercase tracking-widest text-slate-400" size="xs">
              Allocation Period
            </Text>
            <Text
              variant="label"
              className="text-right uppercase tracking-widest text-slate-400"
              size="xs">
              Amount
            </Text>
          </View>

          {invoice.allocations && invoice.allocations.length > 0 ? (
            invoice.allocations.map((alloc, idx) => (
              <View key={idx} className="flex-row justify-between border-b border-border/40 py-2.5">
                <Text className="size-sm font-sans-medium text-slate-600 dark:text-slate-400">
                  Contribution Period {alloc.contributionPeriod?.month}/
                  {alloc.contributionPeriod?.year}
                </Text>
                <Text weight="semibold" className="size-sm text-slate-900 dark:text-slate-100">
                  {alloc.allocatedAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {invoice.currency}
                </Text>
              </View>
            ))
          ) : (
            <View className="border-b border-border/40 py-4">
              <Text variant="subtext" size="xs" className="italic">
                No subscription contribution periods allocated.
              </Text>
            </View>
          )}

          {/* Grand Total */}
          <View className="mt-6 flex-row items-center justify-between pt-4">
            <Text
              weight="bold"
              size="sm"
              className="uppercase tracking-widest text-slate-900 dark:text-slate-100">
              Total Amount
            </Text>
            <Text weight="bold" size="lg" className="font-sans-bold text-primary">
              {invoice.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {invoice.currency}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <Button
        variant="default"
        className="mb-12 h-14 w-full flex-row items-center justify-center gap-x-2 rounded-none shadow-none"
        onPress={handleSharePdf}>
        <Ionicons name="share-social-outline" size={18} color="#ffffff" />
        <Text weight="bold" className="text-sm uppercase tracking-widest text-white">
          Share PDF
        </Text>
      </Button>
    </ScrollView>
  );
};
