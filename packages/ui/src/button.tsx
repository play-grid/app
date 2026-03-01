import { cn } from '@playgrid/ui';
import { Slot } from '@radix-ui/react-slot';

import * as React from 'react';

/**
 * A primitive button component.
 * It should be extended by game-specific buttons with variants and styles.
 * It provides base styling and accessibility.
 */
function Button({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'>
  & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn('inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none', className)}
      {...props}
    />
  );
}

export { Button };
