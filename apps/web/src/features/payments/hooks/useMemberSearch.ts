'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { paymentEndpoints } from '../utils/constants/endpoints';

interface MemberSearchResult {
  id: string;
  name: string;
  email: string;
  membershipNumber: string | null;
}

export function useMemberSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.MEMBER_SEARCH(debouncedQuery),
    queryFn: () => http.get<MemberSearchResult[]>(paymentEndpoints.memberSearch(debouncedQuery)),
    enabled: debouncedQuery.length >= 2,
  });

  return {
    results: data?.data ?? [],
    isLoading: isLoading && debouncedQuery.length >= 2,
  };
}
