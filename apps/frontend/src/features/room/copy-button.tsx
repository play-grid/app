import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function CopyButton({
  text,
  className,
  size = 'icon',
  variant = 'ghost'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleCopy}
      className={cn('relative shrink-0', className)}
    >
      <Copy
        className={cn(`
          h-4 w-4 absolute transition-all duration-200
          ${copied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
        `)}
      />
      <Check
        className={cn(`
          h-4 w-4 absolute transition-all duration-200
          ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `)}
      />
    </Button>
  );
}