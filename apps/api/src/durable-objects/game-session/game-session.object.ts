import type { GameSessionRouter } from './game-session.router';
import { getGameDefinition, isGameRegistered } from '@guess-logo/game-core';
import { DurableObject } from 'cloudflare:workers';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';
import { GameSessionManager } from './game-session.manager';
import { createGameSessionRouter } from './game-session.router';
import { initGameSessionSchema, joinGameSessionSchema } from './schemas';
import '../../games';

export interface GameSessionMetadata {
  roomId: string;
  gameType: string;
  maxPlayers: number;
  isPrivate: boolean;
  createdAt: string;
  createdBy?: string;
}

// apps/api/src/durable-objects/game-session.object.ts

export class GameSessionObject extends DurableObject {
  private manager: GameSessionManager | null = null;
  private router: GameSessionRouter | null = null;
  private metadata: GameSessionMetadata | null = null;
  // Remove this line:
  // private players: Map<string, { id: string; name: string }> = new Map();

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith('/ws')) {
      return this.handleWebSocketUpgrade(request);
    }

    if (url.pathname === '/init') {
      return this.handleInit(request);
    }

    if (url.pathname === '/join') {
      return this.handleJoin(request);
    }

    if (url.pathname === '/stats') {
      return this.handleStats();
    }

    return new Response('Not found', { status: 404 });
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.manager && this.router) {
      return true;
    }
    return this.rehydrate();
  }

  private async rehydrate(): Promise<boolean> {
    logger.debug('[GameSessionObject] Rehydrating...');

    const metadata = await this.ctx.storage.get<GameSessionMetadata>('metadata');
    logger.debug(metadata, '[GameSessionObject] Rehydrating... got metadata');

    if (!metadata) {
      logger.error('[GameSessionObject] No metadata found in storage');
      return false;
    }

    this.metadata = metadata;

    const gameDefinition = getGameDefinition(metadata.gameType);
    logger.debug(!!gameDefinition, '[GameSessionObject] Rehydrating... got gameDefinition');

    if (!gameDefinition) {
      logger.error(`Game definition not found for: ${metadata.gameType}`);
      return false;
    }

    // Get the saved state or use initial state
    const savedState = await this.ctx.storage.get('state');
    const initialState = savedState || gameDefinition.initialState;

    logger.debug(!!savedState, '[GameSessionObject] Rehydrating... got savedState');

    this.manager = new GameSessionManager({
      gameDefinition,
      initialState,
      ctx: this.ctx,
    });

    this.router = createGameSessionRouter(this.manager);

    logger.debug('[GameSessionObject] Rehydration complete.');
    return true;
  }

  private async handleWebSocketUpgrade(_request: Request): Promise<Response> {
    const success = await this.ensureInitialized();
    if (!success) {
      return new Response('Room not initialized', { status: 503 });
    }

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const success = await this.ensureInitialized();
    if (!success) {
      ws.close(1008, 'Room session not found');
      return;
    }

    await this.router!.handleMessage(ws, message);
  }

  async webSocketClose(): Promise<void> {
    // Cleanup if needed
  }

  private async handleInit(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const validatedInput = initGameSessionSchema.parse(body);

      if (!isGameRegistered(validatedInput.gameType)) {
        return new Response(
          JSON.stringify({ error: `Game type "${validatedInput.gameType}" is not registered` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const gameDefinition = getGameDefinition(validatedInput.gameType);
      if (!gameDefinition) {
        return new Response(
          JSON.stringify({ error: `Game definition not found for: ${validatedInput.gameType}` }),
          { status: 500, headers: { 'Content-Type': 'application/json' } },
        );
      }

      this.metadata = {
        roomId: validatedInput.roomId,
        gameType: validatedInput.gameType,
        maxPlayers: validatedInput.maxPlayers,
        isPrivate: validatedInput.isPrivate,
        createdAt: new Date().toISOString(),
        createdBy: validatedInput.createdBy,
      };
      await this.ctx.storage.put('metadata', this.metadata);

      // Initialize with game's initial state
      this.manager = new GameSessionManager({
        gameDefinition,
        initialState: gameDefinition.initialState,
        ctx: this.ctx,
      });

      this.router = createGameSessionRouter(this.manager);

      // Persist initial state
      await this.ctx.storage.put('state', this.manager.getState());

      return new Response(
        JSON.stringify({ success: true, roomId: this.metadata.roomId }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    catch (error) {
      logger.error(error, '[GameSessionObject] Init error:');
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({ error: 'Invalid request data', details: error.issues }),
          { status: 400 },
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to initialize room' }),
        { status: 500 },
      );
    }
  }

  private async handleJoin(request: Request): Promise<Response> {
    try {
      await this.ensureInitialized();

      if (!this.metadata || !this.manager) {
        return new Response(
          JSON.stringify({ error: 'Room not initialized' }),
          { status: 404 },
        );
      }

      const body = await request.json();
      const validatedInput = joinGameSessionSchema.parse(body);

      const currentState = this.manager.getState();
      const currentPlayerCount = Object.keys(currentState.players).length;

      if (currentPlayerCount >= this.metadata.maxPlayers) {
        return new Response(
          JSON.stringify({ error: 'Room is full' }),
          { status: 400 },
        );
      }

      const playerId = validatedInput.playerId || crypto.randomUUID();

      this.manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: {
          id: playerId,
          name: validatedInput.playerName,
        },
      });

      const updatedState = this.manager.getState();

      return new Response(
        JSON.stringify({
          roomId: this.metadata.roomId,
          player: {
            id: playerId,
            name: validatedInput.playerName,
          },
          currentPlayers: Object.keys(updatedState.players).length,
          maxPlayers: this.metadata.maxPlayers,
          gameType: this.metadata.gameType,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    catch (error) {
      logger.error(error, '[GameSessionObject] Join error:');
      return new Response(
        JSON.stringify({ error: 'Failed to join room' }),
        { status: 500 },
      );
    }
  }

  private async handleStats(): Promise<Response> {
    await this.ensureInitialized();

    if (!this.metadata || !this.manager) {
      return new Response(
        JSON.stringify({ error: 'Room not found' }),
        { status: 404 },
      );
    }

    const state = this.manager.getState();
    const players = Object.values(state.players);

    return new Response(
      JSON.stringify({
        roomId: this.metadata.roomId,
        gameType: this.metadata.gameType,
        currentPlayers: players.length,
        maxPlayers: this.metadata.maxPlayers,
        players,
        createdAt: this.metadata.createdAt,
        phase: state.phase,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }
}
