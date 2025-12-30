import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionObject } from '../game-session.object';

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

describe('gameSessionObject', () => {
  let durableObject: GameSessionObject;
  let mockCtx: MockDurableObjectState;
  let mockEnv: any;

  beforeEach(() => {
    // Mock DurableObjectState
    mockCtx = {
      storage: {
        put: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(null),
        delete: vi.fn().mockResolvedValue(undefined),
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
            createdBy: 'user-1',
            hostPlayerName: 'Host Player',
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
      // Mock stored metadata and complete game state
      const mockMetadata = {
        roomId: 'room-123',
        gameType: 'five-seconds',
        maxPlayers: 4,
        isPrivate: false,
        createdAt: new Date().toISOString(),
      };

      // Mock a complete valid game state that matches the five-seconds schema
      // Based on the error, the five-seconds game needs these specific fields
      const mockGameState = {
        players: {},
        phase: 'lobby',
        hostId: 'host-123',
        settings: {
          roundCount: 5,
          timePerRound: 5000,
          categoryIds: [], // Required array
          difficulty: 'medium', // Must be one of: easy, medium, hard, all
          timePerTurn: 30, // Required number
          roundsToWin: 3, // Required number
        },
        createdAt: Date.now(),
        votingState: {
          votes: [], // Should be array, not object
          requiredVotes: 0,
          isVoting: false, // Required boolean
          voters: [], // Required array
          currentVoterIndex: 0, // Required number
        },
        seenQuestionIds: [],
        currentQuestion: null,
      };

      mockCtx.storage.get = vi.fn()
        .mockImplementation(async (key: string) => {
          if (key === 'metadata')
            return mockMetadata;
          if (key === 'state')
            return mockGameState;
          return null;
        });

      // Create new DO instance (simulating wake from hibernation)
      const newDO = new GameSessionObject(mockCtx as any, mockEnv);

      // Access stats endpoint to trigger rehydration
      const request = new Request('http://test.com/stats');
      const response = await newDO.fetch(request);

      expect(response.status).toBe(200);
      expect(mockCtx.storage.get).toHaveBeenCalledWith('metadata');
    });

    it('should return false when metadata is missing', async () => {
      mockCtx.storage.get.mockResolvedValue(null);

      const newDO = new GameSessionObject(mockCtx as any, mockEnv);
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
});
