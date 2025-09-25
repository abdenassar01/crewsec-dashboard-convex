'use client';

import React, { type InputHTMLAttributes, useState } from 'react';
import { useField } from '@tanstack/react-form';
import { useFormContext } from '../form-context';
import Image from 'next/image';
import { cn } from '@/lib';
import { HugeiconsIcon } from '@hugeicons/react';
import { EyeFreeIcons, ViewOffSlashIcon } from '@hugeicons/core-free-icons';

type FieldInputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  password?: boolean;
  className?: string;
  onChangeCallback?: (text: string) => void;
};

export function FieldInput({
  name,
  label,
  password,
  className,
  onChangeCallback,
  ...props
}: FieldInputProps) {
  const form = useFormContext();

  const field = useField({
    form,
    name,
  });

  const [isPassword, setIsPassword] = useState(password);

  return (
    <div className="flex w-full flex-col">
      <label htmlFor={field.name} className="text-text dark:text-textdark mb-1 font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          className={cn(
            '!text-xxs bg-background-secondary border-background-secondary focus:not-last:border-tertiary text-text dark:text-textdark mt-0 w-full rounded-xl border p-[11px] text-base font-medium transition-all focus:outline-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className,
          )}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.value);
            onChangeCallback && onChangeCallback(e.target.value);
          }}
          type={isPassword ? 'password' : 'text'}
          {...props}
        />
        {password && (
          <button
            onClick={() => setIsPassword(!isPassword)}
            className="absolute top-[40%] right-4 text-gray-500"
          >
            <HugeiconsIcon
              width={16}
              height={16}
              className="w-4"
              icon={
                isPassword
                  ? EyeFreeIcons
                  : ViewOffSlashIcon
              }
            />
          </button>
        )}
      </div>

      {field.state.meta.isTouched ? (
        <em className="text-xs text-red-500">
          {field.state.meta.errors.map((err) => err.message).join(', ')}
        </em>
      ) : null}
    </div>
  );
}
