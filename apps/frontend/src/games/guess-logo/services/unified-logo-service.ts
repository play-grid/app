import type { LogoItem, LogoListMetadata, LogoSetKey, SportRegionId, SupportedLanguage } from '@guess-logo/shared/types';
import client from '@/lib/hono-client';
import {
  fetchAllSportTeamsInCountry,
  fetchAllSportTeamsInRegion,
  fetchSportLeagues,
  fetchSportRegions,
  fetchSportTeams,
  fetchSportTeamsInCustomList,
} from './sports-service';

/**
 * Check if the logo set is sports (which uses a different API structure)
 */
function isSportsSet(logoSet: LogoSetKey): boolean {
  return logoSet === 'sports';
}

/**
 * Parse sports listId to determine the type and IDs
 * Format examples:
 * - "region:asia" - All teams in Asia region
 * - "region:asia:league:101" - Teams in a specific league
 * - "country:saudi-arabia" - All teams in Saudi Arabia
 * - "custom:middle-east" - Custom list
 */
function parseSportsListId(listId: string) {
  const parts = listId.split(':');

  if (parts[0] === 'region') {
    const regionId = parts[1] as SportRegionId;
    if (parts[2] === 'league' && parts[3]) {
      // Format: region:asia:league:101
      return { type: 'league' as const, regionId, leagueId: parts[3] };
    }
    // Format: region:asia
    return { type: 'region' as const, regionId };
  }

  if (parts[0] === 'country') {
    // Format: country:saudi-arabia
    return { type: 'country' as const, countryId: parts[1] };
  }

  if (parts[0] === 'custom') {
    // Format: custom:middle-east
    return { type: 'custom' as const, listId: parts[1] };
  }

  throw new Error(`Invalid sports listId format: ${listId}`);
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
      id: `region:${region.id}`,
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

  const parsed = parseSportsListId(parentListId);

  if (parsed.type === 'region') {
    // Fetch leagues in this region
    const leagues = await fetchSportLeagues(parsed.regionId);
    return leagues.map(league => ({
      id: `region:${parsed.regionId}:league:${league.id}`,
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
  if (isSportsSet(logoSet)) {
    const parsed = parseSportsListId(listId);

    switch (parsed.type) {
      case 'league':
        return fetchSportTeams(parsed.regionId, parsed.leagueId, language, count, shuffle);
      case 'region':
        return fetchAllSportTeamsInRegion(parsed.regionId, language, count, shuffle);
      case 'country':
        return fetchAllSportTeamsInCountry(parsed.countryId, language, count, shuffle);
      case 'custom':
        return fetchSportTeamsInCustomList(parsed.listId, language, count, shuffle);
    }
  }

  // Regular logo sets - use the existing API
  const query: any = {
    language,
    count: count.toString(),
    shuffle: shuffle ? 'true' : 'false',
  };

  if (shuffle) {
    query._cb = new Date().getTime().toString(); // Cache buster
  }

  const res = await client.api.games['guess-logo'].logos[':set'][':list'].$get({
    param: {
      set: logoSet,
      list: listId,
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
