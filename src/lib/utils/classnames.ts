import { twMerge } from 'tailwind-merge';

export function cn(...classes: (string | undefined | false)[]): string {
  let _className = '';
  for (let i = 0; i < classes.length; i++) {
    _className += classes[i] + ' ';
  }
  return twMerge(_className);
}
