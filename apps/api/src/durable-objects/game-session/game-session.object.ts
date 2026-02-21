import type { GameSessionRouter } from './game-session.router';
import type { AppEnv } from '@/lib/types';
import {
  createGameEffectHandlers,
  getGameDefinition,
  isGameRegistered,
} from '@guess-logo/game-core';
import { DurableObject } from 'cloudflare:workers';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';
import { GameSessionManager } from './game-session.manager';
import { createGameSessionRouter } from './game-session.router';
import {
  generateInviteSchema,
  initGameSessionSchema,
  joinGameSessionSchema,
  revokeInviteSchema,
} from './schemas';
import '../../games';

export interface GameSessionMetadata {
  roomId: string;
  gameType: string;
  maxPlayers: number;
  isPrivate: boolean;
  createdAt: string;
  createdBy?: string;
}

/**
 * GameSessionObject - Cloudflare Durable Object for authoritative multiplayer
 *
 * Responsibilities:
 * 1. Initialize game sessions
 * 2. Manage WebSocket connections (ONE per player)
 * 3. Delegate game logic to GameSessionManager
 * 4. Handle player join/leave
 * 5. Persist and rehydrate sessions
 *
 * Architecture:
 * HTTP Endpoints (/init, /join, /stats) → GameSessionObject → GameSessionManager → Game Definition
 * WebSocket Messages → GameSessionRouter → GameSessionManager → Game Definition
 */
const PENDING_ACTION_KEY = 'sub_phase_pending_action';

export class GameSessionObject extends DurableObject<AppEnv['Bindings']> {
  private manager: GameSessionManager | null = null;
  private router: GameSessionRouter | null = null;
  private metadata: GameSessionMetadata | null = null;

  // FIX: Connection tracking - these are NOT reset during rehydration
  // because they're instance variables that persist as long as the DO is in memory
  private playerIds = new Map<WebSocket, string>(); // WS → playerId
  private playerConnections = new Map<string, WebSocket>(); // playerId → WS (ONE per player)

  constructor(ctx: DurableObjectState, env: AppEnv['Bindings']) {
    super(ctx, env);
    logger.info('[GameSessionObject] Constructor called - new instance created');
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

    if (url.pathname === '/validate-credentials') {
      return this.handleValidateCredentials(request);
    }

    if (url.pathname === '/generate-invite') {
      return this.handleGenerateInvite(request);
    }

    if (url.pathname === '/validate-invite') {
      return this.handleValidateInvite(request);
    }

    if (url.pathname === '/revoke-invite') {
      return this.handleRevokeInvite(request);
    }

    return new Response('Not found', { status: 404 });
  }

  async alarm() {
    logger.info('[GameSessionObject] 🚨 ALARM TRIGGERED');
    await this.ensureInitialized();

    if (this.manager) {
      const actionType = await this.ctx.storage.get<string>(PENDING_ACTION_KEY);
      const allStorage = await this.ctx.storage.list();
      
      logger.info(`[GameSessionObject] 🔍 Alarm check - PENDING_ACTION_KEY value: "${actionType}", all keys: [${Array.from(allStorage.keys()).join(', ')}]`);

      if (actionType) {
        logger.info(`[GameSessionObject] ✅ Found pending action: ${actionType}`);
        // CRITICAL: Delete the pending key BEFORE dispatching to prevent the effect
        // from storing a new action and then having it immediately deleted
        await this.ctx.storage.delete(PENDING_ACTION_KEY);
        logger.info(`[GameSessionObject] ✅ Pending key deleted, now dispatching action: ${actionType}`);
        await this.manager.dispatchAction({ type: actionType });
        logger.info(`[GameSessionObject] ✅ Action dispatched successfully: ${actionType}`);
      }
      else {
        logger.error('[GameSessionObject] ❌ Alarm triggered but NO pending action found!');
        logger.error(`[GameSessionObject] ❌ This means the timer effect didn't store the action properly`);
      }
    }
    else {
      logger.error('[GameSessionObject] ❌ Alarm triggered but manager not initialized!');
    }
  }

  /**
   * Ensure the session is initialized before processing requests
   * Rehydrates from storage if necessary
   *
   * IMPORTANT: This does NOT reset WebSocket connection tracking!
   * Connection Maps persist in memory as long as the DO instance is alive.
   */
  private async ensureInitialized(): Promise<boolean> {
    if (this.manager && this.router) {
      logger.debug('[GameSessionObject] Already initialized, skipping rehydration');
      return true;
    }
    logger.debug('[GameSessionObject] Not initialized, starting rehydration...');
    return this.rehydrate();
  }

