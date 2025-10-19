'use client';

import React, { type ButtonHTMLAttributes, useRef, useState } from 'react';
import { useField } from '@tanstack/react-form';
import { useFormContext } from '../form-context';
import { cn, useOutsideClick } from '@/lib';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01FreeIcons, CheckmarkBadge01FreeIcons } from '@hugeicons/core-free-icons';

type FieldSelectProps<T> = ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
  label: string;
  placeholder?: string;
  dropdownClassName?: string;
  onChangeCallback?: (value: T) => void;
  items: T[];
  extractLabel: (item: T) => string;
  extractValue: (item: T) => string;
};

export function FieldSelect<T>({
  name,
  label,
  placeholder,
  items,
  extractLabel,
  extractValue,
  ...props
}: FieldSelectProps<T>) {
  const form = useFormContext();
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  useOutsideClick(dropdownRef, () => setIsOpen(false));

  const field = useField({
    form,
    name,
  });

  return (
    <div ref={dropdownRef} className="relative flex w-full flex-col">
      <label htmlFor={field.name} className="font-medium mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'bg-background-secondary border-background-secondary text-text dark:text-textdark mt-2 flex w-full items-center justify-between rounded-xl border p-2.5 text-left text-sm font-medium transition-all focus:outline-none',
          props.className,
        )}
      >
        <div className="">
          {extractLabel(
            items.find((item) => extractValue(item) === field.state.value) ?? items[0],
          ) ||
            placeholder ||
            'Select an item'}
        </div>

        <HugeiconsIcon
        width={26}
        height={26}
        className="bg-tertiary/10 w-6.5 rounded-lg p-1"
          icon={ArrowDown01FreeIcons}
        />
      </button>
      <div
        role="listbox"
        className={cn(
          'bg-background absolute z-10 max-h-52 w-full overflow-y-scroll rounded-xl transition-all duration-300',
          isOpen ? 'h-52' : 'h-0 min-h-0',
          label ? 'top-20' : 'top-16',
          props.dropdownClassName,
        )}
      >
        <div className="">
          <ul className={cn('')}>
            {React.Children.toArray(
              items.map((item) => (
                <li
                  role="option"
                  key={extractValue(item)}
                  className="hover:bg-tertiary/10 relative cursor-pointer p-2"
                  onClick={() => {
                    field.state.value = extractValue(item);
                    props.onChangeCallback && props.onChangeCallback(item);
                    setIsOpen(false);
                  }}
                >
                  {extractLabel(item)}
                  {extractValue(item) === field.state.value && (
                    <HugeiconsIcon
                      icon={CheckmarkBadge01FreeIcons}
                      width={16}
                      height={16}
                      className="absolute top-1/2 right-2 w-4 -translate-y-1/2"
                    />
                  )}
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
      {field.state.meta.isTouched ? (
        <em className="text-xs text-red-500">
          {field.state.meta.errors.map((err) => err.message).join(', ')}
        </em>
      ) : null}
    </div>
  );
}
