import { cn } from '@guess-logo/ui';
import * as React from 'react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        // Base Structural Layout
        'flex h-10 w-full px-3 py-2 text-sm',

        // Directionality
        'text-left rtl:text-right',

        // Reset/Primitive styles
        'bg-transparent outline-none appearance-none',

        // State logic
        'disabled:cursor-not-allowed disabled:opacity-50',

        // File input reset
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',

        className,
      )}
      {...props}
    />
  );
}

export { Input };
