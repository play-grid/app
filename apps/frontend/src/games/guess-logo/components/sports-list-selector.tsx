// cascading-sports-list-selector.tsx
// Clean implementation using custom hook for state management

import type { LogoListMetadata } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useNestedListsQuery } from '../hooks/use-nested-lists-query';
import { useSportsSelection } from '../hooks/use-sports-selection';
import { fetchAvailableCountries, fetchCustomSportLists } from '../services/sports/sports-service';
import { parseSportsListId, serializeSportsListId } from '../types/sports-list-types';

interface SportsListSelectorProps {
  regions: LogoListMetadata[];
  selectedListId: string;
  onListChange: (listId: string) => void;
  className?: string;
}

type SelectionType = 'region' | 'country' | 'custom';

export function SportsListSelector({
  regions,
  selectedListId,
  onListChange,
  className = '',
}: SportsListSelectorProps) {
  const { i18n, t } = useTranslation();
  const { state } = useSportsSelection(selectedListId);

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ['available-countries'],
    queryFn: fetchAvailableCountries,
    staleTime: 10 * 60 * 1000,
  });

  const { data: customLists = [] } = useQuery({
    queryKey: ['custom-sport-lists'],
    queryFn: fetchCustomSportLists,
    staleTime: 10 * 60 * 1000,
  });

  const shouldFetchLeagues = state.type === 'region' && !!state.regionName;
  const regionListId = shouldFetchLeagues
    ? serializeSportsListId({ type: 'region', regionName: state.regionName })
    : '';

  const { data: leagues = [], isLoading: isLoadingLeagues } = useNestedListsQuery(
    'sports',
    regionListId,
    shouldFetchLeagues,
  );

  const handleTypeChange = (type: SelectionType) => {
    const newListId = (() => {
      switch (type) {
        case 'region':
          if (regions.length > 0) {
            const parsed = parseSportsListId(regions[0].id);
            if (parsed.success && parsed.data.type === 'region') {
              return serializeSportsListId({ type: 'region', regionName: parsed.data.regionName });
            }
          }
          return '';
        case 'country':
          if (countries.length > 0) {
            return serializeSportsListId({ type: 'country', countryId: countries[0].id });
          }
          return '';
        case 'custom':
          if (customLists.length > 0) {
            return serializeSportsListId({ type: 'custom', listSlug: customLists[0].slug });
          }
          return '';
        default:
          return '';
      }
    })();
    if (newListId)
      onListChange(newListId);
  };

  const handleRegionChange = (regionName: string) =>
    onListChange(serializeSportsListId({ type: 'region', regionName }));

  const handleLeagueChange = (leagueId: string) => {
    const listId = leagueId
      ? serializeSportsListId({ type: 'league', regionName: state.regionName, leagueId })
      : serializeSportsListId({ type: 'region', regionName: state.regionName });
    onListChange(listId);
  };

  const handleCountryChange = (countryId: string) =>
    onListChange(serializeSportsListId({ type: 'country', countryId }));

  const handleCustomChange = (listSlug: string) =>
    onListChange(serializeSportsListId({ type: 'custom', listSlug }));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Step 1: Selection Type */}
      <Select value={state.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="region">
            🗺️
            {t('games.guessLogo.by-region', 'By Region')}
          </SelectItem>
          <SelectItem value="country">
            🌍
            {t('games.guessLogo.by-country', 'By Country')}
          </SelectItem>
          {customLists.length > 0 && (
            <SelectItem value="custom">
              ⭐
              {t('games.guessLogo.custom-lists', 'Custom')}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Step 2: Region Selection */}
      {state.type === 'region' && (
        <>
          <Select value={state.regionName || '__none__'} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('games.guessLogo.select-region', 'Select region')} />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => {
                const regionName = region.name[i18n.language as keyof typeof region.name];
                const parsed = parseSportsListId(region.id);
                const regionKey
                  = parsed.success && parsed.data.type === 'region'
                    ? parsed.data.regionName
                    : `unknown-${region.id}`;
                return <SelectItem key={region.id} value={regionKey}>{regionName}</SelectItem>;
              })}
            </SelectContent>
          </Select>

          {/* Step 3: League Selection */}
          {state.regionName && (
            <Select
              value={state.leagueId || `all-${state.regionName}`}
              onValueChange={handleLeagueChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('games.guessLogo.all-teams', 'All teams')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t('games.guessLogo.leagues', 'Leagues')}</SelectLabel>
                  <SelectItem value={`all-${state.regionName}`}>
                    🌐
                    {t('games.guessLogo.all-teams', 'All teams')}
                  </SelectItem>
                  {isLoadingLeagues
                    ? (
                        <div className="px-2 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Spinner className="w-3 h-3" />
                          <span>
                            {t('games.guessLogo.loading')}
                            ...
                          </span>
                        </div>
                      )
                    : leagues.map((league) => {
                        const leagueName = league.name[i18n.language as keyof typeof league.name];
                        const parsed = parseSportsListId(league.id);
                        const leagueKey = parsed.success && parsed.data.type === 'league'
                          ? parsed.data.leagueId
                          : `unknown-${league.id}`;
                        return (
                          <SelectItem key={league.id} value={leagueKey}>
                            🏆
                            {leagueName}
                          </SelectItem>
                        );
                      })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </>
      )}

      {/* Step 2: Country Selection */}
      {state.type === 'country' && (
        <Select value={state.countryId || '__none__'} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('games.guessLogo.select-country', 'Select country')} />
          </SelectTrigger>
          <SelectContent>
            {isLoadingCountries
              ? (
                  <div className="px-2 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Spinner className="w-3 h-3" />
                    <span>
                      {t('games.guessLogo.loading')}
                      ...
                    </span>
                  </div>
                )
              : countries.map((country) => {
                  const countryName = country.name[i18n.language as keyof typeof country.name] || country.name.en;
                  return (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag}
                      {' '}
                      {countryName}
                    </SelectItem>
                  );
                })}
          </SelectContent>
        </Select>
      )}

      {/* Step 2: Custom List Selection */}
      {state.type === 'custom' && (
        <Select value={state.customSlug || '__none__'} onValueChange={handleCustomChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('games.guessLogo.select-list', 'Select list')} />
          </SelectTrigger>
          <SelectContent>
            {customLists.map(list => (
              <SelectItem key={list.id} value={list.slug}>{list.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
