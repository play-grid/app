import type { ComponentProps } from 'react';
import { Card as PrimitiveCard } from '@playgrid/ui/card';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ComponentProps<typeof PrimitiveCard>) {
  return (
    <PrimitiveCard
      className={cn('stat-clash-panel rounded-xl border border-border/60 shadow-md', className)}
      {...props}
    />
  );
}
