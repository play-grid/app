import { cn } from '@playgrid/ui';
import * as React from 'react';

export function Alert({
  ref,
  className,
  ...props
}: React.ComponentProps<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      data-slot="alert"
      role="alert"
      className={cn(
        'relative w-full grid items-start',
        'grid-cols-[0_1fr] has-[>svg]:grid-cols-[auto_1fr] gap-y-0.5 has-[>svg]:gap-x-3',
        '[&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({
  ref,
  className,
  ...props
}: React.ComponentProps<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      data-slot="alert-title"
      className={cn('col-start-2 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

export function AlertDescription({
  ref,
  className,
  ...props
}: React.ComponentProps<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}
