import { LogoContentSchema, LogoSetKeySchema } from '@guess-logo/guess-logo';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { LogoListResponseSchema, LogoQuerySchema } from './logos.schemas';

const tags = ['Logos'];

// Route for getting available lists for a set (used in select)
export const getLogoLists = createRoute({
  path: '/{set}',
  method: 'get',
  tags,
  request: {
    params: z.object({
      set: LogoSetKeySchema,
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(LogoListResponseSchema),
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
  path: '/{set}/{list}',
  method: 'get',
  tags,
  request: {
    params: z.object({
      set: LogoSetKeySchema,
      list: z.string(),
    }),
    query: LogoQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(LogoContentSchema),
      'Successfully retrieved logos',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Logo list not found',
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
