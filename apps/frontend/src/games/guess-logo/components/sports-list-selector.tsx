import type { SupportedLanguage } from '@guess-logo/shared/types';
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
import { getLocalizedName } from '@/utils/language-utils';
import { useNestedListsQuery } from '../hooks/use-nested-lists-query';
import { useSportsSelection } from '../hooks/use-sports-selection';
import { fetchAvailableCountries, fetchCustomSportLists } from '../services/sports/sports-service';
import { parseSportsListId, serializeSportsListId } from '../types/sports-list-types';

export type LocaleRecord = {
  [key in SupportedLanguage]: string;
};

export interface LogoListMetadata {
  id: string;
  name: LocaleRecord;
}

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
  const lang = i18n.language as SupportedLanguage;

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
    const listId
      = leagueId === '__all__'
        ? serializeSportsListId({ type: 'region', regionName: state.regionName })
        : serializeSportsListId({ type: 'league', regionName: state.regionName, leagueId });

    onListChange(listId);
  };

  const handleCountryChange = (countryId: string) =>
    onListChange(serializeSportsListId({ type: 'country', countryId }));

  const handleCustomChange = (listSlug: string) =>
    onListChange(serializeSportsListId({ type: 'custom', listSlug }));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={state.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-40">
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

      {state.type === 'region' && (
        <>
          <Select value={state.regionName || '__none__'} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('games.guessLogo.select-region', 'Select region')} />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => {
                const parsed = parseSportsListId(region.id);
                const regionKey
                  = parsed.success && parsed.data.type === 'region'
                    ? parsed.data.regionName
                    : `unknown-${region.id}`;
                return (
                  <SelectItem key={region.id} value={regionKey}>
                    {getLocalizedName(region.name, lang)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {state.regionName && (
            <Select
              value={state.leagueId || `__all__`}
              onValueChange={handleLeagueChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('games.guessLogo.all-teams', 'All teams')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__all__">
                    🌐
                    {' '}
                    {t('games.guessLogo.all-teams')}
                  </SelectItem>
                  <SelectLabel className="text-primary/60">{t('games.guessLogo.leagues', 'Leagues')}</SelectLabel>
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
                        const lName = getLocalizedName(league.name, lang);
                        const parsed = parseSportsListId(league.id);
                        const leagueKey
                          = parsed.success && parsed.data.type === 'league'
                            ? parsed.data.leagueId
                            : `unknown-${league.id}`;
                        return (
                          <SelectItem className="break-normal text-md" key={league.id} value={leagueKey}>
                            🏆
                            {lName}
                          </SelectItem>
                        );
                      })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </>
      )}

      {state.type === 'country' && (
        <Select value={state.countryId || '__none__'} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('games.guessLogo.select-country')} />
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
                  return (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag}
                      {' '}
                      {getLocalizedName(country.name, lang)}
                    </SelectItem>
                  );
                })}
          </SelectContent>
        </Select>
      )}

      {state.type === 'custom' && (
        <Select value={state.customSlug || '__none__'} onValueChange={handleCustomChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('games.guessLogo.select-list')} />
          </SelectTrigger>
          <SelectContent>
            {customLists.map(list => (
              <SelectItem key={list.id} value={list.slug}>
                {getLocalizedName(list.name, lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
