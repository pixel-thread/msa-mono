import React from 'react';
import { RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { StackHeader, Container } from '@src/shared/components';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import { useInvoices } from '@src/features/invoice/hooks/use-invoices';
import { InvoiceListItem } from '@src/features/invoice/components/invoice-list-item';

export const InvoicesScreen = () => {
  const { data: invoices = [], isLoading, isError, refetch, isRefetching } = useInvoices();

  if (isLoading) {
    return (
      <>
        <StackHeader title="Invoices" showBackButton={true} />
        <LoadingScreen message="Fetching invoices..." />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader title="Invoices" showBackButton={true} />
        <ErrorScreen
          title="Failed to load invoices"
          message="There was an error retrieving your invoices. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <Container>
      <StackHeader title="Invoices" showBackButton={true} />
      <FlashList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InvoiceListItem invoice={item} />}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <EmptyScreen
            icon="document-text-outline"
            title="No Invoices"
            description="You don't have any payment invoices yet."
            refresh={refetch}
          />
        }
      />
    </Container>
  );
};
