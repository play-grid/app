import { cn } from '@playgrid/ui';

import { Progress as ProgressPrimitive } from '@playgrid/ui/progress';
import * as React from 'react';

export function Progress({
  className,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive>) {
  return (
    <ProgressPrimitive
      className={cn(
        'bg-popover',
        'border-none shadow-md focus:translate-y-px',
        'pixel-font-sm',
        className,
      )}
      {...props}
    >
    </ProgressPrimitive>
  );
}
