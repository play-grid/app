import { cn } from '@playgrid/ui';
import { Tooltip as PrimitiveTooltip, TooltipContent as PrimitiveTooltipContent, TooltipProvider as PrimitiveTooltipProvider, TooltipTrigger as PrimitiveTooltipTrigger } from '@playgrid/ui/tooltip';
import * as React from 'react';
import './tooltip-animations.css';

export const Tooltip = PrimitiveTooltip;
export const TooltipTrigger = PrimitiveTooltipTrigger;
export const TooltipProvider = PrimitiveTooltipProvider;

export function TooltipContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PrimitiveTooltipContent>) {
  return (
    <PrimitiveTooltipContent
      data-slot="tooltip-content"
      className={cn(
        'bg-popover text-popover-foreground px-3 py-1.5 text-sm pixel-font shadow-lg border-2 border-border',
        'animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2 z-50',
        className,
      )}
      {...props}
    >
      {children}
    </PrimitiveTooltipContent>
  );
}
