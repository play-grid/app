import { cn } from '@playgrid/ui';
import {
  Popover as PrimitivePopover,
  PopoverAnchor as PrimitivePopoverAnchor,
  PopoverContent as PrimitivePopoverContent,
  PopoverTrigger as PrimitivePopoverTrigger,
} from '@playgrid/ui/popover';
import * as React from 'react';
import './popover-animations.css';

export const Popover = PrimitivePopover;
export const PopoverTrigger = PrimitivePopoverTrigger;
export const PopoverAnchor = PrimitivePopoverAnchor;

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PrimitivePopoverContent>) {
  return (
    <PrimitivePopoverContent
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'bg-popover text-popover-foreground',
        'border-2 p-4',
        className,
      )}
      style={{ imageRendering: 'pixelated' }}
      {...props}
    />
  );
}
