import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import {
  createGameRoomInputSchema,
  createGameRoomResponseSchema,
  errorSchema,
  generateInviteResponseSchema,
  generateInviteSchema,
  joinGameRoomResponseSchema,
  joinGameRoomSchema,
  messageSchema,
  revokeInviteResponseSchema,
  revokeInviteSchema,
  roomStatsResponseSchema,
  validateInviteResponseSchema,
} from './schemas';

const tags = ['GameRoom'];

export const create = createRoute({
  path: '/',
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
  path: '/{id}/join',
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
  path: '/{id}/ws',
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
  path: '/{id}/stats',
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

export const generateInvite = createRoute({
  path: '/{id}/invite',
  method: 'post',
  request: {
    params: z.object({ id: z.string() }),
    body: jsonContentRequired(
      generateInviteSchema.optional(),
      'Optional expiration time in minutes',
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      generateInviteResponseSchema,
      'Successfully generated invite token',
    ),
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

export const validateInvite = createRoute({
  path: '/{id}/invite/{token}/validate',
  method: 'get',
  request: {
    params: z.object({
      id: z.string(),
      token: z.string(),
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      validateInviteResponseSchema,
      'Invite validation result',
    ),
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

export const revokeInvite = createRoute({
  path: '/{id}/invite',
  method: 'delete',
  request: {
    params: z.object({ id: z.string() }),
    body: jsonContentRequired(
      revokeInviteSchema,
      'Invite token to revoke',
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      revokeInviteResponseSchema,
      'Successfully revoked invite token',
    ),
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
export type GenerateInviteRoute = typeof generateInvite;
export type ValidateInviteRoute = typeof validateInvite;
export type RevokeInviteRoute = typeof revokeInvite;
