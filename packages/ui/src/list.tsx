import type { ReactNode } from 'react';
import { cn } from '@guess-logo/ui';

export interface ListGroupProps {
  children: ReactNode;
  className?: string;
}

export function ListGroup({ children, className }: ListGroupProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ListItemProps {
  children: ReactNode;
  className?: string;
}

export function ListItem({ children, className }: ListItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border/50 bg-card p-4 text-card-foreground transition-colors hover:bg-accent/5',
        className,
      )}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="flex-1 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
