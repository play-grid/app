import type { ExtractVariants } from '@guess-logo/ui/utils';
import { cn } from '@guess-logo/ui';
import { Button as PrimitiveButton } from '@guess-logo/ui/button';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import './button.css';

const buttonVariants = cva(
  'pixel__button pixel-font cursor-pointer rounded-none w-fit items-center justify-center whitespace-nowrap text-sm transition-colors duration-100',
  {
    variants: {
      variant: {
        default: 'pixel-default__button box-shadow-margin bg-primary text-foreground',
        secondary: 'pixel-secondary__button box-shadow-margin',
        warning: 'pixel-warning__button box-shadow-margin',
        success: 'pixel-success__button box-shadow-margin',
        destructive: 'pixel-destructive__button box-shadow-margin',
        link: 'pixel-link__button bg-transparent text-link underline-offset-4 underline',
        outline: 'pixel-outline__button box-shadow-margin',
        ghost: 'pixel-ghost__button box-shadow-margin',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends React.ComponentProps<typeof PrimitiveButton>, ExtractVariants<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  return (
    <PrimitiveButton
      asChild={asChild}
      className={cn(
        buttonVariants({ variant, size }),
        className,
      )}
      style={{ imageRendering: 'pixelated' }}
      {...props}
    />
  );
}
