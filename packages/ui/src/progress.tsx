import { cn } from '@playgrid/ui';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

function getPercent(value: number | null | undefined, maxValue: number | undefined): number {
  if (value == null || value <= 0)
    return 0;
  const max = maxValue ?? 100;
  if (max <= 0)
    return 0;
  return Math.min(100, (value / max) * 100);
}

function Progress({ ref, className, value, max, children, ...props }: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { ref?: React.RefObject<React.ElementRef<typeof ProgressPrimitive.Root> | null> }) {
  const percent = getPercent(value, max);
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2.5 w-full overflow-hidden bg-muted',
        className,
      )}
      value={value}
      max={max}
      {...props}
    >
      {children || (
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 bg-primary transition-transform',
            'duration-500 ease-out',
          )}
          style={{

            transform: `translateX(-${100 - percent}%)`,
          }}
        />
      )}
    </ProgressPrimitive.Root>
  );
}
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

export const ProgressIndicator = ProgressPrimitive.Indicator;
