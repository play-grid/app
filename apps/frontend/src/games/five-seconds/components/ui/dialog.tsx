import { cn } from '@guess-logo/ui';
import {
  Dialog as PrimitiveDialog,
  DialogClose as PrimitiveDialogClose,
  DialogContent as PrimitiveDialogContent,
  DialogDescription as PrimitiveDialogDescription,
  DialogFooter as PrimitiveDialogFooter,
  DialogHeader as PrimitiveDialogHeader,
  DialogOverlay as PrimitiveDialogOverlay,
  DialogPortal as PrimitiveDialogPortal,
  DialogTitle as PrimitiveDialogTitle,
  DialogTrigger as PrimitiveDialogTrigger,
} from '@guess-logo/ui/dialog';
import { X } from 'lucide-react';
import * as React from 'react';

// Re-exporting these directly to avoid name collisions and logic duplication
export const Dialog = PrimitiveDialog;
export const DialogTrigger = PrimitiveDialogTrigger;
export const DialogPortal = PrimitiveDialogPortal;
export const DialogClose = PrimitiveDialogClose;

export function DialogOverlay({ className, ...props }: React.ComponentProps<typeof PrimitiveDialogOverlay>) {
  return (
    <PrimitiveDialogOverlay
      className={cn('bg-foreground/40 backdrop-blur-[2px]', className)}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof PrimitiveDialogContent> & {
  showCloseButton?: boolean;
}) {
  return (
    <PrimitiveDialogContent
      className={cn(
        'bg-popover text-popover-foreground p-6',
        'shadow-xl border-none',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <PrimitiveDialogClose
          className="pixel-destructive shadow-md absolute top-4 right-4 p-1 cursor-pointer rtl:right-auto rtl:left-4"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </PrimitiveDialogClose>
      )}
    </PrimitiveDialogContent>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<typeof PrimitiveDialogHeader>) {
  return (
    <PrimitiveDialogHeader
      className={cn('mb-4 space-y-2', className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.ComponentProps<typeof PrimitiveDialogFooter>) {
  return (
    <PrimitiveDialogFooter
      className={cn('mt-6 gap-3', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof PrimitiveDialogTitle>) {
  return (
    <PrimitiveDialogTitle
      className={cn('pixel-font text-2xl text-foreground uppercase tracking-tight', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof PrimitiveDialogDescription>) {
  return (
    <PrimitiveDialogDescription
      className={cn('pixel-font-sm text-muted-foreground', className)}
      {...props}
    />
  );
}
