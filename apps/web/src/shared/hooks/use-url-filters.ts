'use client';

import { useCallback, useMemo } from 'react';
import { useLocation,useNavigate } from '@tanstack/react-router';

interface UseUrlFiltersOptions {
  basePath?: string;
  pageKey?: string;
  resetPageOnFilter?: boolean;
  mode?: 'replace' | 'push';
}

interface UseUrlFiltersReturn {
  filters: Record<string, string>;
  page: number;
  setPage: (page: number) => void;
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (filters: Record<string, string | undefined>) => void;
  clearFilter: (key: string) => void;
  resetFilters: () => void;
}

export function useUrlFilters(options: UseUrlFiltersOptions = {}): UseUrlFiltersReturn {
  const { basePath, pageKey = 'page', resetPageOnFilter = true, mode = 'replace' } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const resolvedPath = basePath ?? pathname;

  const doNavigate = useCallback(
    (params: URLSearchParams) => {
      const href = `${resolvedPath}?${params.toString()}`;
      navigate({ to: href, replace: mode === 'replace', resetScroll: false });
    },
    [resolvedPath, navigate, mode],
  );

  const page = useMemo(() => Number(searchParams.get(pageKey)) || 1, [searchParams, pageKey]);

  const filters = useMemo(() => {
    const result: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== pageKey) result[key] = value;
    }
    return result;
  }, [searchParams, pageKey]);

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(pageKey, String(newPage));
      doNavigate(params);
    },
    [searchParams, doNavigate, pageKey],
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (resetPageOnFilter) params.set(pageKey, '1');
      doNavigate(params);
    },
    [searchParams, doNavigate, resetPageOnFilter, pageKey],
  );

  const setFilters = useCallback(
    (newFilters: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(newFilters)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (resetPageOnFilter) params.set(pageKey, '1');
      doNavigate(params);
    },
    [searchParams, doNavigate, resetPageOnFilter, pageKey],
  );

  const clearFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      if (resetPageOnFilter) params.set(pageKey, '1');
      doNavigate(params);
    },
    [searchParams, doNavigate, resetPageOnFilter, pageKey],
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams();
    params.set(pageKey, '1');
    doNavigate(params);
  }, [doNavigate, pageKey]);

  return {
    filters,
    page,
    setPage,
    setFilter,
    setFilters,
    clearFilter,
    resetFilters,
  };
}
