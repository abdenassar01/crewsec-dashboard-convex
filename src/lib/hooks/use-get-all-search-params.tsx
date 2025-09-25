'use client';

import { useSearchParams } from 'next/navigation';

export function useGetAllSearchParams<T>(): T {
  const searchParams = useSearchParams();
  const params: { [anyProp: string]: string } = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params as T;
}
