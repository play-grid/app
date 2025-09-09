import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

const tags = ['GameType'];

export const gameTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const getGameTypes = createRoute({
  path: '/game-types',
  method: 'get',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(gameTypeSchema),
      'A list of available game types',
    ),
    [HttpStatusCodes.NOT_MODIFIED]: {
      description: 'Not Modified',
    },
  },
});

export type GetGameTypesRoute = typeof getGameTypes;
