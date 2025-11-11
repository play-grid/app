import type { LogoListMetadata } from '@guess-logo/shared/types';

import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useNestedListsQuery } from '../hooks/use-nested-lists-query';

interface InlineSportsListSelectorProps {
  regions: LogoListMetadata[];
  selectedRegion: string;
  selectedLeague: string;
  onRegionChange: (regionId: string) => void;
  onLeagueChange: (leagueId: string) => void;
  className?: string;
}

// Common countries in sports (you can expand this list)
const POPULAR_COUNTRIES = [
  { id: 'saudi-arabia', name: { en: 'Saudi Arabia', ar: 'السعودية' }, flag: '🇸🇦' },
  { id: 'spain', name: { en: 'Spain', ar: 'إسبانيا' }, flag: '🇪🇸' },
  { id: 'england', name: { en: 'England', ar: 'إنجلترا' }, flag: '🏴' },
  { id: 'italy', name: { en: 'Italy', ar: 'إيطاليا' }, flag: '🇮🇹' },
  { id: 'germany', name: { en: 'Germany', ar: 'ألمانيا' }, flag: '🇩🇪' },
  { id: 'france', name: { en: 'France', ar: 'فرنسا' }, flag: '🇫🇷' },
];

export function InlineSportsListSelector({
  regions,
  selectedRegion,
  selectedLeague,
  onRegionChange,
  onLeagueChange,
  className = 'w-[200px]',
}: InlineSportsListSelectorProps) {
  const { i18n, t } = useTranslation();

  const {
    data: leagues = [],
    isLoading: isLoadingLeagues,
  } = useNestedListsQuery(
    'sports',
    selectedRegion,
    !!selectedRegion && !selectedRegion.startsWith('country:'),
  );

  const getCurrentValue = () => {
    if (selectedLeague)
      return selectedLeague;
    if (selectedRegion)
      return selectedRegion;
    return '';
  };

  const getDisplayText = () => {
    // Check if it's a country selection
    if (selectedRegion?.startsWith('country:')) {
      const countryId = selectedRegion.replace('country:', '');
      const country = POPULAR_COUNTRIES.find(c => c.id === countryId);
      if (country) {
        return `${country.flag} ${country.name[i18n.language as keyof typeof country.name]}`;
      }
    }

    if (selectedRegion) {
      const region = regions.find(r => r.id === selectedRegion);
      if (region) {
        const regionName = region.name[i18n.language as keyof typeof region.name];
        if (selectedLeague && leagues.length > 0) {
          const league = leagues.find(l => l.id === selectedLeague);
          if (league) {
            return league.name[i18n.language as keyof typeof league.name];
          }
        }
        return `${regionName} (${t('games.guessLogo.all-teams')})`;
      }
    }

    return t('games.guessLogo.select-region');
  };

  const handleChange = (value: string) => {
    if (value.startsWith('country:')) {
      // Country selection
      onRegionChange(value);
      onLeagueChange('');
    }
    else if (value.startsWith('region:') && !value.includes(':league:')) {
      // Region selection (all teams)
      onRegionChange(value);
      onLeagueChange('');
    }
    else if (value.includes(':league:')) {
      // League selection
      onLeagueChange(value);
    }
  };

  const currentValue = getCurrentValue();
  const isCountrySelected = selectedRegion?.startsWith('country:');

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue>{getDisplayText()}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {/* Countries Section (Optional) */}

        <SelectGroup>
          <SelectLabel className="text-xs font-semibold text-primary">
            🌍
            {' '}
            {t('games.guessLogo.by-country')}
          </SelectLabel>
          {POPULAR_COUNTRIES.map(country => (
            <SelectItem key={country.id} value={`country:${country.id}`} className="pl-6">
              <div className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.name[i18n.language as keyof typeof country.name]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />

        <SelectGroup>
          <SelectLabel className="text-xs font-semibold text-primary">
            🗺️
            {' '}
            {t('games.guessLogo.by-region', 'By Region')}
          </SelectLabel>
        </SelectGroup>

        {regions.map((region) => {
          const isSelectedRegion = selectedRegion === region.id && !isCountrySelected;
          const regionName = region.name[i18n.language as keyof typeof region.name];

          return (
            <SelectGroup key={region.id}>
              <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                {regionName}
              </SelectLabel>

              {/* "All teams in region" option */}
              <SelectItem value={region.id} className="pl-6">
                <div className="flex items-center gap-2">
                  <span>🌍</span>
                  <span>{t('games.guessLogo.all-teams')}</span>
                </div>
              </SelectItem>

              {/* Show leagues only if this region is currently selected */}
              {isSelectedRegion && (
                <>
                  {isLoadingLeagues
                    ? (
                        <div className="pl-6 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Spinner className="w-3 h-3" />
                          <span>
                            {t('games.guessLogo.loading')}
                            ...
                          </span>
                        </div>
                      )
                    : (
                        <>
                          {leagues.length > 0
                            ? (
                                leagues.map(league => (
                                  <SelectItem key={league.id} value={league.id} className="pl-6">
                                    <div className="flex items-center gap-2">
                                      <span>🏆</span>
                                      <span>{league.name[i18n.language as keyof typeof league.name]}</span>
                                    </div>
                                  </SelectItem>
                                ))
                              )
                            : (
                                <div className="pl-6 py-2 text-xs text-muted-foreground">
                                  {t('games.guessLogo.no-leagues')}
                                </div>
                              )}
                        </>
                      )}
                </>
              )}

              <SelectSeparator />
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}