  /**
   * Rehydrate the game session from durable storage
   * Called when the Durable Object wakes up from hibernation
   *
   * NOTE: This only rehydrates game state and manager, NOT WebSocket connections
   */
  private async rehydrate(): Promise<boolean> {
    logger.debug('[GameSessionObject] Rehydrating game state...');

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

    const savedState = await this.ctx.storage.get('state');
    const initialState = savedState || gameDefinition.initialState;

    logger.debug(!!savedState, '[GameSessionObject] Rehydrating... got savedState');

    const apiUrl = this.env?.API_URL || 'http://localhost:8787';

    const effectHandlers = createGameEffectHandlers(metadata.gameType, apiUrl, 'multiplayer');
    logger.debug(
      `[GameSessionObject] Created ${effectHandlers.length} effect handler(s) for ${metadata.gameType}`,
    );

    this.manager = new GameSessionManager({
      gameDefinition,
      initialState,
      ctx: this.ctx,
      effectHandlers,
      apiUrl,
    });

    this.router = createGameSessionRouter(this.manager);

    logger.debug('[GameSessionObject] Rehydration complete.');
    logger.info(
      `[GameSessionObject] Active WebSocket connections: ${this.playerConnections.size}`,
    );
    return true;
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const success = await this.ensureInitialized();
    if (!success) {
      return new Response('Room not initialized', { status: 503 });
    }

    const url = new URL(request.url);
    const playerId = url.searchParams.get('playerId');
    if (!playerId) {
      return new Response('Missing playerId', { status: 400 });
    }

    // PREVENT GHOST PLAYERS: Verify the player exists in the current state
    const state = this.manager!.getState();
    if (!state.players[playerId]) {
      logger.warn(
        `[GameSessionObject] Rejected ghost player connection: ${playerId} (not in game state)`,
      );
      logger.warn(
        `[GameSessionObject] Current players in state: ${Object.keys(state.players).join(', ')}`,
      );
      return new Response('Player not in game session', { status: 403 });
    }

    // FIX: Close old connection for this player if exists
    const existingWs = this.playerConnections.get(playerId);
    if (existingWs) {
      logger.info(
        `[GameSessionObject] Player ${playerId} reconnecting - closing old connection`,
      );
      try {
        existingWs.close(1000, 'New connection established');
      }
      catch (e) {
        logger.warn(`[GameSessionObject] Error closing old connection: ${e}`);
      }
      // Clean up old mappings
      this.playerIds.delete(existingWs);
    }

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);

    // Track both directions
    this.playerIds.set(server, playerId);
    this.playerConnections.set(playerId, server);

    logger.info(
      `[GameSessionObject] ✅ WebSocket connected for player: ${playerId}`,
    );
    logger.info(
      `[GameSessionObject] 📊 Total active connections: ${this.playerConnections.size}/${Object.keys(state.players).length} players`,
    );
    logger.debug(
      `[GameSessionObject] Connected players: ${Array.from(this.playerConnections.keys()).join(', ')}`,
    );

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

