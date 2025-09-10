import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        // Base styles
        'flex h-10 w-full rounded-lg border bg-card px-3 py-2 text-sm',

        // Colors and theming
        'border-border text-foreground placeholder:text-muted-foreground',
        'shadow-sm transition-all duration-200',

        // Focus states
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-ring',

        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50',

        // File input styles
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',

        // Error state
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',

        className,
      )}
      {...props}
    />
  );
}

export { Input };
