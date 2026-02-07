import { cn } from '@guess-logo/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.Trigger> | null> }) {
  
  return (
    <SelectPrimitive.Trigger
      ref={ref}

      className={cn(
        'flex h-10 w-full items-center rtl:flex-row-reverse justify-between px-3 text-sm outline-none',
        'rtl:mr-2 ltr:ml-2',
        className,
      )}
      {...props}
    >
      {children}
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ ref, children, className, position = 'popper', ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Content> | null> }) {

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          'relative z-50 min-w-32 overflow-hidden',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn('p-1 overflow-y-scroll', position === 'popper' && 'min-w-[var(--radix-select-trigger-width)]')}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ ref, children, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Item> | null> }) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'flex rtl:flex-row-reverse w-full cursor-pointer select-none items-center justify-between py-2 px-3 text-right',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export function SelectItemIndicator({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ItemIndicator> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.ItemIndicator> | null> }) {
  return (
    <SelectPrimitive.ItemIndicator
      ref={ref}
      className={cn(
        'absolute flex h-3.5 w-3.5 items-center justify-center',
        className,
      )}
      {...props}
    />
  );
}

export function SelectLabel({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Label> | null> }) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-sm font-medium',
        'text-left rtl:text-right',
        className,
      )}
      {...props}
    />
  );
}

export function SelectSeparator({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Separator> | null> }) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('my-1 h-px', className)}
      {...props}
    />
  );
}

export const SelectIcon = SelectPrimitive.Icon;
export const SelectScrollUpButton = SelectPrimitive.ScrollUpButton;
export const SelectScrollDownButton = SelectPrimitive.ScrollDownButton;
