import type { LogoItem } from '@guess-logo/shared/types';
import { Trophy, X } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

export interface LogoItemProps {
  logo: LogoItem;
  isWinner: boolean;
  onToggle: () => void;
  isQueryLoading?: boolean;
  hasQueryError?: boolean;
}

export function LogoItemComponent({
  logo,
  isWinner,
  onToggle,
  isQueryLoading = false,
  hasQueryError = false,
}: LogoItemProps) {
  // Individual image loading state (separate from query loading)
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Determine if we should show an image or fallback to text
  // Allow placeholder URLs for now, but exclude obvious text-only cases
  const hasValidImageUrl = logo.imageUrl && logo.imageUrl !== logo.name && !hasQueryError && !imageError;

  const showLoadingSpinner = isQueryLoading || (hasValidImageUrl && imageLoading);

  return (
    <Card
      className={`aspect-square p-2 cursor-pointer transition-all hover:shadow-md ${
        logo.eliminated ? 'bg-destructive/10 border-destructive/20' : 'hover:shadow-lg hover:-translate-y-0.5'
      } ${isWinner ? 'animate-bounce bg-green-100 border-green-400 border-2 shadow-lg' : ''}`}
      onClick={onToggle}
    >
      <div className="h-full flex items-center justify-center relative">
        {hasValidImageUrl
          ? (
              <div className="w-full h-full flex items-center justify-center select-none pointer-events-none relative">
                <img
                  src={logo.imageUrl || '/placeholder.svg'}
                  alt={logo.name}
                  className={`max-w-full max-h-full object-contain transition-opacity ${
                    logo.eliminated ? 'opacity-30 grayscale' : ''
                  } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => {
                    setImageLoading(false);
                  }}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
                {showLoadingSpinner && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )
          : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className={`text-xs text-center font-medium leading-tight ${
                    logo.eliminated ? 'text-destructive line-through' : 'text-card-foreground'
                  } ${isWinner ? 'text-green-700 font-bold' : ''}`}
                >
                  {logo.name}
                </span>
                {showLoadingSpinner && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
        {logo.eliminated && (
          <X className="absolute top-1 right-1 w-4 h-4 text-destructive bg-white rounded-full p-0.5" />
        )}
        {isWinner && (
          <Trophy className="absolute top-1 left-1 w-4 h-4 text-green-600 animate-pulse bg-white rounded-full p-0.5" />
        )}
      </div>
    </Card>
  );
}
