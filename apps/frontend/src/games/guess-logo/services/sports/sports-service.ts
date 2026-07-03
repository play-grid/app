import type { LocaleRecord, SupportedLanguage } from '@playgrid/shared/types';

import type { LogoItem } from '../../stores/game-state.types';

import client from '@/lib/hono-client';

export interface CustomSportList {
  id: string;
  name: LocaleRecord;
  slug: string;
}

export interface SportCountry {
  id: string;
  name: LocaleRecord;
  flag: string;
  logosCount: number;
}

export interface SportRegion {
  id: string;
  name: LocaleRecord;
}
/**
 * Fetch all sport regions (top-level hierarchy)
 */
export async function fetchSportRegions(): Promise<SportRegion[]> {
  const res = await client.api.games['guess-logo'].sports.$get();

  if (!res.ok) {
    throw new Error('Failed to fetch sport regions');
  }

  return res.json();
}

export interface SportLeague {
  id: string;
  name: LocaleRecord;
}

/**
 * Fetch leagues within a specific region
 * @param regionName The English name of the region (e.g., 'europe')
 */
export async function fetchSportLeagues(regionName: string): Promise<SportLeague[]> {
  const res = await client.api.games['guess-logo'].sports[':region'].$get({
    // Use the region NAME in the URL param
    param: { region: regionName },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch leagues for region: ${regionName}`);
  }

  return res.json();
}

/**
 * Fetch teams in a specific league
 * @param regionName The English name of the region (e.g., 'europe')
 */
export async function fetchSportTeams(
  regionName: string,
  leagueId: string,
  language: SupportedLanguage,
  count = 80,
  shuffle = false,
) {
  const query: any = {
    language,
    count: count.toString(),
    shuffle: shuffle ? 'true' : 'false',
  };

  if (shuffle) {
    query._cb = new Date().getTime().toString(); // Cache buster
  }

  const res = await client.api.games['guess-logo'].sports[':region'][':leagueId'].$get({
    param: {
      region: regionName, // Use the region NAME here
      leagueId,
    },
    query,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch teams for league: ${leagueId} in region: ${regionName}`);
  }

  return (await res.json()) as LogoItem[];
}

/**
 * Fetch all teams in a region (combined from all leagues)
 * @param regionName The English name of the region (e.g., 'europe')
 */
export async function fetchAllSportTeamsInRegion(
  regionName: string,
  language: SupportedLanguage,
  count = 80,
  shuffle = false,
) {
  const query: any = {
    language,
    count: count.toString(),
    shuffle: shuffle ? 'true' : 'false',
  };

  if (shuffle) {
    query._cb = new Date().getTime().toString(); // Cache buster
  }

  const res = await client.api.games['guess-logo'].sports[':region'].all.$get({
    param: { region: regionName }, // Use the region NAME here
    query,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch all teams in region: ${regionName}`);
  }

  return (await res.json()) as LogoItem[];
}

/**
 * Fetch all teams in a country
 */
export async function fetchAllSportTeamsInCountry(
  countryId: string,
  language: SupportedLanguage,
  count = 80,
  shuffle = false,
) {
  const query: any = {
    language,
    count: count.toString(),
    shuffle: shuffle ? 'true' : 'false',
  };

  if (shuffle) {
    query._cb = new Date().getTime().toString(); // Cache buster
  }

  const res = await client.api.games['guess-logo'].sports.country[':countryId'].$get({
    param: { countryId },
    query,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch teams in country: ${countryId}`);
  }

  return (await res.json()) as LogoItem[];
}

/**
 * Fetch teams from a custom list (e.g., "middle-east")
 */
export async function fetchSportTeamsInCustomList(
  listSlug: string,
  language: SupportedLanguage,
  count = 80,
  shuffle = false,
) {
  const query: any = {
    language,
    count: count.toString(),
    shuffle: shuffle ? 'true' : 'false',
  };

  if (shuffle) {
    query._cb = new Date().getTime().toString(); // Cache buster
  }

  const res = await client.api.games['guess-logo'].sports.custom[':listSlug'].$get({
    param: { listSlug },
    query,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch teams in custom list: ${listSlug}`);
  }

  return (await res.json()) as LogoItem[];
}

/**
 * Fetch all custom sport lists
 */
export async function fetchCustomSportLists(): Promise<CustomSportList[]> {
  const res = await client.api.games['guess-logo'].sports['custom-lists'].$get();

  if (!res.ok) {
    throw new Error('Failed to fetch custom sport lists');
  }

  return res.json();
}

export async function fetchAvailableCountries(): Promise<SportCountry[]> {
  const res = await client.api.games['guess-logo'].sports.countries.$get();

  if (!res.ok) {
    throw new Error('Failed to fetch available countries');
  }

  return res.json();
}
