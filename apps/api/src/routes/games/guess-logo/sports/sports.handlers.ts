import type { Context } from 'hono';
import type {
  GetAllSportTeamsInCountryRoute,
  GetAllSportTeamsInRegionRoute,
  GetSportLeaguesRoute,
  GetSportRegionsRoute,
  GetSportTeamsInCustomListRoute,
  GetSportTeamsRoute,
} from './sports.routes';
import type { AppRouteHandler } from '@/lib/types';
import { shuffleArray } from '@guess-logo/shared/utils';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';
import {
  getAllSportTeamsInCountry as getAllSportTeamsInCountrySer,
  getAllTeamsInCustomList,
  getAllTeamsInRegion,
  getCustomListBySlug,
  getCustomLists,
  getLeaguesInRegion,
  getRegionIdByName,
  getSportRegionsService,
  getTeamsInLeague,
} from './sport-list-service';

async function resolveRegionId(c: Context, db: any, regionName: string) {
  const regionId = await getRegionIdByName(db, regionName);

  if (!regionId) {
    const availableRegions = await getSportRegionsService(db);
    const regionNames = availableRegions.map(r => r.name.en.toLowerCase());

    return {
      id: null,
      response: c.json({
        error: `Region "${regionName}" not found. Available regions are: ${regionNames.join(', ')}.`,
      }, HttpStatusCodes.NOT_FOUND),
    };
  }
  return { id: regionId, response: null };
}

export const getSportRegions: AppRouteHandler<GetSportRegionsRoute> = async (c) => {
  const db = getDB(c);
  try {
    const regions = await getSportRegionsService(db);
    return c.json(regions, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error('Failed to fetch sport regions:', error);
    return c.json({ error: 'Failed to fetch sport regions' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getSportLeagues: AppRouteHandler<GetSportLeaguesRoute> = async (c) => {
  const regionName = c.req.valid('param').region;
  const db = getDB(c);

  try {
    const { id: regionId, response: errorResponse } = await resolveRegionId(c, db, regionName);
    if (errorResponse)
      return errorResponse;

    const leagues = await getLeaguesInRegion(db, regionId);

    const simplifiedLeagues = leagues.map((l: any) => ({
      id: l.id,
      name: l.name,
    }));

    return c.json(simplifiedLeagues, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch leagues for region ${regionName}:`, error);

    return c.json({ error: 'Failed to fetch leagues' }, HttpStatusCodes.BAD_REQUEST);
  }
};

export const getSportTeams: AppRouteHandler<GetSportTeamsRoute> = async (c) => {
  const { region: regionName, leagueId } = c.req.valid('param');
  const { count, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);

  const db = getDB(c);

  try {
    const { id: regionId, response: errorResponse } = await resolveRegionId(c, db, regionName);
    if (errorResponse)
      return errorResponse;

    const cacheKey = `sport:teams:${regionName}:${leagueId}`;

    let allTeams = await getTeamsInLeague(db, regionId, leagueId);

    const cached = await c.env.LOGO_CACHE.get(cacheKey);
    if (!cached) {
      await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(allTeams), { expirationTtl: 86400 });
    }
    else {
      allTeams = JSON.parse(cached);
    }

    const teamsArray = Array.isArray(allTeams) ? allTeams : [];
    const processedTeams = shuffle ? shuffleArray([...teamsArray]).slice(0, countNum) : teamsArray.slice(0, countNum);
    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch teams for league ${leagueId} in region ${regionName}:`, error);
    return c.json({ error: 'Failed to fetch teams' }, HttpStatusCodes.BAD_REQUEST);
  }
};

export const getAllSportTeamsInRegion: AppRouteHandler<GetAllSportTeamsInRegionRoute> = async (c) => {
  const regionName = c.req.valid('param').region;
  const { count, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);

  const db = getDB(c);

  try {
    const { id: regionId, response: errorResponse } = await resolveRegionId(c, db, regionName);
    if (errorResponse)
      return errorResponse;

    const cacheKey = `sport:teams:${regionName}:all`;

    let allTeams = await getAllTeamsInRegion(db, regionId);

    const cached = await c.env.LOGO_CACHE.get(cacheKey);
    if (!cached) {
      await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(allTeams), { expirationTtl: 86400 });
    }
    else {
      allTeams = JSON.parse(cached);
    }

    const teamsArray = Array.isArray(allTeams) ? allTeams : [];
    const processedTeams = shuffle ? shuffleArray([...teamsArray]).slice(0, countNum) : teamsArray.slice(0, countNum);
    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch all teams in region ${regionName}:`, error);
    return c.json({ error: 'Failed to fetch teams' }, HttpStatusCodes.BAD_REQUEST);
  }
};

export const getAllSportTeamsInCountry: AppRouteHandler<GetAllSportTeamsInCountryRoute> = async (c) => {
  const { countryId } = c.req.valid('param');
  const { count, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);

  const cacheKey = `sport:teams:country:${countryId}:all`;
  const db = getDB(c);
  try {
    let allTeams = await getAllSportTeamsInCountrySer(db, countryId);

    const cached = await c.env.LOGO_CACHE.get(cacheKey);
    if (!cached) {
      await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(allTeams), { expirationTtl: 86400 });
    }
    else {
      allTeams = JSON.parse(cached);
    }

    const teamsArray = Array.isArray(allTeams) ? allTeams : [];
    const processedTeams = shuffle ? shuffleArray([...teamsArray]).slice(0, countNum) : teamsArray.slice(0, countNum);

    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch all teams in country ${countryId}:`, error);
    return c.json({ error: 'Failed to fetch teams' }, HttpStatusCodes.BAD_REQUEST);
  }
};

export const getSportTeamsInCustomList: AppRouteHandler<GetSportTeamsInCustomListRoute> = async (c) => {
  const { listSlug } = c.req.valid('param');
  const { count, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);

  const db = getDB(c);

  // Check if list exists
  const list = await getCustomListBySlug(db, listSlug);
  if (!list) {
    const availableLists = await getCustomLists(db);
    const availableListSlugs = availableLists.map(l => l.slug).join(', ');

    return c.json({ error: `Custom list with slug "${listSlug}" not found. Available lists: ${availableListSlugs}` }, HttpStatusCodes.NOT_FOUND);
  }

  const cacheKey = `sport:teams:custom:${listSlug}`;

  try {
    const cached = await c.env.LOGO_CACHE.get(cacheKey);
    let allTeams;
    if (cached) {
      allTeams = JSON.parse(cached);
    }
    else {
      allTeams = await getAllTeamsInCustomList(db, list.id);
      await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(allTeams), { expirationTtl: 86400 });
    }

    const teamsArray = Array.isArray(allTeams) ? allTeams : [];
    const processedTeams = shuffle ? shuffleArray([...teamsArray]).slice(0, countNum) : teamsArray.slice(0, countNum);
    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    const errMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Failed to fetch all teams in custom list ${listSlug}:`, errMessage);
    return c.json({ error: `Failed to fetch teams for custom list: ${errMessage}` }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
