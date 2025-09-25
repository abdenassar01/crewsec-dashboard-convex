'use client';

import React, { TextareaHTMLAttributes } from 'react';
import { useField } from '@tanstack/react-form';
import { useFormContext } from '../form-context';
import { cn } from '@/lib';

type FieldTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
  label: string;
};

export function FieldTextarea({ name, label, ...props }: FieldTextareaProps) {
  const form = useFormContext();

  const field = useField({
    form,
    name,
  });

  return (
    <div className="flex w-full flex-col">
      <label htmlFor={field.name} className="font-medium">
        {label}
      </label>
      <textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
        className={cn(
          '!text-xxs bg-background-secondary border-background-secondary focus:border-tertiary text-text dark:text-textdark mt-0 w-full rounded-xl border p-4 leading-5 font-medium transition-all focus:outline-none',
          props.className,
        )}
      />
      {field.state.meta.isTouched ? (
        <em className="text-xs text-red-500">
          {field.state.meta.errors.map((err) => err.message).join(', ')}
        </em>
      ) : null}
    </div>
  );
}
