import type { LogoItem, LogoListMetadata, LogoSetKey, SupportedLanguage } from '@guess-logo/shared/types';
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
 * - "region:asia" - All teams in Asia region (Now uses name instead of CUID)
 * - "region:europe:league:jz2o838ptlcjhd9a0vcwzrcq" - Teams in a specific league
 * - "country:saudi-arabia" - All teams in Saudi Arabia
 * - "custom:middle-east" - Custom list
 */
function parseSportsListId(listId: string) {
  const parts = listId.split(':');

  if (parts[0] === 'region') {
    // The region identifier is now the NAME (e.g., "europe"), not the CUID
    const regionName = parts[1];
    if (parts[2] === 'league' && parts[3]) {
      // Format: region:europe:league:101
      return { type: 'league' as const, regionName, leagueId: parts[3] };
    }
    // Format: region:europe
    return { type: 'region' as const, regionName };
  }

  if (parts[0] === 'country') {
    // Format: country:saudi-arabia
    return { type: 'country' as const, countryId: parts[1] };
  }

  if (parts[0] === 'custom') {
    // Format: custom:middle-east
    return { type: 'custom' as const, listSlug: parts[1] };
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
      // IMPORTANT: Use region.name.en (the name) for the public ID part of the URL
      id: `region:${region.name.en}`,
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
    // The API now expects the region NAME
    const leagues = await fetchSportLeagues(parsed.regionName);
    return leagues.map(league => ({
      // Pass the region NAME along with the league CUID for the next level drill-down
      id: `region:${parsed.regionName}:league:${league.id}`,
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
        // Use regionName for the URL, leagueId for the second parameter
        return fetchSportTeams(parsed.regionName, parsed.leagueId, language, count, shuffle);
      case 'region':
        // Use regionName for the URL
        return fetchAllSportTeamsInRegion(parsed.regionName, language, count, shuffle);
      case 'country':
        return fetchAllSportTeamsInCountry(parsed.countryId, language, count, shuffle);
      case 'custom':
        return fetchSportTeamsInCustomList(parsed.listSlug, language, count, shuffle);
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