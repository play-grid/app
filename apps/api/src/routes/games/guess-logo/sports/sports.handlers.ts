import type { LogoItem } from '@guess-logo/shared/types';
import type { GetAllSportTeamsInCountryRoute, GetAllSportTeamsInRegionRoute, GetSportLeaguesRoute, GetSportRegionsRoute, GetSportTeamsRoute } from './sports.routes';
import type { AppRouteHandler } from '@/lib/types';
import { shuffleArray } from '@guess-logo/shared/utils';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getAllSportTeamsInCountry as getAllSportTeamsInCountryService, getAllTeamsInRegion, getLeaguesInRegion, getSportRegions as getSportRegionsService, getTeamsInLeague } from './sport-list-service';

// Handler to get sport regions
export const getSportRegions: AppRouteHandler<GetSportRegionsRoute> = async (c) => {
  try {
    const regions = getSportRegionsService();
    return c.json(regions, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error('Failed to fetch sport regions:', error);
    return c.json(
      { error: 'Failed to fetch sport regions' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

// Handler to get leagues in a region
export const getSportLeagues: AppRouteHandler<GetSportLeaguesRoute> = async (c) => {
  const { region } = c.req.valid('param');

  try {
    const leagues = await getLeaguesInRegion(region);

    // Return only id and name
    const simplifiedLeagues = leagues.map(league => ({
      id: league.id,
      name: league.name,
    }));

    return c.json(simplifiedLeagues, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch leagues for region ${region}:`, error);
    return c.json(
      { error: 'Failed to fetch leagues' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

// Handler to get teams in a specific league
export const getSportTeams: AppRouteHandler<GetSportTeamsRoute> = async (c) => {
  const { region, leagueId } = c.req.valid('param');
  const { count, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);

  const cacheKey = `sport:teams:${region}:${leagueId}`;

  try {
    let allTeams: LogoItem[];

    // Check cache
    const cached = await c.env.LOGO_CACHE.get(cacheKey);
    if (cached) {
      allTeams = JSON.parse(cached);
    }
    else {
      allTeams = await getTeamsInLeague(region, leagueId);
      await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(allTeams), {
        expirationTtl: 86400,
      });
    }

    let processedTeams: LogoItem[];

    if (shuffle === true) {
      const shuffledTeams = shuffleArray([...allTeams]);
      processedTeams = shuffledTeams.slice(0, countNum);
    }
    else {
      processedTeams = allTeams.slice(0, countNum);
    }

    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch teams for league ${leagueId} in region ${region}:`, error);
    return c.json(
      { error: 'Failed to fetch teams' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

// Handler to get all teams in a region (all leagues combined)
export const getAllSportTeamsInRegion: AppRouteHandler<GetAllSportTeamsInRegionRoute> = async (c) => {
  const { region } = c.req.valid('param');
  const { count, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);

  const cacheKey = `sport:teams:${region}:all`;

  try {
    let allTeams: LogoItem[];

    // Check cache
    const cached = await c.env.LOGO_CACHE.get(cacheKey);
    if (cached) {
      allTeams = JSON.parse(cached);
    }
    else {
      allTeams = await getAllTeamsInRegion(region);
      await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(allTeams), {
        expirationTtl: 86400,
      });
    }

    let processedTeams: LogoItem[];

    if (shuffle === true) {
      const shuffledTeams = shuffleArray([...allTeams]);
      processedTeams = shuffledTeams.slice(0, countNum);
    }
    else {
      processedTeams = allTeams.slice(0, countNum);
    }

    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch all teams in region ${region}:`, error);
    return c.json(
      { error: 'Failed to fetch teams' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

// Handler to get all teams in a country
export const getAllSportTeamsInCountry: AppRouteHandler<GetAllSportTeamsInCountryRoute> = async (c) => {
  const { countryId } = c.req.valid('param');
  const { count, shuffle } = c.req.valid('query');
  const countNum = Math.min(Number.parseInt(count, 10), 100);

  const cacheKey = `sport:teams:country:${countryId}:all`;

  try {
    let allTeams: LogoItem[];

    // Check cache
    const cached = await c.env.LOGO_CACHE.get(cacheKey);
    if (cached) {
      allTeams = JSON.parse(cached);
    }
    else {
      allTeams = await getAllSportTeamsInCountryService(countryId);
      await c.env.LOGO_CACHE.put(cacheKey, JSON.stringify(allTeams), {
        expirationTtl: 86400,
      });
    }

    let processedTeams: LogoItem[];

    if (shuffle === true) {
      const shuffledTeams = shuffleArray([...allTeams]);
      processedTeams = shuffledTeams.slice(0, countNum);
    }
    else {
      processedTeams = allTeams.slice(0, countNum);
    }

    return c.json(processedTeams, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error(`Failed to fetch all teams in country ${countryId}:`, error);
    return c.json(
      { error: 'Failed to fetch teams' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};
