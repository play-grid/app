import type { GameRoom } from './receiver';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Bindings {
  GameRoom: DurableObjectNamespace<GameRoom>;
}

const app = new Hono<{ Bindings: Bindings }>();

// Add CORS if needed for web clients
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173'],
    allowMethods: ['GET', 'POST'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'Upgrade',
      'Connection',
      'Sec-WebSocket-Key',
      'Sec-WebSocket-Version',
    ],
  }),
);

// Basic health check
app.get('/', (c) => {
  return c.json({
    message: 'Game Server API',
    version: '1.0.0',
    endpoints: {
      websocket: '/game-room',
      stats: '/game-room/:roomId/stats',
      create: '/game-room/create',
    },
  });
});

// Create a new game room
app.post('/game-room/create', (c) => {
  const roomId = crypto.randomUUID();
  return c.json({ roomId });
});

// WebSocket connection endpoint
app.get('/game-room', async (c) => {
  // Validate WebSocket upgrade request
  if (c.req.header('upgrade') !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  const env = c.env;

  // You can make this dynamic based on query params or path
  // For now using 'default', but you could do:
  // const roomId = c.req.query('room') || 'default';
  const roomId = 'default';

  const id = env.GameRoom.idFromName(roomId);
  const stub = env.GameRoom.get(id);

  // Forward the entire request to the Durable Object
  return stub.fetch(c.req.raw);
});

// Dynamic room connections
app.get('/game-room/:roomId', async (c) => {
  // Validate WebSocket upgrade request
  if (c.req.header('upgrade') !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  const roomId = c.req.param('roomId');
  const env = c.env;

  // Validate room ID format if needed
  if (!isValidRoomId(roomId)) {
    return c.text('Invalid room ID format', 400);
  }

  const id = env.GameRoom.idFromName(roomId);
  const stub = env.GameRoom.get(id);

  return stub.fetch(c.req.raw);
});

// Error handling
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
    },
    500,
  );
});

// Utility functions
function isValidRoomId(roomId: string): boolean {
  // Add your room ID validation logic
  // For example: alphanumeric, length limits, etc.
  return /^[\w-]{1,50}$/.test(roomId);
}

// Export the GameRoom DO and default app
export { GameRoom } from './receiver';
export default app;
