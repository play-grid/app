import type { Context } from 'hono';
import type {
  GetAllSportTeamsInCountryRoute,
  GetAllSportTeamsInRegionRoute,
  GetAvailableCountriesRoute,
  GetCustomSportListsRoute,
  GetSportLeaguesRoute,
  GetSportRegionsRoute,
  GetSportTeamsInCustomListRoute,
  GetSportTeamsRoute,
} from './sports.routes';
import type { AppRouteHandler } from '@/lib/types';
import { shuffleArray } from '@playgrid/shared/utils';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';
import { logger } from '@/utils/logger';
import {
  getAllSportTeamsInCountry as getAllSportTeamsInCountrySer,
  getAllTeamsInCustomList,
  getAllTeamsInRegion,
  getAvailableCountries as getAvailableCountriesSer,
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
    return c.json(
      regions.map(r => ({ ...r, logosCount: r.teamsCount })),
      HttpStatusCodes.OK,
    );
  }
  catch (error) {
    logger.error(error, 'Failed to fetch sport regions:');
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

    return c.json(
      leagues.map(l => ({
        id: l.id,
        name: l.name,
        logosCount: l.teamsCount,
      })),
      HttpStatusCodes.OK,
    );
  }
  catch (error) {
    logger.error(error, `Failed to fetch leagues for region ${regionName}:`);

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

    const teamsArray = (Array.isArray(allTeams) ? allTeams : []).map(team => ({
      ...team,
      type: 'sports' as const,
    }));
    const processedTeams = shuffle ? shuffleArray([...teamsArray]).slice(0, countNum) : teamsArray.slice(0, countNum);
    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, `Failed to fetch teams for league ${leagueId} in region ${regionName}:`);
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

    const teamsArray = (Array.isArray(allTeams) ? allTeams : []).map(team => ({
      ...team,
      type: 'sports' as const,
    }));
    const processedTeams = shuffle ? shuffleArray([...teamsArray]).slice(0, countNum) : teamsArray.slice(0, countNum);
    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, `Failed to fetch all teams in region ${regionName}:`);
    return c.json({ error: 'Failed to fetch teams' }, HttpStatusCodes.BAD_REQUEST);
  }
};

export const getCustomSportLists: AppRouteHandler<GetCustomSportListsRoute> = async (c) => {
  const db = getDB(c);
  try {
    const lists = await getCustomLists(db);
    return c.json(
      lists.map(l => ({
        id: l.id,
        slug: l.slug,
        name: {
          en: l.name,
          ar: l.name,
        },
        logosCount: l.teamsCount,
      })),
      HttpStatusCodes.OK,
    );
  }
  catch (error) {
    logger.error(error, 'Failed to fetch custom sport lists:');
    return c.json({ error: 'Failed to fetch custom sport lists' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
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

    const teamsArray = (Array.isArray(allTeams) ? allTeams : []).map(team => ({
      ...team,
      type: 'sports' as const,
    }));
    const processedTeams = shuffle ? shuffleArray([...teamsArray]).slice(0, countNum) : teamsArray.slice(0, countNum);

    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, `Failed to fetch all teams in country ${countryId}:`);
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
    logger.error(error, `Failed to fetch all teams in custom list ${listSlug}:`);
    return c.json({ error: `Failed to fetch teams for custom list: ${errMessage}` }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getAvailableCountries: AppRouteHandler<GetAvailableCountriesRoute> = async (c) => {
  const db = getDB(c);
  try {
    const countries = await getAvailableCountriesSer(db);
    const countryNameMap: Record<string, { en: string; ar?: string; flag: string }> = {
      'saudi-arabia': { en: 'Saudi Arabia', ar: 'السعودية', flag: '🇸🇦' },
      'uae': { en: 'UAE', ar: 'الإمارات', flag: '🇦🇪' },
      'qatar': { en: 'Qatar', ar: 'قطر', flag: '🇶🇦' },
      'egypt': { en: 'Egypt', ar: 'مصر', flag: '🇪🇬' },
      'argentina': { en: 'Argentina', ar: 'الأرجنتين', flag: '🇦🇷' },
      'spain': { en: 'Spain', ar: 'إسبانيا', flag: '🇪🇸' },
      'england': { en: 'England', ar: 'إنجلترا', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      'italy': { en: 'Italy', ar: 'إيطاليا', flag: '🇮🇹' },
      'germany': { en: 'Germany', ar: 'ألمانيا', flag: '🇩🇪' },
      'france': { en: 'France', ar: 'فرنسا', flag: '🇫🇷' },
      'portugal': { en: 'Portugal', ar: 'البرتغال', flag: '🇵🇹' },
      'netherlands': { en: 'Netherlands', ar: 'هولندا', flag: '🇳🇱' },
      'turkey': { en: 'Turkey', ar: 'تركيا', flag: '🇹🇷' },
      'brazil': { en: 'Brazil', ar: 'البرازيل', flag: '🇧🇷' },
    };

    const enrichedCountries = countries.map(country => ({
      id: country.id,
      name: {
        en: countryNameMap[country.id]?.en || country.id,
        ar: countryNameMap[country.id]?.ar || '',
      },
      flag: countryNameMap[country.id]?.flag || '🌍',
      logosCount: country.teamsCount,
    }));

    return c.json(enrichedCountries, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, 'Failed to fetch available countries:');
    return c.json({ error: 'Failed to fetch available countries' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
