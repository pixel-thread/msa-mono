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
      <View className="mb-6 border border-border bg-card p-6 shadow-sm rounded-none">
        {/* Header Block */}
        <View className="flex-row items-start justify-between pb-6 border-b border-border">
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

          <View className={cn("px-3 py-1 rounded-none", config.bgClass)}>
            <Text weight="medium" size="xs" className={cn("uppercase tracking-wider", config.textClass)}>
              {status}
            </Text>
          </View>
        </View>
        
        {/* Billing & Details Split */}
        <View className="py-6 flex-row flex-wrap gap-y-6 justify-between">
          <View className="w-[48%] min-w-[140px] gap-y-2">
            <Text variant="label" className="uppercase tracking-widest text-slate-400" size="xs">
              Billed To
            </Text>
            <View>
              <Text weight="semibold" className="text-slate-900 dark:text-slate-100" size="sm">
                {invoice.user?.name}
              </Text>
              <Text size="xs" className="text-slate-500 mt-0.5">
                {invoice.user?.email}
              </Text>
              {invoice.user?.designation && (
                <Text size="xs" className="text-slate-400 mt-0.5 font-sans-medium uppercase tracking-wider">
                  {invoice.user?.designation}
                </Text>
              )}
              {invoice.user?.membershipNumber && (
                <Text size="xs" className="text-slate-400 mt-0.5 font-sans-medium uppercase tracking-wider">
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
        <View className="pt-4 border-t border-border">
          <View className="flex-row justify-between mb-2">
            <Text variant="label" className="uppercase tracking-widest text-slate-400" size="xs">
              Allocation Period
            </Text>
            <Text variant="label" className="uppercase tracking-widest text-slate-400 text-right" size="xs">
              Amount
            </Text>
          </View>

          {invoice.allocations && invoice.allocations.length > 0 ? (
            invoice.allocations.map((alloc, idx) => (
              <View key={idx} className="flex-row justify-between py-2.5 border-b border-border/40">
                <Text className="text-slate-600 dark:text-slate-400 size-sm font-sans-medium">
                  Contribution Period {alloc.contributionPeriod?.month}/{alloc.contributionPeriod?.year}
                </Text>
                <Text weight="semibold" className="text-slate-900 dark:text-slate-100 size-sm">
                  {alloc.allocatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {invoice.currency}
                </Text>
              </View>
            ))
          ) : (
            <View className="py-4 border-b border-border/40">
              <Text variant="subtext" size="xs" className="italic">
                No subscription contribution periods allocated.
              </Text>
            </View>
          )}

          {/* Grand Total */}
          <View className="mt-6 pt-4 flex-row justify-between items-center">
            <Text weight="bold" size="sm" className="text-slate-900 dark:text-slate-100 uppercase tracking-widest">
              Total Amount
            </Text>
            <Text weight="bold" size="lg" className="text-primary font-sans-bold">
              {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {invoice.currency}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <Button
        variant="default"
        className="mb-12 h-14 w-full rounded-none shadow-none flex-row items-center justify-center gap-x-2"
        onPress={handleSharePdf}
      >
        <Ionicons name="share-social-outline" size={18} color="#ffffff" />
        <Text weight="bold" className="text-white uppercase tracking-widest text-sm">
          Share PDF
        </Text>
      </Button>
    </ScrollView>
  );
};

