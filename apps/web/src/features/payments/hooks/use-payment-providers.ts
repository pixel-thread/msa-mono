'use client';

import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ProviderResponse } from '../types';

export function usePaymentProviders() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS(),
    queryFn: () => http.get<ProviderResponse[]>(ENDPOINTS.PAYMENTS.PROVIDERS.LIST),
  });

  return {
    providers: data?.data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useProviderDetail(providerId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDER(providerId),
    queryFn: () => http.get<ProviderResponse>(ENDPOINTS.PAYMENTS.PROVIDERS.DETAIL(providerId!)),
    enabled: !!providerId,
  });

  return {
    provider: data?.data ?? null,
    isLoading,
    error,
    refetch,
  };
}

export function useCreateProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      provider: string;
      keyId: string;
      keySecret: string;
      webhookSecret?: string;
      isActive?: boolean;
    }) => http.post(ENDPOINTS.PAYMENTS.PROVIDERS.LIST, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
    },
  });
}

export function useUpdateProvider(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      keyId?: string;
      keySecret?: string;
      webhookSecret?: string;
      isActive?: boolean;
    }) => http.patch(ENDPOINTS.PAYMENTS.PROVIDERS.DETAIL(providerId), input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDER(providerId),
      });
    },
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) =>
      http.delete(ENDPOINTS.PAYMENTS.PROVIDERS.DETAIL(providerId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
    },
  });
}
