import { cn } from '@playgrid/ui';
import { Switch as PrimitiveSwitch, SwitchThumb as PrimitiveSwitchThumb } from '@playgrid/ui/switch';
import * as React from 'react';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveSwitch>) {
  return (
    <PrimitiveSwitch
      className={cn(
        'h-[1.15rem] w-10 border ',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        'dark:data-[state=unchecked]:bg-input/80',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',

        className,
      )}
      {...props}
    >
      <PrimitiveSwitchThumb
        className={cn(
          'size-4',
          'bg-foreground',
          'dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground',
        )}
      />
    </PrimitiveSwitch>
  );
}

export { Switch };
