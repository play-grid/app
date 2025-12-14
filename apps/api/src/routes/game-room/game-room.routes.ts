import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import {
  createGameRoomInputSchema,
  createGameRoomResponseSchema,
  errorSchema,
  joinGameRoomResponseSchema,
  joinGameRoomSchema,
  messageSchema,
  roomStatsResponseSchema,
} from './schemas';

const tags = ['GameRoom'];

export const create = createRoute({
  path: '/game-room',
  method: 'post',
  request: {
    body: jsonContentRequired(
      createGameRoomInputSchema,
      'The GameRoom to create',
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      createGameRoomResponseSchema,
      'The created game room',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      'Invalid game type or player count',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createGameRoomInputSchema),
      'The validation error(s)',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      messageSchema,
      'Internal server error',
    ),
  },
});

export const join = createRoute({
  path: '/game-room/{id}/join',
  method: 'post',
  request: {
    params: z.object({ id: z.string() }),
    body: jsonContentRequired(
      joinGameRoomSchema,
      'The player to add to the room',
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      joinGameRoomResponseSchema,
      'Successfully joined the game room',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      'Room is full or invalid request',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      errorSchema,
      'Game room not found',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(joinGameRoomSchema),
      'The validation error(s)',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      errorSchema,
      'Internal server error',
    ),
  },
});

export const websocketUpgrade = createRoute({
  path: '/game-room/{id}/ws',
  method: 'get',
  request: {
    params: z.object({ id: z.string() }),
    headers: z.object({
      'upgrade': z.string().optional(),
      'connection': z.string().optional(),
      'sec-websocket-key': z.string().optional(),
      'sec-websocket-version': z.string().optional(),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.SWITCHING_PROTOCOLS]: {
      description: 'WebSocket connection established',
    },
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      'Invalid WebSocket upgrade request',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      errorSchema,
      'Internal server error',
    ),
  },
});

export const getRoomStats = createRoute({
  path: '/game-room/{id}/stats',
  method: 'get',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(roomStatsResponseSchema, 'Room statistics'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      errorSchema,
      'Game room not found',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      errorSchema,
      'Internal server error',
    ),
  },
});

export type CreateRoute = typeof create;
export type WebSocketUpgradeRoute = typeof websocketUpgrade;
export type GetRoomStatsRoute = typeof getRoomStats;
export type JoinRoute = typeof join;
