import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionObject } from '../game-session.object';
import '../../../games';
import '@playgrid/five-seconds'; // Register the game

// Mock cloudflare:workers module
vi.mock('cloudflare:workers', () => ({
  DurableObject: class MockDurableObject {
    constructor(public ctx: any, public env: any) {}
  },
}));

// Mock WebSocketPair (Cloudflare Workers global)
(globalThis as any).WebSocketPair = class WebSocketPair {
  constructor() {
    const ws1 = { send: vi.fn(), close: vi.fn() };
    const ws2 = { send: vi.fn(), close: vi.fn() };
    return [ws1, ws2] as any;
  }
};

// Type for mock context matching DurableObjectState interface
interface MockDurableObjectState {
  storage: {
    put: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  blockConcurrencyWhile: ReturnType<typeof vi.fn>;
  acceptWebSocket: ReturnType<typeof vi.fn>;
  getWebSockets: ReturnType<typeof vi.fn>;
  id: {
    toString: () => string;
  };
}

// Helper to create a new DO instance with fresh storage
function createDurableObject(storageMap: Map<string, any>, env: any): GameSessionObject {
  const mockCtx = {
    storage: {
      put: vi.fn().mockImplementation(async (key: string, value: any) => {
        storageMap.set(key, value);
      }),
      get: vi.fn().mockImplementation(async (key: string) => {
        return storageMap.get(key) ?? null;
      }),
      delete: vi.fn().mockImplementation(async (key: string) => {
        storageMap.delete(key);
      }),
    },
    blockConcurrencyWhile: vi.fn(async fn => fn()),
    acceptWebSocket: vi.fn(),
    getWebSockets: vi.fn().mockReturnValue([]),
    id: {
      toString: () => 'test-do-id',
    },
  };
  return new GameSessionObject(mockCtx as any, env);
}

describe('gameSessionObject', () => {
  let durableObject: GameSessionObject;
  let mockCtx: MockDurableObjectState;
  let mockEnv: any;
  let storageMap: Map<string, any>;

  beforeEach(() => {
    // Create a real Map to simulate storage
    storageMap = new Map();

    // Mock DurableObjectState with working storage
    mockCtx = {
      storage: {
        put: vi.fn().mockImplementation(async (key: string, value: any) => {
          storageMap.set(key, value);
        }),
        get: vi.fn().mockImplementation(async (key: string) => {
          return storageMap.get(key) ?? null;
        }),
        delete: vi.fn().mockImplementation(async (key: string) => {
          storageMap.delete(key);
        }),
      },
      blockConcurrencyWhile: vi.fn(async fn => fn()),
      acceptWebSocket: vi.fn(),
      getWebSockets: vi.fn().mockReturnValue([]),
      id: {
        toString: () => 'test-do-id',
      },
    };

    mockEnv = {
      API_URL: 'http://localhost:8787',
    };

    durableObject = new GameSessionObject(mockCtx as any, mockEnv);
  });

  describe('hTTP Endpoints', () => {
    describe('/init', () => {
      it('should initialize a new game session', async () => {
        const request = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
            createdBy: 'test-player',
            hostPlayerName: 'Test Player',
          }),
        });

        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.roomId).toBe('room-123');
        expect(data.hostPlayer).toBeDefined();
        expect(data.credentials).toBeDefined();
        expect(mockCtx.storage.put).toHaveBeenCalledWith(
          'metadata',
          expect.objectContaining({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
          }),
        );
      });

      it('should reject invalid game type', async () => {
        const request = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'invalid-game',
            maxPlayers: 4,
            isPrivate: false,
          }),
        });

        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(400);
        expect(data.error).toContain('not registered');
      });

      it('should validate input schema', async () => {
        const request = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 100, // Invalid: max is 8
            isPrivate: false,
          }),
        });

        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
      });

      it('should initialize without host player', async () => {
        const request = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
          }),
        });

        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(200);
        expect(data.hostPlayer).toBeUndefined();
        expect(data.credentials).toBeUndefined();
      });
    });

    describe('/join', () => {
      beforeEach(async () => {
        // Initialize the session first
        const initRequest = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
          }),
        });
        await durableObject.fetch(initRequest);
      });

      it('should allow player to join', async () => {
        const request = new Request('http://test.com/join', {
          method: 'POST',
          body: JSON.stringify({
            playerName: 'Player 1',
          }),
        });

        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(200);
        expect(data.player).toBeDefined();
        expect(data.player.name).toBe('Player 1');
        expect(data.credentials).toBeDefined();
        expect(data.roomId).toBe('room-123');
        expect(data.gameType).toBe('five-seconds');
      });

      it('should reject join when room is full', async () => {
        // Fill the room
        for (let i = 0; i < 4; i++) {
          const joinRequest = new Request('http://test.com/join', {
            method: 'POST',
            body: JSON.stringify({
              playerName: `Player ${i + 1}`,
            }),
          });
          await durableObject.fetch(joinRequest);
        }

        // Try to join when full
        const request = new Request('http://test.com/join', {
          method: 'POST',
          body: JSON.stringify({
            playerName: 'Player 5',
          }),
        });

        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(400);
        expect(data.error).toBe('Room is full');
      });

      it('should store credentials for player', async () => {
        const request = new Request('http://test.com/join', {
          method: 'POST',
          body: JSON.stringify({
            playerName: 'Player 1',
          }),
        });

        const response = await durableObject.fetch(request);
        await response.json(); // Consume response

        expect(mockCtx.storage.put).toHaveBeenCalledWith(
          expect.stringMatching(/^credentials:/),
          expect.objectContaining({
            playerId: expect.any(String),
            expiresAt: expect.any(Number),
          }),
        );
      });
    });

    describe('/stats', () => {
      it('should return 404 when not initialized', async () => {
        const request = new Request('http://test.com/stats');
        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(404);
        expect(data.error).toBe('Room not found');
      });

      it('should return room stats', async () => {
        // Initialize
        const initRequest = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
            hostPlayerName: 'Host',
          }),
        });
        await durableObject.fetch(initRequest);

        // Get stats
        const request = new Request('http://test.com/stats');
        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(200);
        expect(data.roomId).toBe('room-123');
        expect(data.gameType).toBe('five-seconds');
        expect(data.currentPlayers).toBe(1);
        expect(data.maxPlayers).toBe(4);
        expect(data.players).toHaveLength(1);
      });
    });

    describe('/validate-credentials', () => {
      let credentials: string;
      let playerId: string;

      beforeEach(async () => {
        // Initialize and join to get credentials
        const initRequest = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
          }),
        });
        await durableObject.fetch(initRequest);

        const joinRequest = new Request('http://test.com/join', {
          method: 'POST',
          body: JSON.stringify({
            playerName: 'Player 1',
          }),
        });
        const joinResponse = await durableObject.fetch(joinRequest);
        const joinData = await joinResponse.json() as any;

        credentials = joinData.credentials;
        playerId = joinData.player.id;
      });

      it('should validate correct credentials', async () => {
        // Mock the storage to return the credentials
        mockCtx.storage.get.mockImplementation(async (key: string) => {
          if (key === `credentials:${credentials}`) {
            return {
              playerId,
              expiresAt: Date.now() + 5 * 60 * 1000, // Valid for 5 more minutes
            };
          }
          return null;
        });

        const request = new Request(
          `http://test.com/validate-credentials?playerId=${playerId}&credentials=${credentials}`,
        );
        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(200);
        expect(data.valid).toBe(true);
      });

      it('should reject invalid credentials', async () => {
        const request = new Request(
          `http://test.com/validate-credentials?playerId=${playerId}&credentials=invalid`,
        );
        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid credentials');
      });

      it('should reject missing parameters', async () => {
        const request = new Request(
          'http://test.com/validate-credentials?playerId=test',
        );
        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(400);
        expect(data.error).toBe('Missing playerId or credentials');
      });

      it('should reject mismatched playerId', async () => {
        // Mock storage to return credentials but with different playerId
        mockCtx.storage.get.mockImplementation(async (key: string) => {
          if (key === `credentials:${credentials}`) {
            return {
              playerId: 'different-player-id',
              expiresAt: Date.now() + 5 * 60 * 1000,
            };
          }
          return null;
        });

        const request = new Request(
          `http://test.com/validate-credentials?playerId=wrong-id&credentials=${credentials}`,
        );
        const response = await durableObject.fetch(request);
        const data = await response.json() as any;

        expect(response.status).toBe(401);
        expect(data.error).toBe('Invalid or expired credentials');
      });
    });

    describe('404 routes', () => {
      it('should return 404 for unknown routes', async () => {
        const request = new Request('http://test.com/unknown');
        const response = await durableObject.fetch(request);

        expect(response.status).toBe(404);
      });
    });
  });

  describe('webSocket Handling', () => {
    describe('webSocket upgrade', () => {
      it('should upgrade to WebSocket when session is initialized', async () => {
        // Initialize first
        const initRequest = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
            createdBy: 'test-player',
            hostPlayerName: 'Test Player',
          }),
        });
        await durableObject.fetch(initRequest);

        // Try to upgrade - just verify acceptWebSocket is called
        // Don't actually create Response with 101 status in test environment
        const wsRequest = new Request('http://test.com/ws?playerId=test-player', {
          headers: {
            Upgrade: 'websocket',
          },
        });

        // Call fetch but catch the error from invalid Response status
        try {
          await durableObject.fetch(wsRequest);
        }
        catch {
          // Expected - Node's Response doesn't support status 101
        }

        // Verify WebSocket was accepted
        expect(mockCtx.acceptWebSocket).toHaveBeenCalled();
      });

      it('should reject WebSocket upgrade when not initialized', async () => {
        const wsRequest = new Request('http://test.com/ws', {
          headers: {
            Upgrade: 'websocket',
          },
        });
        const response = await durableObject.fetch(wsRequest);

        expect(response.status).toBe(503);
      });

      it('should reject WebSocket upgrade when playerId is missing', async () => {
        // Initialize first
        const initRequest = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
          }),
        });
        await durableObject.fetch(initRequest);

        const wsRequest = new Request('http://test.com/ws', {
          headers: {
            Upgrade: 'websocket',
          },
        });
        const response = await durableObject.fetch(wsRequest);

        expect(response.status).toBe(400);
        expect(mockCtx.acceptWebSocket).not.toHaveBeenCalled();
      });
    });

    describe('webSocket messages', () => {
      let mockWs: any;

      beforeEach(async () => {
        // Initialize
        const initRequest = new Request('http://test.com/init', {
          method: 'POST',
          body: JSON.stringify({
            roomId: 'room-123',
            gameType: 'five-seconds',
            maxPlayers: 4,
            isPrivate: false,
          }),
        });
        await durableObject.fetch(initRequest);

        mockWs = {
          send: vi.fn(),
          close: vi.fn(),
        };
      });

      it('should handle dispatchAction message', async () => {
        const message = JSON.stringify({
          type: 'dispatchAction',
          payload: {
            action: {
              type: 'START_GAME',
            },
            requestId: 'req-1',
          },
        });

        await durableObject.webSocketMessage(mockWs, message);

        expect(mockWs.send).toHaveBeenCalledWith(
          expect.stringContaining('dispatchAction_result'),
        );
      });

      it('should handle syncState message', async () => {
        const message = JSON.stringify({
          type: 'syncState',
        });

        await durableObject.webSocketMessage(mockWs, message);

        expect(mockWs.send).toHaveBeenCalledWith(
          expect.stringContaining('onStateUpdate'),
        );
      });

      it('should handle ping message', async () => {
        const message = JSON.stringify({
          type: 'ping',
          payload: {
            timestamp: Date.now(),
          },
        });

        await durableObject.webSocketMessage(mockWs, message);

        expect(mockWs.send).toHaveBeenCalledWith(
          expect.stringContaining('pong'),
        );
      });

      it('should send initial state on WebSocket open', async () => {
        await durableObject.webSocketOpen(mockWs);

        expect(mockWs.send).toHaveBeenCalledWith(
          expect.stringContaining('onStateUpdate'),
        );
      });
    });
  });

  describe('session Rehydration', () => {
    it('should rehydrate from storage', async () => {
      // Create fresh storage for this test
      const freshStorage = new Map<string, any>();

      // Mock stored metadata and complete game state
      const mockMetadata = {
        roomId: 'room-123',
        gameType: 'five-seconds',
        maxPlayers: 4,
        isPrivate: false,
        createdAt: new Date().toISOString(),
      };

      // Mock a complete valid game state that matches the five-seconds schema
      const mockGameState = {
        players: {},
        phase: 'lobby',
        hostId: 'host-123',
        settings: {
          roundCount: 5,
          timePerRound: 5000,
          categoryIds: [],
          difficulty: 'medium',
          timePerTurn: 30,
          pointsToWin: 10,
        },
        createdAt: Date.now(),
        votingState: {
          votes: [],
          requiredVotes: 0,
          isVoting: false,
          voters: [],
          currentVoterIndex: 0,
        },
        seenQuestionIds: [],
        currentQuestion: null,
      };

      // Pre-populate storage
      freshStorage.set('metadata', mockMetadata);
      freshStorage.set('state', mockGameState);

      // Create new DO instance with fresh storage (simulating wake from hibernation)
      const newDO = createDurableObject(freshStorage, mockEnv);

      // Access stats endpoint to trigger rehydration
      const request = new Request('http://test.com/stats');
      const response = await newDO.fetch(request);

      expect(response.status).toBe(200);
    });

    it('should return false when metadata is missing', async () => {
      // Create fresh empty storage for this test
      const freshStorage = new Map<string, any>();

      const newDO = createDurableObject(freshStorage, mockEnv);
      const request = new Request('http://test.com/stats');
      const response = await newDO.fetch(request);

      expect(response.status).toBe(404);
    });
  });

  describe('credentials Management', () => {
    it('should store credentials with expiration', async () => {
      const initRequest = new Request('http://test.com/init', {
        method: 'POST',
        body: JSON.stringify({
          roomId: 'room-123',
          gameType: 'five-seconds',
          maxPlayers: 4,
          isPrivate: false,
          hostPlayerName: 'Host',
        }),
      });

      await durableObject.fetch(initRequest);

      expect(mockCtx.storage.put).toHaveBeenCalledWith(
        expect.stringMatching(/^credentials:/),
        expect.objectContaining({
          playerId: expect.any(String),
          expiresAt: expect.any(Number),
        }),
      );
    });

    it('should set credentials to expire in 5 minutes', async () => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      const joinRequest = new Request('http://test.com/join', {
        method: 'POST',
        body: JSON.stringify({
          playerName: 'Player 1',
        }),
      });

      // Initialize first
      const initRequest = new Request('http://test.com/init', {
        method: 'POST',
        body: JSON.stringify({
          roomId: 'room-123',
          gameType: 'five-seconds',
          maxPlayers: 4,
          isPrivate: false,
          createdBy: 'test-player',
          hostPlayerName: 'Test Player',
        }),
      });
      await durableObject.fetch(initRequest);

      await durableObject.fetch(joinRequest);

      const credentialsCall = mockCtx.storage.put.mock.calls.find(
        (call: any[]) => call[0].startsWith('credentials:'),
      );

      expect(credentialsCall).toBeDefined();
      if (credentialsCall) {
        const expiresAt = credentialsCall[1].expiresAt;
        expect(expiresAt).toBeGreaterThan(now);
        expect(expiresAt).toBeLessThanOrEqual(now + fiveMinutes + 1000); // Allow 1s tolerance
      }
    });
  });

  describe('security: Ghost Player Prevention', () => {
    it('should REJECT WebSocket connection if player is not in game state', async () => {
    // 1. Initialize Game
      const initRequest = new Request('http://test.com/init', {
        method: 'POST',
        body: JSON.stringify({
          roomId: 'room-123',
          gameType: 'five-seconds',
          maxPlayers: 4,
          isPrivate: false,
          createdBy: 'test-player',
          hostPlayerName: 'Test Player',
        }),
      });
      await durableObject.fetch(initRequest);

      // 2. Attempt WS Upgrade with a random ID (Ghost)
      const ghostId = 'i-do-not-exist';
      const wsRequest = new Request(`http://test.com/ws?playerId=${ghostId}`, {
        headers: { Upgrade: 'websocket' },
      });

      // 3. This should return 403 BEFORE reaching the 101 status code
      const response = await durableObject.fetch(wsRequest);

      expect(response.status).toBe(403);
    });

    it('should upgrade to WebSocket when session is initialized and player exists', async () => {
      // 1. Initialize with a specific host player
      const hostId = 'test-player';
      const initRequest = new Request('http://test.com/init', {
        method: 'POST',
        body: JSON.stringify({
          roomId: 'room-123',
          gameType: 'five-seconds',
          maxPlayers: 4,
          isPrivate: false,
          createdBy: hostId, // Ensure this ID is used
          hostPlayerName: 'Host Player',
        }),
      });
      await durableObject.fetch(initRequest);

      // 2. Try to upgrade with the VALID player ID
      const wsRequest = new Request(`http://test.com/ws?playerId=${hostId}`, {
        headers: {
          Upgrade: 'websocket',
        },
      });

      // 3. Handle the Node/Vitest RangeError for status 101
      try {
        await durableObject.fetch(wsRequest);
      }
      catch {
        // RangeError is expected in Node/Vitest for status 101
      }

      // 4. Verify WebSocket was accepted
      expect(mockCtx.acceptWebSocket).toHaveBeenCalled();
    });
  });
});
