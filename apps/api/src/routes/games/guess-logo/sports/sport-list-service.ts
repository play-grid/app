import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { and, desc, eq, sql } from 'drizzle-orm';
import { logger } from '@/utils/logger';
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
  const regions = await db.select({
    id: schema.sportRegions.id,
    name_en: schema.sportRegions.name_en,
    name_ar: schema.sportRegions.name_ar,
    teamsCount: sql<number>`count(${schema.teams.id})`.mapWith(Number),
  })
    .from(schema.sportRegions)
    .leftJoin(schema.leagues, eq(schema.sportRegions.id, schema.leagues.regionId))
    .leftJoin(schema.teams, eq(schema.leagues.id, schema.teams.leagueId))
    .groupBy(schema.sportRegions.id)
    .orderBy(desc(sql`count(${schema.teams.id})`));

  return regions.map(region => ({
    id: region.id,
    name: {
      en: region.name_en,
      ar: region.name_ar,
    },
    teamsCount: region.teamsCount || 0,
  }));
}

export async function getLeaguesInRegion(db: DB, regionId: string) {
  const leagues = await db.query.leagues.findMany({
    where: eq(schema.leagues.regionId, regionId),
    with: {
      teams: true,
    },
  });

  const leaguesWithCount = leagues.map(league => ({
    ...league,
    teamsCount: league.teams.length,
  }));

  leaguesWithCount.sort((a, b) => b.teamsCount - a.teamsCount);

  return leaguesWithCount.map(league => ({
    id: league.id,
    name: {
      en: league.name,
      ar: league.name,
    },
    teamsCount: league.teamsCount,
    fetchItems: async () => {
      return league.teams.map(team => ({
        id: team.id,
        name: team.name,
        imageUrl: team.logoUrl,
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
    imageUrl: team.logoUrl,
  }));
}

export async function getAllTeamsInRegion(db: DB, regionId: string) {
  const allTeams = await db.select({
    id: schema.teams.id,
    name: schema.teams.name,
    imageUrl: schema.teams.logoUrl,
  })
    .from(schema.teams)
    .innerJoin(schema.leagues, eq(schema.teams.leagueId, schema.leagues.id))
    .where(eq(schema.leagues.regionId, regionId));

  return allTeams;
}

export async function getAllSportTeamsInCountry(db: DB, countryId: string) {
  const allTeams = await db.select({
    id: schema.teams.id,
    name: schema.teams.name,
    imageUrl: schema.teams.logoUrl,
  })
    .from(schema.teams)
    .innerJoin(schema.leagues, eq(schema.teams.leagueId, schema.leagues.id))
    .where(eq(schema.leagues.country, countryId));

  return allTeams;
}

export async function getAllTeamsInCustomList(db: DB, listId: string) {
  try {
    const listItems = await db.query.customListItems.findMany({
      where: eq(schema.customListItems.listId, listId),
      with: {
        team: true,
      },
    });

    if (listItems.some(item => !item.team)) {
      const itemsWithoutTeam = listItems.filter(item => !item.team).map(item => item.id);
      logger.warn({ itemsWithoutTeam }, `[getAllTeamsInCustomList] Some list items for listId "${listId}" are missing the 'team' relation.`);
    }

    return listItems
      .filter(item => !!item.team)
      .map(item => ({
        id: item.team.id,
        name: item.team.name,
        imageUrl: item.team.logoUrl,
      }));
  }
  catch (error) {
    logger.error(error, `[getAllTeamsInCustomList] Error fetching teams for listId: "${listId}"`);
    throw new Error(`Failed to fetch teams for custom list ${listId}`);
  }
}

export async function getAllSportTeams(db: DB) {
  const allTeams = await db.query.teams.findMany();
  return allTeams.map(team => ({
    id: team.id,
    name: team.name,
    imageUrl: team.logoUrl,
  }));
}

export async function getAvailableCountries(db: DB) {
  const countriesWithCount = await db.select({
    id: schema.leagues.country,
    teamsCount: sql<number>`count(${schema.teams.id})`.mapWith(Number),
  })
    .from(schema.leagues)
    .leftJoin(schema.teams, eq(schema.leagues.id, sql`${schema.teams.leagueId}`))
    .groupBy(schema.leagues.country)
    .orderBy(desc(sql`count(${schema.teams.id})`));

  return countriesWithCount;
}

export async function getCustomListById(db: DB, listId: string) {
  const list = await db.query.customLists.findFirst({
    where: eq(schema.customLists.id, listId),
  });
  return list;
}

export async function getCustomListBySlug(db: DB, listSlug: string) {
  const list = await db.query.customLists.findFirst({
    where: eq(schema.customLists.slug, listSlug),
  });
  return list;
}

export async function getCustomLists(db: DB) {
  const lists = await db.select({
    id: schema.customLists.id,
    name: schema.customLists.name,
    slug: schema.customLists.slug,
    teamsCount: sql<number>`count(${schema.customListItems.id})`.mapWith(Number),
  })
    .from(schema.customLists)
    .leftJoin(schema.customListItems, eq(schema.customLists.id, schema.customListItems.listId))
    .groupBy(schema.customLists.id)
    .orderBy(desc(sql`count(${schema.customListItems.id})`));

  return lists;
}

export const getSportLists = getLeaguesInRegion;

export async function getAllSportLists(db: DB) {
  const allLeagues = await db.query.leagues.findMany({
    with: {
      teams: true,
    },
  });

  return allLeagues.map(league => ({
    id: league.id,
    name: {
      en: league.name,
      ar: league.name,
    },
    fetchItems: async () => {
      return league.teams.map(team => ({
        id: team.id,
        name: team.name,
        imageUrl: team.logoUrl,
      }));
    },
  }));
}
