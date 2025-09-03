import type { GameRoomStats } from '../../lib/game-room.do';
import type { AppRouteHandler } from '../../lib/types';
import type { CreateRoute, WebSocketUpgradeRoute } from './game-room.routes';

import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  try {
    const body = c.req.valid('json');

    // Generate a unique room ID
    const roomId = crypto.randomUUID();

    // Get the Durable Object stub
    const id = c.env.GAME_ROOM.idFromName(roomId);
    const stub = c.env.GAME_ROOM.get(id);

    // Initialize the room with the provided configuration
    const initResponse = await stub.fetch('http://internal/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        roomId,
      }),
    });

    if (!initResponse.ok) {
      throw new Error('Failed to initialize game room');
    }

    // Construct WebSocket URL (this would be your actual domain)
    const websocketUrl = `wss://${c.req.header('host')}/api/game-room/${roomId}/ws`;

    const gameRoom = {
      id: roomId,
      name: body.name,
      maxPlayers: body.maxPlayers,
      currentPlayers: 0,
      gameType: body.gameType,
      isPrivate: body.isPrivate,
      status: 'waiting' as const,
      createdAt: new Date().toISOString(),
      websocketUrl,
    };

    return c.json(gameRoom, HttpStatusCodes.CREATED);
  }
  catch (error) {
    console.error('Error creating game room:', error);
    // Return a 500 error with a simple message schema instead of createErrorSchema
    return c.json(
      { message: 'Failed to create game room' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const websocketUpgrade: AppRouteHandler<WebSocketUpgradeRoute> = async (c) => {
  try {
    const { id: roomId } = c.req.valid('param');

    // Validate WebSocket headers
    const upgradeHeader = c.req.header('upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return c.json(
        { error: 'Expected Upgrade: websocket' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    // Get the Durable Object stub
    const id = c.env.GAME_ROOM.idFromName(roomId.toString());
    const stub = c.env.GAME_ROOM.get(id);

    // Forward the WebSocket upgrade request to the Durable Object
    const response = await stub.fetch(c.req.raw);

    return response;
  }
  catch (error) {
    console.error('Error upgrading to WebSocket:', error);
    return c.json(
      { error: 'Failed to establish WebSocket connection' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getGameRoomStats = createRoute({
  method: 'get',
  path: '/game-room/:id/stats',
  summary: 'Get game room stats',
  parameters: [
    {
      in: 'path',
      name: 'id',
      schema: { type: 'string' },
      required: true,
    },
  ],
  responses: {
    200: {
      description: 'Game room stats',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              totalConnections: { type: 'number' },
              maxPlayers: { type: 'number' },
              roomConfig: { type: 'object' },
              sessions: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    },
  },
  handler: async (c) => {
    const { id: roomId } = c.req.valid('param');
    const id = c.env.GAME_ROOM.idFromName(String(roomId));
    const gameRoom = c.env.GAME_ROOM.get(id);
    const stats = await gameRoom.getStats() as GameRoomStats;
    return c.json(stats);
  },
});
