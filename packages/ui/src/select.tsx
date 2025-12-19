import { cn } from '@guess-logo/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { ref?: React.RefObject<React.ComponentRef<typeof SelectPrimitive.Trigger> | null> }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between px-3 text-sm outline-none',
        isRTL ? 'flex-row-reverse text-right' : 'text-left',
        className,
      )}
      dir={i18n.dir()}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className={cn('h-4 w-4 opacity-70', isRTL ? 'mr-2' : 'ml-2')}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
SelectTrigger.displayName = 'SelectTrigger';

export function SelectScrollUpButton({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.ScrollUpButton> | null> }) {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn('flex items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUp className="h-4 w-4 opacity-70" />
    </SelectPrimitive.ScrollUpButton>
  );
}
SelectScrollUpButton.displayName = 'SelectScrollUpButton';

export function SelectScrollDownButton({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.ScrollDownButton> | null> }) {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn('flex items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDown className="h-4 w-4 opacity-70" />
    </SelectPrimitive.ScrollDownButton>
  );
}
SelectScrollDownButton.displayName = 'SelectScrollDownButton';

export function SelectContent({ ref, children, className, position = 'popper', ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Content> | null> }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        dir={i18n.dir()}
        position={position}
        align={isRTL ? 'end' : 'start'}
        className={cn(
          'relative z-50 min-w-[8rem] overflow-hidden shadow-sm',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper'
            && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
SelectContent.displayName = 'SelectContent';

export function SelectLabel({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Label> | null> }) {
  const { i18n } = useTranslation();

  return (
    <SelectPrimitive.Label
      ref={ref}
      dir={i18n.dir()}
      className={cn('px-2 py-1 text-sm font-medium rtl:text-right', className)}
      {...props}
    />
  );
}
SelectLabel.displayName = 'SelectLabel';

export function SelectItem({ ref, children, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Item> | null> }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <SelectPrimitive.Item
      ref={ref}
      dir={i18n.dir()}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm outline-none',
        isRTL ? 'text-right pr-8' : 'text-left pl-8',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'absolute flex h-4 w-4 items-center justify-center',
          'rtl:right-2',
        )}
      >
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 opacity-70" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
SelectItem.displayName = 'SelectItem';

export function SelectSeparator({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Separator> | null> }) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('my-1 h-px opacity-40', className)}
      {...props}
    />
  );
}
SelectSeparator.displayName = 'SelectSeparator';
