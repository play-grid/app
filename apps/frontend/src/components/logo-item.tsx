import type { LogoItem } from '@guess-logo/shared/types';
import { containsArabic } from '@guess-logo/shared/utils';
import { Trophy, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Spinner } from './ui/spinner';

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
  const { t, i18n } = useTranslation();
  // Individual image loading state (separate from query loading)
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Determine if we should show an image or fallback to text
  // Allow placeholder URLs for now, but exclude obvious text-only cases
  const hasValidImageUrl = logo.imageUrl && logo.imageUrl !== logo.name && !hasQueryError && !imageError;

  const showLoadingSpinner = isQueryLoading || (hasValidImageUrl && imageLoading);

  const formattedName = logo.name.replace(/\.com\.sa|\.gov\.sa|\.com|\.sa|\.net|\.ai|\.co/g, '');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
                        <Spinner />
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
                      {formattedName}
                    </span>
                    {showLoadingSpinner && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Spinner />
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
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-3">
          <p className="font-bold text-sm tracking-wide border-b border-background/20 pb-2">{formattedName}</p>
          {logo.countryData && (
            <div className="space-y-2.5 text-xs">
              {logo.countryData.region && (
                <div className="flex items-start gap-3 group">
                  <span className="text-background/60 min-w-[4.5rem] font-medium uppercase text-[10px] tracking-wider pt-0.5">
                    {t('country-data-region')}
                  </span>
                  <span className="font-medium flex-1 group-hover:text-background/80 transition-colors">
                    {logo.countryData.region}
                  </span>
                </div>
              )}
              {logo.countryData.languages && logo.countryData.languages.length > 0 && (
                <div className="flex items-start gap-3 group">
                  <span className="text-background/60 min-w-[4.5rem] font-medium uppercase text-[10px] tracking-wider pt-0.5">
                    {t('country-data-languages')}
                  </span>
                  <span className="font-medium flex-1 group-hover:text-background/80 transition-colors">
                    {logo.countryData.languages
                      .slice(0, 2)
                      .map((lang) => {
                        if (i18n.language === 'ar') {
                          return lang?.nativeName && containsArabic(lang.nativeName)
                            ? lang.nativeName
                            : lang.name;
                        }
                        return lang.name;
                      })
                      .join(', ')}
                  </span>
                </div>
              )}
              {logo.countryData.currencies && logo.countryData.currencies.length > 0 && (
                <div className="flex items-start gap-3 group">
                  <span className="text-background/60 min-w-[4.5rem] font-medium uppercase text-[10px] tracking-wider pt-0.5">
                    {t('country-data-currency')}
                  </span>
                  <span className="font-medium flex-1 group-hover:text-background/80 transition-colors">
                    {logo.countryData.currencies.map(curr => curr.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
