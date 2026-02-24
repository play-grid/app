import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

const syncResponseSchema = z.object({
  inserted: z.number(),
  updated: z.number(),
  skipped: z.number(),
  errors: z.number(),
  duration: z.number(),
}).openapi('SyncResult');

export const syncFootballPlayers = createRoute({
  path: '/sync/football-players',
  method: 'post',
  operationId: 'syncFootballPlayers',
  tags: ['Admin Sync'],
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      syncResponseSchema,
      'Sync result',
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ error: z.string() }),
      'Unauthorized',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Sync failed',
    ),
  },
});

export const syncFootballTeams = createRoute({
  path: '/sync/football-teams',
  method: 'post',
  operationId: 'syncFootballTeams',
  tags: ['Admin Sync'],
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      syncResponseSchema,
      'Sync result',
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ error: z.string() }),
      'Unauthorized',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Sync failed',
    ),
  },
});

export type SyncFootballPlayersRoute = typeof syncFootballPlayers;
export type SyncFootballTeamsRoute = typeof syncFootballTeams;
