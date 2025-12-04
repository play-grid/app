/* eslint-disable no-console */
import { getGameDefinition, isGameRegistered } from '@guess-logo/game-core';
import { onError } from '@orpc/server';
import { HibernationPlugin } from '@orpc/server/hibernation';
import { RPCHandler } from '@orpc/server/websocket';
import { DurableObject } from 'cloudflare:workers';
import { ZodError } from 'zod';
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

export class GameSessionObject extends DurableObject {
  private manager: GameSessionManager | null = null;
  private handler: RPCHandler<any> | null = null;
  private metadata: GameSessionMetadata | null = null;
  private players: Map<string, { id: string; name: string }> = new Map();

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // ✅ FIX: Handle /ws path for WebSocket upgrades
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

  private async rehydrate() {
    console.log('[GameSessionObject] Rehydrating...');
    const metadata = await this.ctx.storage.get<GameSessionMetadata>('metadata');

    if (!metadata) {
      console.error('[GameSessionObject] No metadata found in storage');
      return false;
    }

    console.log('[GameSessionObject] Found metadata:', metadata);
    this.metadata = metadata;

    const gameDefinition = getGameDefinition(metadata.gameType);
    if (!gameDefinition) {
      console.error(`Game definition not found for: ${metadata.gameType}`);
      return false;
    }

    this.manager = new GameSessionManager({
      gameDefinition,
      initialState: gameDefinition.initialState,
      ctx: this.ctx,
    });

    const router = createGameSessionRouter(
      gameDefinition.actionSchema,
      gameDefinition.stateSchema,
    );

    this.handler = new RPCHandler(router, {
      interceptors: [
        onError((error) => {
          // JSON.stringify with indentation (2 spaces) reveals the deep object!
          console.error('[GameSessionObject] Error Details:', JSON.stringify(error, null, 2));
        }),
      ],
      plugins: [new HibernationPlugin()],
    });

    const players = await this.ctx.storage.get<Map<string, { id: string; name: string }>>(
      'players',
    );
    if (players) {
      this.players = players;
    }

    return true;
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader?.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    // ✅ Attempt rehydration if handler/manager missing
    if (!this.handler || !this.manager) {
      const success = await this.rehydrate();
      if (!success) {
        return new Response('Room not initialized', { status: 503 });
      }
    }

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // ✅ Try to rehydrate if needed
    if (!this.handler || !this.manager) {
      const success = await this.rehydrate();
      if (!success) {
        console.error('[GameSessionObject] Cannot rehydrate. Closing socket.');
        ws.close(1008, 'Room session not found');
        return;
      }
    }

    try {
      await this.handler!.message(ws, message, {
        context: {
          ws,
          getWebSockets: () => this.ctx.getWebSockets(),
          manager: this.manager!,
        },
      });
    }
    catch (err) {
      console.error('[GameSessionObject] Error handling message:', err);
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    if (this.handler) {
      this.handler.close(ws);
    }
  }

  private async handleInit(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const validatedInput = initGameSessionSchema.parse(body);

      if (!isGameRegistered(validatedInput.gameType)) {
        return new Response(
          JSON.stringify({
            error: `Game type "${validatedInput.gameType}" is not registered`,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const gameDefinition = getGameDefinition(validatedInput.gameType);
      if (!gameDefinition) {
        return new Response(
          JSON.stringify({
            error: `Game definition not found for: ${validatedInput.gameType}`,
          }),
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

      this.manager = new GameSessionManager({
        gameDefinition,
        initialState: gameDefinition.initialState,
        ctx: this.ctx,
      });

      const router = createGameSessionRouter(
        gameDefinition.actionSchema,
        gameDefinition.stateSchema,
      );

      this.handler = new RPCHandler(router, {
        interceptors: [
          onError((error) => {
            console.error('[GameSessionObject] Error:', error);
          }),
        ],
        plugins: [new HibernationPlugin()],
      });

      return new Response(
        JSON.stringify({ success: true, roomId: this.metadata.roomId }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    catch (error) {
      console.error('[GameSessionObject] Init error:', error);

      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({ error: 'Invalid request data', details: error.issues }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(JSON.stringify({ error: 'Failed to initialize room' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  private async handleJoin(request: Request): Promise<Response> {
    try {
      if (!this.metadata) {
        return new Response(
          JSON.stringify({ error: 'Room not initialized' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const body = await request.json();

      // Validate input
      const validatedInput = joinGameSessionSchema.parse(body);

      // Check if room is full
      if (this.players.size >= this.metadata.maxPlayers) {
        return new Response(JSON.stringify({ error: 'Room is full' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Add player
      const id = validatedInput.playerId || crypto.randomUUID();
      this.players.set(id, { id, name: validatedInput.playerName });
      await this.ctx.storage.put('players', this.players);

      return new Response(
        JSON.stringify({
          roomId: this.metadata.roomId,
          player: { id, name: validatedInput.playerName },
          currentPlayers: this.players.size,
          maxPlayers: this.metadata.maxPlayers,
          gameType: this.metadata.gameType,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    catch (error) {
      console.error('[GameSessionObject] Join error:', error);

      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: 'Invalid request data',
            details: error.issues, // Use 'issues' not 'errors'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to join room' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  private async handleStats(): Promise<Response> {
    if (!this.metadata) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        roomId: this.metadata.roomId,
        gameType: this.metadata.gameType,
        currentPlayers: this.players.size,
        maxPlayers: this.metadata.maxPlayers,
        players: Array.from(this.players.values()),
        createdAt: this.metadata.createdAt,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }
}
