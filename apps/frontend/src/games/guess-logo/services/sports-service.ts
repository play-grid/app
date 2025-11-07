import type { LogoItem, SportLeague, SportRegion, SportRegionId, SupportedLanguage } from '@guess-logo/shared/types';
import client from '@/lib/hono-client';

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

/**
 * Fetch leagues within a specific region
 */
export async function fetchSportLeagues(regionId: SportRegionId): Promise<SportLeague[]> {
  const res = await client.api.games['guess-logo'].sports[':region'].$get({
    param: { region: regionId },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch leagues for region: ${regionId}`);
  }

  return res.json();
}

/**
 * Fetch teams in a specific league
 */
export async function fetchSportTeams(
  regionId: SportRegionId,
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
      region: regionId,
      leagueId,
    },
    query,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch teams for league: ${leagueId} in region: ${regionId}`);
  }

  return (await res.json()) as LogoItem[];
}

/**
 * Fetch all teams in a region (combined from all leagues)
 */
export async function fetchAllSportTeamsInRegion(
  regionId: SportRegionId,
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
    param: { region: regionId },
    query,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch all teams in region: ${regionId}`);
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
  listId: string,
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

  const res = await client.api.games['guess-logo'].sports.custom[':listId'].$get({
    param: { listId },
    query,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch teams in custom list: ${listId}`);
  }

  return (await res.json()) as LogoItem[];
}
