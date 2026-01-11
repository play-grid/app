import { cn } from '@guess-logo/ui';
import {
  Select as PrimitiveSelect,
  SelectContent as PrimitiveSelectContent,
  SelectItem as PrimitiveSelectItem,
  SelectLabel as PrimitiveSelectLabel,
  SelectScrollDownButton as PrimitiveSelectScrollDownButton,
  SelectScrollUpButton as PrimitiveSelectScrollUpButton,
  SelectSeparator as PrimitiveSelectSeparator,
  SelectTrigger as PrimitiveSelectTrigger,
  SelectGroup,
  SelectIcon,
  SelectValue,
} from '@guess-logo/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

export const Select = PrimitiveSelect;
export { SelectGroup, SelectValue };

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof PrimitiveSelectTrigger>) {
  return (
    <PrimitiveSelectTrigger
      className={cn(
        'bg-popover text-foreground border-none',
        'shadow-md focus:shadow-lg focus:translate-y-px transition-all',
        className,
      )}
      {...props}
    >
      {children}
      <SelectIcon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectIcon>
    </PrimitiveSelectTrigger>
  );
}

export function SelectContent({ className, children, position = 'popper', ...props }: React.ComponentProps<typeof PrimitiveSelectContent>) {
  return (
    <PrimitiveSelectContent
      className={cn(
        'bg-popover text-popover-foreground border-none shadow-lg mt-2',
        'max-h-96',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      {children}
      <SelectScrollDownButton />
    </PrimitiveSelectContent>
  );
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof PrimitiveSelectItem>) {
  return (
    <PrimitiveSelectItem
      className={cn(
        'focus:bg-primary focus:text-primary-foreground outline-none transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </PrimitiveSelectItem>
  );
}

export function SelectLabel({ className, ...props }: React.ComponentProps<typeof PrimitiveSelectLabel>) {
  return (
    <PrimitiveSelectLabel
      className={cn('text-muted-foreground font-bold uppercase tracking-wider', className)}
      {...props}
    />
  );
}

export function SelectSeparator({ className, ...props }: React.ComponentProps<typeof PrimitiveSelectSeparator>) {
  return (
    <PrimitiveSelectSeparator
      className={cn('bg-border h-0.5 opacity-100', className)}
      {...props}
    />
  );
}

export function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof PrimitiveSelectScrollUpButton>) {
  return (
    <PrimitiveSelectScrollUpButton className={cn('text-muted-foreground', className)} {...props}>
      <ChevronUp className="h-4 w-4" />
    </PrimitiveSelectScrollUpButton>
  );
}

export function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof PrimitiveSelectScrollDownButton>) {
  return (
    <PrimitiveSelectScrollDownButton className={cn('text-muted-foreground', className)} {...props}>
      <ChevronDown className="h-4 w-4" />
    </PrimitiveSelectScrollDownButton>
  );
}
