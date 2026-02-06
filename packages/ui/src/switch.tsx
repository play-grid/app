import { cn } from '@guess-logo/ui';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function Switch({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
  ref?: React.RefObject<React.ComponentRef<typeof SwitchPrimitive.Root> | null>;
}) {
  const { i18n } = useTranslation();
  const dir = typeof i18n.dir === 'function' ? i18n.dir() : document.documentElement.dir;

  return (
    <SwitchPrimitive.Root
      ref={ref}
      dir={dir}
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center',
        'transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function SwitchThumb({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Thumb> & {
  ref?: React.RefObject<React.ComponentRef<typeof SwitchPrimitive.Thumb> | null>;
}) {
  return (
    <SwitchPrimitive.Thumb
      ref={ref}
      className={cn(
        'pointer-events-none block ring-0 transition-transform',
        'data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0',
        className,
      )}
      {...props}
    />
  );
}
