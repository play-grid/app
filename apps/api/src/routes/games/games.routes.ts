import { GameMetaSchema } from '@guess-logo/shared/schemas';
import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

const tags = ['Games'];

export const listGamesMeta = createRoute({
  path: '/',
  method: 'get',
  tags,
  summary: 'List all registered games',
  description: 'Returns all games registered in the game registry',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      GameMetaSchema.array(),
      'List of available games',
    ),
  },
});

export type ListGamesMetaRoute = typeof listGamesMeta;
