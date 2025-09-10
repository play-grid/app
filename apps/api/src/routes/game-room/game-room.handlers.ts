import type { GameRoomStats } from '../../lib/game-room.do';
import type { AppRouteHandler } from '../../lib/types';
import type {
  CreateRoute,
  GetRoomStatsRoute,
  JoinRoute,
  WebSocketUpgradeRoute,
} from './game-room.routes';

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
        roomId,
        name: body.name,
        maxPlayers: body.maxPlayers,
        gameType: body.gameType,
        isPrivate: body.isPrivate,
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
    const id = c.env.GAME_ROOM.idFromName(String(roomId));
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

export const getGameRoomStats: AppRouteHandler<GetRoomStatsRoute> = async (c) => {
  try {
    const { id: roomId } = c.req.valid('param');

    // Debug: Log the roomId to see what we're getting
    // console.log('Stats request roomId:', roomId, typeof roomId);

    // Ensure roomId is a string
    const roomIdString = String(roomId);

    const doId = c.env.GAME_ROOM.idFromName(roomIdString);
    const stub = c.env.GAME_ROOM.get(doId);

    const response = await stub.fetch('http://internal/stats');

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return c.json({ error: 'Game room not found' }, HttpStatusCodes.NOT_FOUND);
    }

    if (!response.ok) {
      throw new Error('Failed to get game room stats');
    }

    const stats = await response.json<GameRoomStats>();
    return c.json(stats, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error('Error getting game room stats:', error);
    return c.json(
      { error: 'Failed to get game room stats' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const join: AppRouteHandler<JoinRoute> = async (c) => {
  try {
    const { id: roomId } = c.req.valid('param');
    const { playerName } = c.req.valid('json');

    // Get the Durable Object stub
    const id = c.env.GAME_ROOM.idFromName(String(roomId));
    const stub = c.env.GAME_ROOM.get(id);

    // Add the player to the room
    const joinResponse = await stub.fetch('http://internal/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName }),
    });

    if (joinResponse.status === HttpStatusCodes.NOT_FOUND) {
      return c.json({ error: 'Game room not found' }, HttpStatusCodes.NOT_FOUND);
    }

    if (!joinResponse.ok) {
      const errorText = await joinResponse.text();
      try {
        const error = JSON.parse(errorText);
        return c.json({ error: error.error || error.message || 'Unknown error' }, joinResponse.status as any);
      }
      catch {
        return c.json({ error: errorText || 'Unknown error' }, joinResponse.status as any);
      }
    }

    const roomState = (await joinResponse.json()) as any;

    const websocketUrl = `wss://${c.req.header('host')}/api/game-room/${roomId}/ws`;

    const gameRoom = {
      id: roomState.roomId,
      name: roomState.name,
      maxPlayers: roomState.maxPlayers,
      currentPlayers: roomState.currentPlayers,
      gameType: roomState.gameType,
      isPrivate: roomState.isPrivate,
      status: 'waiting' as const,
      createdAt: roomState.createdAt,
      websocketUrl,
      player: roomState.player,
    };

    return c.json(gameRoom, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error('Error joining game room:', error);
    return c.json(
      { error: 'Failed to join game room' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
