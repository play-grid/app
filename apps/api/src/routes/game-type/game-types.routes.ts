// apps/api/src/routes/game-types/game-types.routes.ts
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

const tags = ['GameTypes'];

/**
 * Schema for a game type (derived from GameDefinition.meta)
 */
export const gameTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  minPlayers: z.number(),
  maxPlayers: z.number(),
});

export const listGameTypes = createRoute({
  path: '/game-types',
  method: 'get',
  tags,
  summary: 'List all registered game types',
  description: 'Returns all games registered in the game registry',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(gameTypeSchema),
      'List of available game types',
    ),
  },
});

export type ListGameTypesRoute = typeof listGameTypes;
