import { cn } from '@guess-logo/ui';
import { Label as PrimitiveLabel } from '@guess-logo/ui/label';
import * as React from 'react';

export function Label({ className, ...props }: React.ComponentProps<typeof PrimitiveLabel>) {
  return (
    <PrimitiveLabel
      className={cn(
        'pixel-font-sm text-foreground mb-2 block tracking-tight',
        className,
      )}
      {...props}
    />
  );
}
