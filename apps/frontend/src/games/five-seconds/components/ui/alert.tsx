import type { VariantProps } from 'class-variance-authority';
import { cn } from '@guess-logo/ui';
import {
  Alert as PrimitiveAlert,
  AlertDescription as PrimitiveAlertDescription,
  AlertTitle as PrimitiveAlertTitle,
} from '@guess-logo/ui/alert';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import './alert.css';

const alertVariants = cva(
  'pixel__alert pixel-font rounded-none px-4 py-3 text-sm transition-all',
  {
    variants: {
      variant: {
        default: 'pixel-default__alert bg-card text-card-foreground',
        destructive: 'pixel-destructive__alert bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90',
        warning: 'pixel-warning__alert bg-card text-urgency',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof PrimitiveAlert> & VariantProps<typeof alertVariants>) {
  return (
    <PrimitiveAlert
      className={cn(alertVariants({ variant }), className)}
      style={{ imageRendering: 'pixelated' }}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.ComponentProps<typeof PrimitiveAlertTitle>) {
  return (
    <PrimitiveAlertTitle
      className={cn('line-clamp-1 min-h-4 uppercase tracking-wider', className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: React.ComponentProps<typeof PrimitiveAlertDescription>) {
  return (
    <PrimitiveAlertDescription
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}
