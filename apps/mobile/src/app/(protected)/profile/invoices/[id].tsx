// src/app/(protected)/profile/invoices/[id].tsx
import React from 'react';
import { StackHeader, Container } from '@src/shared/components';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import { useLocalSearchParams } from 'expo-router';
import { useInvoice } from '@src/features/invoice/hooks/use-invoice';
import { InvoiceDetailView } from '@src/features/invoice/components/invoice-detail-view';
import { RefreshControl, ScrollView } from 'react-native';
import { truncateText } from '@src/shared/utils';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoice, isLoading, isError, refetch, isFetching } = useInvoice(id as string);

  if (isLoading)
    return (
      <>
        <StackHeader title="Invoice Details" showBackButton={true} />
        <LoadingScreen message="Fetching invoice details..." />
      </>
    );

  if (isError)
    return (
      <>
        <StackHeader title="Invoice Details" showBackButton={true} />
        <ErrorScreen
          title="Failed to load invoice"
          message="There was an error retrieving the invoice details. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );

  if (!invoice) return <EmptyScreen title="Invoice not found" refresh={refetch} />;

  return (
    <Container>
      <StackHeader title={truncateText({ text: `#INV-${invoice.id}` })} showBackButton />
      <ScrollView
        refreshControl={<RefreshControl onRefresh={() => refetch()} refreshing={isFetching} />}>
        <InvoiceDetailView invoice={invoice} />
      </ScrollView>
    </Container>
  );
}
