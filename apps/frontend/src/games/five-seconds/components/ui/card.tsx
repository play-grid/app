import type { ExtractVariants } from '@playgrid/ui/utils';
import { cn } from '@playgrid/ui';
import {
  Card as PrimitiveCard,
  CardAction as PrimitiveCardAction,
  CardContent as PrimitiveCardContent,
  CardDescription as PrimitiveCardDescription,
  CardFooter as PrimitiveCardFooter,
  CardHeader as PrimitiveCardHeader,
  CardTitle as PrimitiveCardTitle,
} from '@playgrid/ui/card';

import { cva } from 'class-variance-authority';
import * as React from 'react';

const cardVariants = cva(
  'text-foreground transition-all',
  {
    variants: {
      variant: {
        default: 'border-2 border-border shadow-lg',
        outline: 'border-2 border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface CardProps
  extends React.ComponentProps<typeof PrimitiveCard>,
  ExtractVariants<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <PrimitiveCard
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof PrimitiveCardHeader>) {
  return (
    <PrimitiveCardHeader
      className={cn('border-b-2 border-border/5 mb-2', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<typeof PrimitiveCardTitle>) {
  return (
    <PrimitiveCardTitle
      className={cn('pixel-font text-lg font-bold uppercase tracking-tight', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<typeof PrimitiveCardDescription>) {
  return (
    <PrimitiveCardDescription
      className={cn('text-foreground/60 text-xs', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<typeof PrimitiveCardContent>) {
  return (
    <PrimitiveCardContent
      className={cn('pt-2', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<typeof PrimitiveCardAction>) {
  return (
    <PrimitiveCardAction
      className={cn('flex gap-2', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof PrimitiveCardFooter>) {
  return (
    <PrimitiveCardFooter
      className={cn('border-t-2 border-border/5 mt-2', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
