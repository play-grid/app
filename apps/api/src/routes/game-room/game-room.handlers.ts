import type { AppRouteHandler } from '../../lib/types';
import type {
  CreateRoute,
  GetRoomStatsRoute,
  JoinRoute,
  WebSocketUpgradeRoute,
} from './game-room.routes';
import type { JoinGameRoomResponse } from './schemas';
import {
  getGameDefinition,
  isGameRegistered,
} from '@guess-logo/game-core';
import { nanoid } from 'nanoid';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { doRoomStatsSchema, errorSchema } from './schemas';

/**
 * Create a new game room
 */
export const create: AppRouteHandler<CreateRoute> = async (c) => {
  try {
    const body = c.req.valid('json');

    // Get userId if auth middleware is enabled (optional)
    const userId = c.get('user')?.id;

    // Validate game type exists in registry
    if (!isGameRegistered(body.gameType)) {
      return c.json(
        { error: `Invalid game type: ${body.gameType}` },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    // Get game definition to validate constraints

    const gameDefinition = getGameDefinition(body.gameType);
    if (!gameDefinition) {
      return c.json(
        { message: 'Game definition not found' },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    // Validate maxPlayers against game definition
    const maxPlayers = body.maxPlayers ?? gameDefinition.meta.maxPlayers;
    if (
      maxPlayers < gameDefinition.meta.minPlayers
      || maxPlayers > gameDefinition.meta.maxPlayers
    ) {
      return c.json(
        {
          error: `Player count must be between ${gameDefinition.meta.minPlayers} and ${gameDefinition.meta.maxPlayers}`,
        },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    // Generate unique room ID
    const roomId = nanoid(10);

    // Get Durable Object stub
    const id = c.env.GAME_SESSION.idFromName(roomId);
    const stub = c.env.GAME_SESSION.get(id);

    // Initialize the game session
    const initResponse = await stub.fetch('http://internal/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        gameType: body.gameType,
        maxPlayers,
        isPrivate: body.isPrivate,
        createdBy: userId,
      }),
    });

    if (!initResponse.ok) {
      const error = await initResponse.text();
      throw new Error(`Failed to initialize game session: ${error}`);
    }

    // Construct WebSocket URL for gameplay
    const host = c.req.header('host') || 'localhost:8787';
    const protocol = host.includes('localhost') ? 'ws' : 'wss';
    const websocketUrl = `${protocol}://${host}/api/game-room/${roomId}/ws`;

    return c.json(
      {
        id: roomId,
        name: body.name,
        gameType: body.gameType,
        maxPlayers,
        currentPlayers: 0,
        isPrivate: body.isPrivate,
        status: 'waiting' as const,
        createdAt: new Date().toISOString(),
        websocketUrl,
      },
      HttpStatusCodes.CREATED,
    );
  }
  catch (error) {
    console.error('[GameRoom] Create error:', error);
    return c.json(
      { message: 'Failed to create game room' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Join an existing game room
 */
export const join: AppRouteHandler<JoinRoute> = async (c) => {
  try {
    const { id: roomId } = c.req.valid('param');
    const body = c.req.valid('json');

    // Get Durable Object stub
    const id = c.env.GAME_SESSION.idFromName(roomId);
    const stub = c.env.GAME_SESSION.get(id);

    // Add player to the session
    const joinResponse = await stub.fetch('http://internal/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: body.playerName,
        playerId: body.playerId,
      }),
    });

    if (joinResponse.status === HttpStatusCodes.NOT_FOUND) {
      return c.json(
        { error: 'Game room not found' },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    if (joinResponse.status === HttpStatusCodes.BAD_REQUEST) {
      const rawError = await joinResponse.json();
      const parsedError = errorSchema.safeParse(rawError);
      const errorMessage = parsedError.success ? parsedError.data.error : 'Failed to join room';

      return c.json(
        { error: errorMessage },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    if (!joinResponse.ok) {
      throw new Error('Failed to join game session');
    }

    const joinData = await joinResponse.json<JoinGameRoomResponse>();

    // Construct WebSocket URL
    const host = c.req.header('host') || 'localhost:8787';
    const protocol = host.includes('localhost') ? 'ws' : 'wss';
    const websocketUrl = `${protocol}://${host}/api/game-room/${roomId}/ws`;

    return c.json(
      {
        id: roomId,
        name: joinData.name,
        gameType: joinData.gameType,
        maxPlayers: joinData.maxPlayers,
        currentPlayers: joinData.currentPlayers,
        isPrivate: false,
        status: 'waiting' as const,
        createdAt: new Date().toISOString(),
        websocketUrl,
        player: joinData.player,
      },
      HttpStatusCodes.OK,
    );
  }
  catch (error) {
    console.error('[GameRoom] Join error:', error);
    return c.json(
      { error: 'Failed to join game room' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Get game room statistics
 */
export const getGameRoomStats: AppRouteHandler<GetRoomStatsRoute> = async (
  c,
) => {
  try {
    const { id: roomId } = c.req.valid('param');

    const id = c.env.GAME_SESSION.idFromName(roomId);
    const stub = c.env.GAME_SESSION.get(id);

    const response = await stub.fetch('http://internal/stats');

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return c.json(
        { error: 'Game room not found' },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    if (!response.ok) {
      throw new Error('Failed to get game room stats');
    }

    const rawData = await response.json();

    const rawStats = doRoomStatsSchema.parse(rawData);

    return c.json(
      {
        totalConnections: rawStats.currentPlayers,
        maxPlayers: rawStats.maxPlayers,
        roomConfig: {
          roomId: rawStats.roomId,
          name: rawStats.roomId,
          maxPlayers: rawStats.maxPlayers,
          gameType: rawStats.gameType,
          isPrivate: false,
          createdAt: rawStats.createdAt,
        },
        sessions: rawStats.players.map(player => ({
          roomId: rawStats.roomId,
          playerId: player.id,
          joinedAt: Date.now(),
          duration: 0,
        })),
      },
      HttpStatusCodes.OK,
    );
  }
  catch (error) {
    console.error('[GameRoom] Get stats error:', error);
    return c.json(
      { error: 'Failed to get game room stats' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Upgrade HTTP connection to WebSocket for gameplay
 */
export const websocketUpgrade: AppRouteHandler<WebSocketUpgradeRoute> = async (
  c,
) => {
  try {
    const { id: roomId } = c.req.valid('param');

    const upgradeHeader = c.req.header('upgrade');
    if (upgradeHeader?.toLowerCase() !== 'websocket') {
      return c.json(
        { error: 'Expected WebSocket upgrade request' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const id = c.env.GAME_SESSION.idFromName(roomId);
    const stub = c.env.GAME_SESSION.get(id);

    return stub.fetch(c.req.raw);
  }
  catch (error) {
    console.error('[GameRoom] WebSocket upgrade error:', error);
    return c.json(
      { error: 'Failed to establish WebSocket connection' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
