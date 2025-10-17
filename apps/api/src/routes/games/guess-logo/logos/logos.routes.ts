import {
  logoItemSchema,
  logoListSchema,
  logoQuerySchema,
  logoSetSchema,
} from '@guess-logo/shared/schemas';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

const tags = ['Logos'];

// Route for getting available lists for a set (used in select)
export const getLogoLists = createRoute({
  path: '/logos/{set}',
  method: 'get',
  tags,
  request: {
    params: z.object({
      set: logoSetSchema,
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(logoListSchema),
      'Successfully retrieved available logo lists',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid logo set',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

// Route for getting logos by set and list
export const getLogosBySetAndList = createRoute({
  path: '/logos/{set}/{list}',
  method: 'get',
  tags,
  request: {
    params: z.object({
      set: logoSetSchema,
      list: z.string(),
    }),
    query: logoQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(logoItemSchema),
      'Successfully retrieved logos',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid request parameters',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export type GetLogoListsRoute = typeof getLogoLists;
export type GetLogosBySetAndListRoute = typeof getLogosBySetAndList;
