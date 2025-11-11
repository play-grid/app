import type { LogoListMetadata } from '@guess-logo/shared/types';
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
import { useNestedListsQuery } from '../hooks/use-nested-lists-query';

interface InlineSportsListSelectorProps {
  regions: LogoListMetadata[];
  selectedRegion: string;
  selectedLeague: string;
  onRegionChange: (regionId: string) => void;
  onLeagueChange: (leagueId: string) => void;
  className?: string;
}

/**
 * Compact sports list selector that combines region and league in a single dropdown
 * Suitable for use in headers or compact layouts
 */
export function InlineSportsListSelector({
  regions,
  selectedRegion,
  selectedLeague,
  onRegionChange,
  onLeagueChange,
  className = 'w-[200px]',
}: InlineSportsListSelectorProps) {
  const { i18n } = useTranslation();

  // Fetch leagues for the selected region
  const {
    data: leagues = [],
    isLoading: isLoadingLeagues,
  } = useNestedListsQuery(
    'sports',
    selectedRegion,
    !!selectedRegion,
  );

  // Determine the display value
  const getDisplayValue = () => {
    if (!selectedRegion)
      return undefined;

    if (selectedLeague) {
      const league = leagues.find(l => l.id === selectedLeague);
      if (league) {
        return league.name[i18n.language as keyof typeof league.name];
      }
    }

    const region = regions.find(r => r.id === selectedRegion);
    return region
      ? `${region.name[i18n.language as keyof typeof region.name]} (All)`
      : undefined;
  };

  // Handle selection - if it's a region, call onRegionChange, if it's a league, call onLeagueChange
  const handleChange = (value: string) => {
    if (value.startsWith('region:')) {
      // It's a region selection
      onRegionChange(value);
      onLeagueChange(''); // Clear league selection
    }
    else {
      // It's a league selection
      onLeagueChange(value);
    }
  };

  return (
    <Select
      value={selectedLeague || selectedRegion}
      onValueChange={handleChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={i18n.t('select-region')}>
          {getDisplayValue()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {regions.map(region => (
          <SelectGroup key={region.id}>
            <SelectLabel className="text-xs font-semibold text-muted-foreground">
              {region.name[i18n.language as keyof typeof region.name]}
            </SelectLabel>

            {/* Option for all teams in region */}
            <SelectItem value={region.id} className="pl-6">
              {i18n.t('all-teams')}
            </SelectItem>

            {/* Show leagues if this region is selected */}
            {selectedRegion === region.id && (
              <>
                {isLoadingLeagues
                  ? (
                      <SelectItem value={`${region.id}-loading`} disabled className="pl-6 text-xs">
                        {i18n.t('loading')}
                        ...
                      </SelectItem>
                    )
                  : (
                      leagues.map(league => (
                        <SelectItem key={league.id} value={league.id} className="pl-6">
                          {league.name[i18n.language as keyof typeof league.name]}
                        </SelectItem>
                      ))
                    )}
              </>
            )}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
