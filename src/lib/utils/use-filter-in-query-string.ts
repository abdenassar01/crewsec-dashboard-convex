'use client';

import { usePathname, useRouter } from 'next/navigation';
import { buildQueryString } from './build-query-string';
import { useGetAllSearchParams } from '../hooks';
import { FilterState } from '@/components';

export function useFilterInQueryString() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useGetAllSearchParams<FilterState>();

  const handleFilter = (params: Record<string, string>) => {
    router.push(`${pathname}?${buildQueryString({ ...searchParams, ...params })}`);
  };

  return handleFilter;
}
