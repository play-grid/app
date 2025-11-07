import type { LocaleRecord, LogoItem, LogoList, RawLeague, RawTeam, SportRegionId, SupportedLanguage } from '@guess-logo/shared/types';
import { loadRegion } from '@guess-logo/shared/data/load-region';
import { SPORT_REGION_IDS, SPORT_REGIONS } from '@guess-logo/shared/types';

function createLeagueFetcher(leagueId: number, teams: readonly RawTeam[]) {
  return async (_language: SupportedLanguage): Promise<LogoItem[]> => {
    return teams
      .filter(team => team.leagueId === leagueId)
      .map<LogoItem>(team => ({
        id: team.id,
        name: team.name,
        imageUrl: team.logo,
        eliminated: false,
      }));
  };
}

/** Returns a `fetchItems` callback for all leagues combined. */
// eslint-disable-next-line unused-imports/no-unused-vars
function createAllLeaguesFetcher(teams: readonly RawTeam[]) {
  return async (_language: SupportedLanguage): Promise<LogoItem[]> => {
    return teams.map<LogoItem>(team => ({
      id: team.id,
      name: team.name,
      imageUrl: team.logo,
      eliminated: false,
    }));
  };
}

/* ---------------------------------- */
/* 🌍 Public API */
/* ---------------------------------- */

/** List of all supported regions (localized). */
export function getSportRegions(): Array<{ id: SportRegionId; name: LocaleRecord }> {
  return SPORT_REGIONS;
}

/** Get leagues in a specific region, including fetchers for each. */
export async function getLeaguesInRegion(regionId: SportRegionId): Promise<LogoList[]> {
  const leagues = (await loadRegion(regionId)) as RawLeague[];
  const allTeams = leagues.flatMap(l => l.teams ?? []);

  return leagues.map<LogoList>(league => ({
    id: String(league.id),
    name: { en: league.name, ar: league.name },
    fetchItems: createLeagueFetcher(Number(league.id), allTeams),
  }));
}

/** Get teams for a specific league in a region. */
export async function getTeamsInLeague(
  regionId: SportRegionId,
  leagueId: string,
): Promise<LogoItem[]> {
  const leagues = await getLeaguesInRegion(regionId);
  const league = leagues.find(l => l.id === leagueId);

  if (!league) {
    throw new Error(`League ${leagueId} not found in region ${regionId}`);
  }

  return league.fetchItems('en');
}

/** Get all teams in a given region (combined). */
export async function getAllTeamsInRegion(regionId: SportRegionId): Promise<LogoItem[]> {
  const leagues = (await loadRegion(regionId)) as RawLeague[];
  const allTeams = leagues.flatMap(l => l.teams ?? []);

  return allTeams.map<LogoItem>(team => ({
    id: team.id,
    name: team.name,
    imageUrl: team.logo,
    eliminated: false,
  }));
}

/** Get all teams across all regions. */
export async function getAllSportTeams(): Promise<LogoItem[]> {
  const allTeamsArrays = await Promise.all(
    SPORT_REGION_IDS.map(async (regionId: SportRegionId) => {
      const leagues = (await loadRegion(regionId)) as RawLeague[];
      return leagues.flatMap(l => l.teams ?? []);
    }),
  );

  return allTeamsArrays.flat().map<LogoItem>(team => ({
    id: team.id,
    name: team.name,
    imageUrl: team.logo,
    eliminated: false,
  }));
}

/** Legacy alias (still validated). */
export async function getSportLists(region: SportRegionId): Promise<LogoList[]> {
  return getLeaguesInRegion(region);
}

/** Get all leagues from all regions. */
export async function getAllSportLists(): Promise<LogoList[]> {
  const allLists = await Promise.all(SPORT_REGION_IDS.map(regionId => getLeaguesInRegion(regionId)));
  return allLists.flat();
}
