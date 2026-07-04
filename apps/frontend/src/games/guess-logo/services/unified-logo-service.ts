import type { LogoSetKey } from '@playgrid/guess-logo';
import type { SupportedLanguage } from '@playgrid/shared/types';
import type { LogoListMetadata } from '../components/sports-list-selector';
import type { LogoItem } from '../stores/game-state.types';
import client from '@/lib/hono-client';
import { parseSportsListIdOrThrow, serializeSportsListId } from '../types/sports-list-types';
import {
  fetchAllSportTeamsInCountry,
  fetchAllSportTeamsInRegion,
  fetchSportLeagues,
  fetchSportRegions,
  fetchSportTeams,
  fetchSportTeamsInCustomList,
} from './sports/sports-service';

/**
 * Check if the logo set is sports (which uses a different API structure)
 */
function isSportsSet(logoSet: LogoSetKey): boolean {
  return logoSet === 'sports';
}

/**
 * Unified function to fetch logo lists
 * For sports: returns regions as lists
 * For others: returns the normal list structure
 */
export async function fetchLogoLists(logoSet: LogoSetKey): Promise<LogoListMetadata[]> {
  if (isSportsSet(logoSet)) {
    // For sports, fetch regions and format them as lists
    const regions = await fetchSportRegions();
    return regions.map(region => ({
      id: serializeSportsListId({
        type: 'region',
        regionName: region.name.en.toLowerCase(),
      }),
      name: region.name,
    }));
  }

  // Regular logo sets
  const res = await client.api.games['guess-logo'].logos[':set'].$get({
    param: { set: logoSet },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch logo lists');
  }

  return res.json();
}

/**
 * Unified function to fetch nested lists (only for sports)
 * For sports: returns leagues within a region
 */
export async function fetchNestedLists(
  logoSet: LogoSetKey,
  parentListId: string,
): Promise<LogoListMetadata[]> {
  if (!isSportsSet(logoSet)) {
    throw new Error('Nested lists are only supported for sports');
  }

  const parsed = parseSportsListIdOrThrow(parentListId);

  if (parsed.type === 'region') {
    const leagues = await fetchSportLeagues(parsed.regionName);
    return leagues.map(league => ({
      id: serializeSportsListId({
        type: 'league',
        regionName: parsed.regionName,
        leagueId: league.id,
      }),
      name: league.name,
    }));
  }

  throw new Error('Nested lists are only supported for regions');
}

/**
 * Unified function to fetch logo items
 * Handles both regular logo sets and sports with their different structures
 */
export async function fetchLogos(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
  shuffle = false,
): Promise<LogoItem[]> {
  // IMPORTANT: Only parse sports list IDs for sports sets
  if (isSportsSet(logoSet)) {
    // Parse the complex sports list ID
    const parsed = parseSportsListIdOrThrow(listId);

    switch (parsed.type) {
      case 'league':
        return fetchSportTeams(parsed.regionName, parsed.leagueId, language, count, shuffle);
      case 'region':
        return fetchAllSportTeamsInRegion(parsed.regionName, language, count, shuffle);
      case 'country':
        return fetchAllSportTeamsInCountry(parsed.countryId, language, count, shuffle);
      case 'custom':
        return fetchSportTeamsInCustomList(parsed.listSlug, language, count, shuffle);
      default: {
        const _exhaustive: never = parsed;
        throw new Error(`Unhandled list type: ${JSON.stringify(_exhaustive)}`);
      }
    }
  }

  // Regular logo sets - use the existing API
  // For non-sports sets, listId is just a simple string like "companies", "countries", etc.
  const query: any = {
    language,
    count: count.toString(),
    shuffle: 'false', // Always false - shuffle client-side
  };

  const res = await client.api.games['guess-logo'].logos[':set'][':list'].$get({
    param: {
      set: logoSet,
      list: listId, // Simple string, not parsed
    },
    query,
  });

  if (!res.ok) {
    throw new Error('Failed to fetch logos');
  }

  return (await res.json()) as LogoItem[];
}
/**
 * Check if a logo set supports nested lists
 */
export function supportsNestedLists(logoSet: LogoSetKey): boolean {
  return isSportsSet(logoSet);
}