    const playerId = this.playerIds.get(ws);
    await this.router!.handleMessage(ws, message, playerId);
  }

  async webSocketOpen(ws: WebSocket): Promise<void> {
    const success = await this.ensureInitialized();
    if (!success) {
      ws.close(1008, 'Room session not found');
      return;
    }

    const playerId = this.playerIds.get(ws);
    logger.debug(`[GameSessionObject] WebSocket opened for player: ${playerId}`);

    const message = JSON.stringify({
      type: 'onStateUpdate',
      payload: this.manager!.getState(),
    });
    ws.send(message);
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const playerId = this.playerIds.get(ws);
    this.playerIds.delete(ws);

    // Only remove from playerConnections if this is the current connection
    if (playerId && this.playerConnections.get(playerId) === ws) {
      this.playerConnections.delete(playerId);
      logger.info(
        `[GameSessionObject] ❌ WebSocket disconnected for player: ${playerId}`,
      );
      logger.info(
        `[GameSessionObject] 📊 Remaining connections: ${this.playerConnections.size}`,
      );
    }
    else if (playerId) {
      logger.debug(
        `[GameSessionObject] Closed old/stale connection for player: ${playerId}`,
      );
    }
  }

  /**
   * Initialize a new game session
   * Called by the backend API when creating a room
   */
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

      // Save metadata
      this.metadata = {
        roomId: validatedInput.roomId,
        gameType: validatedInput.gameType,
        maxPlayers: validatedInput.maxPlayers,
        isPrivate: validatedInput.isPrivate,
        createdAt: new Date().toISOString(),
        createdBy: validatedInput.createdBy,
      };
      await this.ctx.storage.put('metadata', this.metadata);

      // Get API URL from environment
      const apiUrl = this.env?.API_URL || 'http://localhost:8787';

      // Create effect handlers for this game
      const effectHandlers = createGameEffectHandlers(validatedInput.gameType, apiUrl);
      logger.info(
        `[GameSessionObject] Created ${effectHandlers.length} effect handler(s) for ${validatedInput.gameType}`,
      );

      // Create manager with effect handlers
      this.manager = new GameSessionManager({
        gameDefinition,
        initialState: gameDefinition.initialState,
        ctx: this.ctx,
        effectHandlers,
        apiUrl,
      });

      this.router = createGameSessionRouter(this.manager);

      // Add host player if provided
      let hostPlayer;
      let credentials;
      if (validatedInput.hostPlayerName) {
        const playerId = validatedInput.createdBy || crypto.randomUUID();
        logger.info('Adding host player:', validatedInput.hostPlayerName, 'id:', playerId);

        await this.manager.dispatchAction({
          type: 'ADD_PLAYER',
          payload: {
            id: playerId,
            name: validatedInput.hostPlayerName,
          },
        });

        credentials = crypto.randomUUID();
        const credentialsData = {
          playerId,
          expiresAt: Date.now() + 5 * 60 * 1000,
        };
        await this.ctx.storage.put(`credentials:${credentials}`, credentialsData);

        const state = this.manager.getState();
        hostPlayer = state.players[playerId];

        if (!hostPlayer) {
          logger.error('Host player not found in state after ADD_PLAYER');
        }
      }

      await this.ctx.storage.put('state', this.manager.getState());

      const inviteToken = crypto.randomUUID();
      const inviteExpiresInMinutes = 60;
      const inviteExpiresAt = Date.now() + inviteExpiresInMinutes * 60 * 1000;
      const inviteData = {
        roomId: this.metadata.roomId,
        expiresAt: inviteExpiresAt,
        createdAt: Date.now(),
        createdBy: this.metadata.createdBy,
      };
      await this.ctx.storage.put(`invites:${inviteToken}`, inviteData);

      return new Response(
        JSON.stringify({
          success: true,
          roomId: this.metadata.roomId,
          hostPlayer,
          credentials,
          inviteToken,
          inviteExpiresInMinutes,
          inviteExpiresAt,
          currentState: this.manager.getState(),
        }),
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

  /**
   * Handle a player joining the game
   */
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

      const inviteToken = validatedInput.inviteToken;
      if (inviteToken) {
        const inviteData = await this.ctx.storage.get<{ roomId: string; expiresAt: number; createdAt: number; createdBy?: string }>(`invites:${inviteToken}`);
        if (!inviteData) {
          return new Response(
            JSON.stringify({ error: 'Invalid invite token' }),
            { status: 400 },
          );
        }
        if (inviteData.expiresAt < Date.now()) {
          return new Response(
            JSON.stringify({ error: 'Expired invite token' }),
            { status: 400 },
          );
        }
        if (inviteData.roomId !== this.metadata.roomId) {
          return new Response(
            JSON.stringify({ error: 'Invite token does not match this room' }),
            { status: 400 },
          );
        }
      }

      const playerId = validatedInput.playerId || crypto.randomUUID();

      const credentials = crypto.randomUUID();

      const credentialsData = {
        playerId,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      await this.ctx.storage.put(`credentials:${credentials}`, credentialsData);

      logger.info('Dispatching ADD_PLAYER for player:', playerId, validatedInput.playerName);
      await this.manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: {
          id: playerId,
          name: validatedInput.playerName,
        },
      });

      const updatedState = this.manager.getState();
      logger.info('Updated state players:', Object.keys(updatedState.players));

      const playerInState = updatedState.players[playerId];

      if (!playerInState) {
        logger.error('Player not found in state after ADD_PLAYER action');
        return new Response(
          JSON.stringify({ error: 'Failed to add player to game state' }),
          { status: 500 },
        );
      }

      return new Response(
        JSON.stringify({
          roomId: this.metadata.roomId,
          player: playerInState,
          credentials,
          currentPlayers: Object.keys(updatedState.players).length,
          maxPlayers: this.metadata.maxPlayers,
          gameType: this.metadata.gameType,
          currentState: updatedState,
          name: this.metadata.roomId,
          isPrivate: this.metadata.isPrivate,
          status: 'active',
          createdAt: this.metadata.createdAt,
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

  private async handleValidateCredentials(request: Request): Promise<Response> {
    try {
      await this.ensureInitialized();

      if (!this.metadata || !this.manager) {
        return new Response(
          JSON.stringify({ error: 'Room not found' }),
          { status: 404 },
        );
      }

      const url = new URL(request.url);
      const playerId = url.searchParams.get('playerId');
      const credentials = url.searchParams.get('credentials');

      if (!playerId || !credentials) {
        return new Response(
          JSON.stringify({ error: 'Missing playerId or credentials' }),
          { status: 400 },
        );
      }

      const storedData = await this.ctx.storage.get<{ playerId: string; expiresAt: number }>(`credentials:${credentials}`);

      if (!storedData) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401 },
        );
      }

      if (storedData.playerId !== playerId || storedData.expiresAt < Date.now()) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired credentials' }),
          { status: 401 },
        );
      }

      const state = this.manager.getState();
      if (!state.players[playerId]) {
        return new Response(
          JSON.stringify({ error: 'Player not found in room' }),
          { status: 401 },
        );
      }

      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    catch (error) {
      logger.error(error, '[GameSessionObject] Validate credentials error:');
      return new Response(
        JSON.stringify({ error: 'Failed to validate credentials' }),
        { status: 500 },
      );
    }
  }

  /**
   * Generate a new invite token for the room
   */
  private async handleGenerateInvite(request: Request): Promise<Response> {
    try {
      await this.ensureInitialized();

      if (!this.metadata || !this.manager) {
        return new Response(
          JSON.stringify({ error: 'Room not found' }),
          { status: 404 },
        );
      }

      const body = await request.json();
      const validatedInput = generateInviteSchema.parse(body);

      const inviteToken = crypto.randomUUID();
      const inviteExpiresInMinutes = validatedInput.expiresInMinutes || 60;
      const inviteExpiresAt = Date.now() + inviteExpiresInMinutes * 60 * 1000;

      const inviteData = {
        roomId: this.metadata.roomId,
        expiresAt: inviteExpiresAt,
        createdAt: Date.now(),
        createdBy: this.metadata.createdBy,
      };
      await this.ctx.storage.put(`invites:${inviteToken}`, inviteData);

      const apiUrl = this.env?.API_URL || this.env?.API_URL?.replace('/api', '') || 'http://localhost:5173';
      const inviteUrl = `${apiUrl}/${this.metadata.gameType}?mode=multiplayer&invite=${inviteToken}`;

      const response = {
        inviteToken,
        inviteUrl,
        expiresAt: new Date(inviteExpiresAt).toISOString(),
        expiresInMinutes: inviteExpiresInMinutes,
      };

      return new Response(
        JSON.stringify(response),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    catch (error) {
      logger.error(error, '[GameSessionObject] Generate invite error:');
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({ error: 'Invalid request data', details: error.issues }),
          { status: 400 },
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to generate invite' }),
        { status: 500 },
      );
    }
  }

  /**
   * Validate an invite token
   */
  private async handleValidateInvite(request: Request): Promise<Response> {
    try {
      await this.ensureInitialized();

      if (!this.metadata || !this.manager) {
        return new Response(
          JSON.stringify({ error: 'Room not found' }),
          { status: 404 },
        );
      }

      const url = new URL(request.url);
      const inviteToken = url.searchParams.get('token');

      if (!inviteToken) {
        return new Response(
          JSON.stringify({ error: 'Missing invite token' }),
          { status: 400 },
        );
      }

      const inviteData = await this.ctx.storage.get<{ roomId: string; expiresAt: number; createdAt: number; createdBy?: string }>(`invites:${inviteToken}`);

      if (!inviteData) {
        return new Response(
          JSON.stringify({ valid: false }),
          { headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (inviteData.expiresAt < Date.now()) {
        return new Response(
          JSON.stringify({ valid: false }),
          { headers: { 'Content-Type': 'application/json' } },
        );
      }

      const response = {
        valid: true,
        roomId: inviteData.roomId,
        expiresAt: new Date(inviteData.expiresAt).toISOString(),
      };

      return new Response(
        JSON.stringify(response),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    catch (error) {
      logger.error(error, '[GameSessionObject] Validate invite error:');
      return new Response(
        JSON.stringify({ error: 'Failed to validate invite' }),
        { status: 500 },
      );
    }
  }

  /**
   * Revoke an invite token
   */
  private async handleRevokeInvite(request: Request): Promise<Response> {
    try {
      await this.ensureInitialized();

      if (!this.metadata || !this.manager) {
        return new Response(
          JSON.stringify({ error: 'Room not found' }),
          { status: 404 },
        );
      }

      const body = await request.json();
      const validatedInput = revokeInviteSchema.parse(body);

      const inviteData = await this.ctx.storage.get(`invites:${validatedInput.inviteToken}`);

      if (!inviteData) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invite token not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        );
      }

      await this.ctx.storage.delete(`invites:${validatedInput.inviteToken}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    catch (error) {
      logger.error(error, '[GameSessionObject] Revoke invite error:');
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({ error: 'Invalid request data', details: error.issues }),
          { status: 400 },
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to revoke invite' }),
        { status: 500 },
      );
    }
  }
}
