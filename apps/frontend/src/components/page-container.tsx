import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

export function PageContainer({
  children,
  className,
  maxWidth = '4xl',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-4 py-8',
        `max-w-${maxWidth}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
