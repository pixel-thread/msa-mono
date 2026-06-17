import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useDeclaration } from '../hooks/use-declaration';
import { DeclarationDetail } from '../components/declaration-detail';
import { Container, StackHeader } from '@src/shared/components';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';

interface DeclarationDetailScreenProps {
  id: string;
}

export const DeclarationDetailScreen = ({ id }: DeclarationDetailScreenProps) => {
  const { data: declaration, isLoading, isError, refetch, isRefetching } = useDeclaration(id);

  if (isLoading) {
    return (
      <Container>
        <StackHeader showBackButton title="Declaration" />
        <LoadingScreen message="Loading declaration..." />
      </Container>
    );
  }

  if (!declaration) {
    return (
      <Container>
        <StackHeader showBackButton title="Declaration" />
        <EmptyScreen
          title="No declaration found"
          description="This declaration does not exist. Please try again."
          refresh={() => refetch()}
        />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <StackHeader showBackButton title="Declaration" />
        <ErrorScreen
          title="Failed to load declaration"
          message="There was an error loading this declaration. Please try again."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  return (
    <Container>
      <StackHeader showBackButton title="Declaration" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }>
        <DeclarationDetail declaration={declaration} />
      </ScrollView>
    </Container>
  );
};
