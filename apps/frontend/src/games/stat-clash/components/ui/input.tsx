import type { ComponentProps } from 'react';
import { Input as PrimitiveInput } from '@guess-logo/ui/input';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: ComponentProps<typeof PrimitiveInput>) {
  return (
    <PrimitiveInput
      className={cn('h-10 rounded-lg border border-border bg-background px-3 text-sm shadow-sm', className)}
      {...props}
    />
  );
}
