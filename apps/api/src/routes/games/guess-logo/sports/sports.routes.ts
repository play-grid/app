// TODO: split this this is a game-specific routes file
import { logoItemSchema, logoListSchema, logoQuerySchema, sportRegionSchema } from '@guess-logo/shared/schemas';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

const tags = ['Sports'];

// Get sport regions
export const getSportRegions = createRoute({
  path: '/',
  method: 'get',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(sportRegionSchema),
      'Successfully retrieved sport regions',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

// Get all custom sport lists
export const getCustomSportLists = createRoute({
  path: '/custom-lists',
  method: 'get',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        teamsCount: z.number(),
      })),
      'Successfully retrieved custom sport lists',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

// Get leagues in a region
export const getSportLeagues = createRoute({
  path: '/{region}',
  method: 'get',
  tags,
  request: {
    params: z.object({
      region: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(logoListSchema),
      'Successfully retrieved leagues in region',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent( // <-- ADDED 404 response
      z.object({ error: z.string() }),
      'Region not found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid region',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

// Get teams in a specific league
export const getSportTeams = createRoute({
  path: '/{region}/{leagueId}',
  method: 'get',
  tags,
  request: {
    params: z.object({
      region: z.string(),
      leagueId: z.string(),
    }),
    query: logoQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(logoItemSchema),
      'Successfully retrieved teams in league',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'teams not found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid region or league',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

// Get all teams in a region (all leagues combined)
export const getAllSportTeamsInRegion = createRoute({
  path: '/{region}/all',
  method: 'get',
  tags,
  request: {
    params: z.object({
      region: z.string(),
    }),
    query: logoQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(logoItemSchema),
      'Successfully retrieved all teams in region',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid region',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'teams found',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

// Get all teams in a country
export const getAllSportTeamsInCountry = createRoute({
  path: '/country/{countryId}',
  method: 'get',
  tags,
  request: {
    params: z.object({
      countryId: z.string(),
    }),
    query: logoQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(logoItemSchema),
      'Successfully retrieved all teams in country',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid country',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

// Get all teams in a custom list
export const getSportTeamsInCustomList = createRoute({
  path: '/custom/{listSlug}',
  method: 'get',
  tags,
  request: {
    params: z.object({
      listSlug: z.string(),
    }),
    query: logoQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(logoItemSchema),
      'Successfully retrieved all teams in custom list',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Custom list not found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid list',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export const getAvailableCountries = createRoute({
  path: '/countries',
  method: 'get',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(z.object({
        id: z.string(),
        name: z.object({
          en: z.string(),
          ar: z.string().optional(),
        }),
        flag: z.string(),
        teamsCount: z.number(),
      })),
      'Successfully retrieved available countries',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export type GetAvailableCountriesRoute = typeof getAvailableCountries;
export type GetSportRegionsRoute = typeof getSportRegions;
export type GetSportLeaguesRoute = typeof getSportLeagues;
export type GetSportTeamsRoute = typeof getSportTeams;
export type GetAllSportTeamsInRegionRoute = typeof getAllSportTeamsInRegion;
export type GetAllSportTeamsInCountryRoute = typeof getAllSportTeamsInCountry;
export type GetSportTeamsInCustomListRoute = typeof getSportTeamsInCustomList;
export type GetCustomSportListsRoute = typeof getCustomSportLists;
