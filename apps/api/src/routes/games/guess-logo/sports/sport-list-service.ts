import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { and, eq } from 'drizzle-orm';
import * as schema from './sports.tables';

type DB = DrizzleD1Database<typeof schema>;

export async function getRegionIdByName(db: DB, regionName: string) {
  const region = await db.select({
    id: schema.sportRegions.id,
  })
    .from(schema.sportRegions)
    .where(eq(schema.sportRegions.name_en, regionName))
    .limit(1);

  return region[0]?.id;
}

export async function getSportRegionsService(db: DB) {
  const regions = await db.query.sportRegions.findMany();

  return regions.map(region => ({
    id: region.id,
    name: {
      en: region.name_en,
      ar: region.name_ar,
    },
  }));
}

export async function getLeaguesInRegion(db: DB, regionId: string) {
  const leagues = await db.query.leagues.findMany({
    where: eq(schema.leagues.regionId, regionId),
    with: {
      teams: true,
    },
  });

  return leagues.map(league => ({
    id: league.id,
    name: {
      en: league.name,
      ar: league.name,
    },
    fetchItems: async () => {
      return league.teams.map(team => ({
        id: team.id,
        name: team.name,
        imageUrl: team.logo,
      }));
    },
  }));
}

export async function getTeamsInLeague(db: DB, regionId: string, leagueId: string) {
  const league = await db.query.leagues.findFirst({
    where: and(
      eq(schema.leagues.id, leagueId),
      eq(schema.leagues.regionId, regionId),
    ),
    with: {
      teams: true,
    },
  });

  if (!league) {
    throw new Error(`League ${leagueId} not found in region ${regionId}`);
  }

  return league.teams.map(team => ({
    id: team.id,
    name: team.name,
    imageUrl: team.logo,
  }));
}

export async function getAllTeamsInRegion(db: DB, regionId: string) {
  const leaguesWithTeams = await db.query.leagues.findMany({
    where: eq(schema.leagues.regionId, regionId),
    with: {
      teams: true,
    },
  });

  const allTeams = leaguesWithTeams.flatMap(league => league.teams);

  return allTeams.map(team => ({
    id: team.id,
    name: team.name,
    imageUrl: team.logo,
  }));
}

export async function getAllSportTeamsInCountry(db: DB, countryId: string) {
  const leagues = await db.query.leagues.findMany({
    where: eq(schema.leagues.country, countryId),
    with: {
      teams: true,
    },
  });

  const allTeams = leagues.flatMap(league => league.teams);

  return allTeams.map(team => ({
    id: team.id,
    name: team.name,
    imageUrl: team.logo,
  }));
}

export async function getAllTeamsInCustomList(db: DB, listId: string) {
  const listItems = await db.query.customListItems.findMany({
    where: eq(schema.customListItems.listId, listId),
    with: {
      team: true,
    },
  });

  return listItems.map(item => ({
    id: item.team.id,
    name: item.team.name,
    imageUrl: item.team.logo,
  }));
}

export const getSportLists = getLeaguesInRegion;

export async function getAllSportLists(db: DB) {
  const regions = await getSportRegionsService(db);
  const allLeagues = [];

  for (const region of regions) {
    const leagues = await getLeaguesInRegion(db, region.id);
    allLeagues.push(...leagues);
  }

  return allLeagues;
}
