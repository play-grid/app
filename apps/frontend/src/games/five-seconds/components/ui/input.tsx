import { cn } from '@playgrid/ui';
import { Input as PrimitiveInput } from '@playgrid/ui/input';
import * as React from 'react';

export function Input({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveInput>) {
  return (
    <PrimitiveInput
      className={cn(
        'bg-popover text-foreground placeholder:text-muted-foreground',
        'border-none shadow-md focus:translate-y-px',
        'pixel-font-sm',
        className,
      )}
      {...props}
    />
  );
}
