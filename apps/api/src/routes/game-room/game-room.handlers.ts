import type { AppRouteHandler } from '../../lib/types';
import type {
  CreateRoute,
  GenerateInviteRoute,
  GetRoomStatsRoute,
  JoinRoute,
  RevokeInviteRoute,
  ValidateInviteRoute,
  WebSocketUpgradeRoute,
} from './game-room.routes';
import type { CreateGameRoomResponse, GenerateInviteResponse, JoinGameRoomResponse, RevokeInviteResponse, ValidateInviteResponse } from './schemas';
import {
  getGameDefinition,
  isGameRegistered,
} from '@playgrid/game-core';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import {
  generateInviteResponseSchema as doGenerateInviteResponseSchema,
  validateInviteResponseSchema as doValidateInviteResponseSchema,
  gameSessionStatsResponseSchema,
  initGameSessionResponseSchema,
  joinGameSessionResponseSchema,
} from '@/durable-objects/game-session/schemas';
import { logger } from '@/utils/logger';
import { errorSchema } from './schemas';

/**
 * Generates a random 7-digit number string for a room ID.
 * Ensures the number is between 1,000,000 and 9,999,999.
 */
function generateSevenDigitCode(): string {
  const min = 1000000; // Smallest 7-digit number
  const max = 9999999; // Largest 7-digit number
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num.toString();
}

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
    const maxPlayers = body.maxPlayers;
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
    const roomId = generateSevenDigitCode();

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
        hostPlayerName: body.hostPlayerName,
      }),
    });

    if (!initResponse.ok) {
      const error = await initResponse.text();
      throw new Error(`Failed to initialize game session: ${error}`);
    }

    const rawInitData = await initResponse.json();
    const initData = initGameSessionResponseSchema.parse(rawInitData);

    const hostPlayer = initData.hostPlayer;
    const credentials = initData.credentials;
    const initialGameState = initData.currentState;
    const currentPlayers = hostPlayer ? 1 : 0;
    const inviteToken = (initData as any).inviteToken;
    const inviteExpiresInMinutes = (initData as any).inviteExpiresInMinutes;
    const inviteExpiresAt = (initData as any).inviteExpiresAt;

    // Construct WebSocket URL for gameplay
    const host = c.req.header('host') || 'localhost:8787';
    const protocol = host.includes('localhost') ? 'ws' : 'wss';
    const websocketUrl = `${protocol}://${host}/api/game-room/${roomId}/ws`;

    const response: CreateGameRoomResponse = {
      id: roomId,
      name: body.name,
      gameType: body.gameType,
      maxPlayers,
      currentPlayers,
      isPrivate: body.isPrivate,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      websocketUrl,
      hostPlayer,
      credentials,
      initialGameState,
      inviteToken,
      inviteExpiresInMinutes,
      inviteExpiresAt,
    };

    return c.json(response, HttpStatusCodes.CREATED);
  }
  catch (error) {
    logger.error(error, '[GameRoom] Create error:');
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
        inviteToken: body.inviteToken,
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
      const errorMessage = parsedError.success
        ? parsedError.data.error
        : 'Failed to join room';

      return c.json(
        { error: errorMessage },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    if (!joinResponse.ok) {
      throw new Error('Failed to join game session');
    }

    const rawJoinData = await joinResponse.json();
    const joinData = joinGameSessionResponseSchema.parse(rawJoinData);

    // Construct WebSocket URL
    const host = c.req.header('host') || 'localhost:8787';
    const protocol = host.includes('localhost') ? 'ws' : 'wss';
    const websocketUrl = `${protocol}://${host}/api/game-room/${roomId}/ws`;

    const response: JoinGameRoomResponse & { currentState?: any } = {
      id: roomId,
      name: joinData.name || roomId, // Fallback to roomId if name not present
      gameType: joinData.gameType,
      maxPlayers: joinData.maxPlayers,
      currentPlayers: joinData.currentPlayers,
      isPrivate: joinData.isPrivate ?? false,
      status: (joinData.status as any) || 'active',
      createdAt: joinData.createdAt || new Date().toISOString(),
      websocketUrl,
      player: joinData.player,
      credentials: joinData.credentials,
      currentState: joinData.currentState, // Pass the current game state
    };

    return c.json(response, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, '[GameRoom] Join error:');
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
    const rawStats = gameSessionStatsResponseSchema.parse(rawData);

    return c.json(
      {
        totalConnections: rawStats.currentPlayers,
        maxPlayers: rawStats.maxPlayers,
        roomConfig: {
          roomId: rawStats.roomId,
          id: rawStats.roomId,
          name: rawStats.roomId,
          maxPlayers: rawStats.maxPlayers,
          gameType: rawStats.gameType,
          isPrivate: false,
          createdAt: rawStats.createdAt,
        },
        sessions: rawStats.players.map(player => ({
          roomId: rawStats.roomId,
          playerId: player.id,
          joinedAt: Date.now(), // Could be tracked in DO
          duration: 0, // Could be calculated in DO
        })),
      },
      HttpStatusCodes.OK,
    );
  }
  catch (error) {
    logger.error(error, '[GameRoom] Get stats error:');
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

    // Extract and validate credentials from query params
    const url = new URL(c.req.url);
    const playerId = url.searchParams.get('playerId');
    const credentials = url.searchParams.get('credentials');

    if (!playerId || !credentials) {
      return c.json(
        { error: 'Missing playerId or credentials in query parameters' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    // Validate credentials with Durable Object
    const id = c.env.GAME_SESSION.idFromName(roomId);
    const stub = c.env.GAME_SESSION.get(id);

    const validationResponse = await stub.fetch(`http://internal/validate-credentials?playerId=${encodeURIComponent(playerId)}&credentials=${encodeURIComponent(credentials)}`, {
      method: 'GET',
    });

    if (!validationResponse.ok) {
      const errorData = await validationResponse.json() as { error?: string };
      return c.json(
        { error: errorData.error || 'Invalid credentials' },
        HttpStatusCodes.UNAUTHORIZED,
      );
    }

    return stub.fetch(c.req.raw);
  }
  catch (error) {
    logger.error(error, '[GameRoom] WebSocket upgrade error:');
    return c.json(
      { error: 'Failed to establish WebSocket connection' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Generate an invite token for the room
 */
export const generateInvite: AppRouteHandler<GenerateInviteRoute> = async (c) => {
  try {
    const { id: roomId } = c.req.valid('param');
    const body = c.req.valid('json') || {};

    const id = c.env.GAME_SESSION.idFromName(roomId);
    const stub = c.env.GAME_SESSION.get(id);

    const response = await stub.fetch('http://internal/generate-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expiresInMinutes: body.expiresInMinutes,
      }),
    });

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return c.json(
        { error: 'Game room not found' },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    if (!response.ok) {
      throw new Error('Failed to generate invite');
    }

    const rawData = await response.json();
    const data = doGenerateInviteResponseSchema.parse(rawData);

    const inviteResponse: GenerateInviteResponse = {
      inviteToken: data.inviteToken,
      inviteUrl: data.inviteUrl,
      expiresAt: data.expiresAt,
      expiresInMinutes: data.expiresInMinutes,
    };

    return c.json(inviteResponse, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, '[GameRoom] Generate invite error:');
    return c.json(
      { error: 'Failed to generate invite' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Validate an invite token
 */
export const validateInvite: AppRouteHandler<ValidateInviteRoute> = async (c) => {
  try {
    const { id: roomId, token: inviteToken } = c.req.valid('param');

    const id = c.env.GAME_SESSION.idFromName(roomId);
    const stub = c.env.GAME_SESSION.get(id);

    const response = await stub.fetch(`http://internal/validate-invite?token=${encodeURIComponent(inviteToken)}`, {
      method: 'GET',
    });

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return c.json(
        { error: 'Game room not found' },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    if (!response.ok) {
      throw new Error('Failed to validate invite');
    }

    const rawData = await response.json();
    const data = doValidateInviteResponseSchema.parse(rawData);

    const validateResponse: ValidateInviteResponse = {
      valid: data.valid,
      roomId: data.roomId,
      expiresAt: data.expiresAt,
    };

    return c.json(validateResponse, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, '[GameRoom] Validate invite error:');
    return c.json(
      { error: 'Failed to validate invite' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Revoke an invite token
 */
export const revokeInvite: AppRouteHandler<RevokeInviteRoute> = async (c) => {
  try {
    const { id: roomId } = c.req.valid('param');
    const body = c.req.valid('json');

    const id = c.env.GAME_SESSION.idFromName(roomId);
    const stub = c.env.GAME_SESSION.get(id);

    const response = await stub.fetch('http://internal/revoke-invite', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteToken: body.inviteToken,
      }),
    });

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return c.json(
        { error: 'Game room not found' },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    if (!response.ok) {
      throw new Error('Failed to revoke invite');
    }

    const rawData = await response.json() as unknown;
    const data = rawData as { success: boolean };
    const revokeResponse: RevokeInviteResponse = {
      success: data.success,
    };

    return c.json(revokeResponse, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error(error, '[GameRoom] Revoke invite error:');
    return c.json(
      { error: 'Failed to revoke invite' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
