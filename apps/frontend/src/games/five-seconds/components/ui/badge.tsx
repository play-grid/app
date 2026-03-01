// badge.tsx
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@playgrid/ui';
import { cva } from 'class-variance-authority';
import './badge.css';

const badgeVariants = cva(
  'pixel__badge pixel-font inline-flex items-center border px-3 py-1 text-xs font-semibold focus:outline-none',
  {
    variants: {
      variant: {
        default: 'pixel-default__badge bg-primary text-primary-foreground',
        secondary: 'pixel-secondary__badge bg-secondary text-secondary-foreground',
        destructive: 'pixel-destructive__badge bg-destructive text-destructive-foreground',
        success: 'pixel-success__badge bg-success text-success-foreground',
        warning: 'pixel-warning__badge bg-urgency text-destructive-foreground',
        outline: 'pixel-outline__badge bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ imageRendering: 'pixelated' }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
