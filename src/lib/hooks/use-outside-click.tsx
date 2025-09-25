'use client';

import { useEffect, RefObject } from 'react';

export const useOutsideClick = (
  ref: RefObject<HTMLInputElement | HTMLDivElement | null>,
  callback: (event: MouseEvent) => void,
) => {
  const listener = (event: MouseEvent) => {
    if (!ref.current || ref.current.contains(event.target as Node)) return;
    callback(event);
  };

  useEffect(() => {
    document.addEventListener('click', listener);

    return () => document.removeEventListener('click', listener);
    // eslint-disable-next-line
  }, []);
};
