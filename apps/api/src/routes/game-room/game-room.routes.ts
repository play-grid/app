import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema, IdParamsSchema } from 'stoker/openapi/schemas';

const tags = ['GameRoom'];

// Base schema for creating a game room - keep this for createErrorSchema
export const createGameRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(50, 'Room name too long'),
  maxPlayers: z.number().int().min(2).max(8).optional(),
  gameType: z.enum(['logo-guess', 'quick-match']).optional(),
  isPrivate: z.boolean().optional(),
});

// Input schema with preprocessing to handle defaults
export const createGameRoomInputSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(50, 'Room name too long'),
  maxPlayers: z.number().int().min(2).max(8).optional().default(4),
  gameType: z.enum(['logo-guess', 'quick-match']).optional().default('logo-guess'),
  isPrivate: z.boolean().optional().default(false),
}).transform(data => ({
  name: data.name,
  maxPlayers: data.maxPlayers ?? 4,
  gameType: data.gameType ?? 'logo-guess' as const,
  isPrivate: data.isPrivate ?? false,
}));

// Schema for game room response
export const gameRoomResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  maxPlayers: z.number(),
  currentPlayers: z.number(),
  gameType: z.string(),
  isPrivate: z.boolean(),
  status: z.enum(['waiting', 'active', 'finished']),
  createdAt: z.string(),
  websocketUrl: z.string(),
});

// Simple error schema
const simpleErrorSchema = z.object({
  error: z.string(),
});

// Message schema for handler errors
const messageSchema = z.object({
  message: z.string(),
});

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
      gameRoomResponseSchema,
      'The created game room',
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

export const websocketUpgrade = createRoute({
  path: '/game-room/{id}/ws',
  method: 'get',
  request: {
    params: IdParamsSchema,
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
      simpleErrorSchema,
      'Invalid WebSocket upgrade request',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      simpleErrorSchema,
      'Game room not found',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      simpleErrorSchema,
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
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        totalConnections: z.number(),
        maxPlayers: z.number(),
        roomConfig: z.object({
          roomId: z.string(),
          name: z.string(),
          maxPlayers: z.number(),
          gameType: z.string(),
          isPrivate: z.boolean(),
          createdAt: z.string(),
        }).nullable(),
        sessions: z.array(z.object({
          roomId: z.string(),
          playerId: z.string().optional(),
          joinedAt: z.number(),
          duration: z.number(),
        })),
      }),
      'Room statistics',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      simpleErrorSchema,
      'Game room not found',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      simpleErrorSchema,
      'Internal server error',
    ),
  },
});

export type CreateRoute = typeof create;
export type WebSocketUpgradeRoute = typeof websocketUpgrade;
export type GetRoomStatsRoute = typeof getRoomStats;
