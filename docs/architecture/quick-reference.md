# Quick Reference: Architecture Patterns

**Version**: 2.0
**Date**: Feb 6, 2026

## Creating a New Game

### 1. Define Game Schemas (in shared)

```typescript
// packages/shared/types/games/my-game.schema.ts
import { z } from 'zod';

export const gameStateSchema = z.object({
  score: z.number(),
  currentPlayer: z.string(),
  phase: z.enum(['setup', 'playing', 'ended']),
});

export const gameActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('START_GAME') }),
  z.object({ type: z.literal('SUBMIT_ANSWER'), payload: z.object({ answer: z.string() }) }),
]);

export type GameState = z.infer<typeof gameStateSchema>;
export type GameAction = z.infer<typeof gameActionSchema>;
```

### 2. Re-export from Game Package

```typescript
// packages/games/my-game/src/schema.ts
export {
  gameStateSchema,
  gameActionSchema,
  type GameState,
  type GameAction,
} from '@guess-logo/shared/types/games/my-game.schema';
```

### 3. Create Game Definition

```typescript
// packages/games/my-game/src/definition.ts
import { createGameDefinition, registerGame } from '@guess-logo/game-core';
import { gameStateSchema, gameActionSchema } from './schema';

export const myGame = createGameDefinition({
  meta: {
    id: 'my-game',
    version: '1.0.0',
    name: { en: 'My Game', ar: 'لعبتي' },
    description: { en: 'Description', ar: 'وصف' },
    imageUrl: '/assets/games/my-game/thumbnail.jpg',
    minPlayers: 1,
    maxPlayers: 4,
  },

  stateSchema: gameStateSchema,
  actionSchema: gameActionSchema,

  initialState: {
    score: 0,
    currentPlayer: '',
    phase: 'setup',
  },

  validator: (action, state) => {
    // Validate action
    return { valid: true };
  },

  customReducer: (state, action) => {
    // Handle state transitions
    return state;
  },
});

// Register without HTTP client (if not needed)
registerGame(myGame);
```

### 4. Create Effect Handlers (with HTTP)

```typescript
// packages/games/my-game/src/logic/effects.ts
import type { GameEffect, GameEffectContext, HttpClient } from '@guess-logo/game-core';
import type { GameState, GameAction } from '../schema';

export function createFetchDataEffect(
  httpClient: HttpClient,
  apiUrl: string,
): GameEffect {
  return async (ctx: GameEffectContext) => {
    const action = ctx.action as GameAction;
    const state = ctx.state as GameState;

    if (action.type !== 'START_GAME') return null;

    try {
      const url = new URL(`${apiUrl}/api/games/my-game/data`);
      const res = await httpClient.get(url.toString());

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      return {
        type: 'LOAD_DATA',
        payload: data,
      };
    } catch (error) {
      return {
        type: 'ERROR',
        payload: { message: 'Failed to load data' },
      };
    }
  };
}

export function createMyGameEffects(
  httpClient: HttpClient,
  apiUrl: string,
): GameEffect[] {
  return [
    createFetchDataEffect(httpClient, apiUrl),
  ];
}
```

### 5. Register with Effect Handlers

```typescript
// packages/games/my-game/src/definition.ts
import { createGameDefinition, registerGame } from '@guess-logo/game-core';
import { createMyGameEffects } from './logic/effects';

export const myGame = createGameDefinition({
  // ... as before
});

// Register with effect handlers
registerGame(myGame, (httpClient, apiUrl) => createMyGameEffects(httpClient, apiUrl));
```

### 6. Add Game to API Routes

```typescript
// apps/api/src/routes/games/my-game/data/index.ts
import createRouter from '@/lib/create-router';
import * as handlers from './data.handlers';
import * as routes from './data.routes';

export const myGameRoutes = createRouter()
  .openapi(routes.getData, handlers.getData);

// apps/api/src/routes/games/index.ts
import { myGameRoutes } from './my-game';

export const gamesRouter = createRouter()
  .route('/five-seconds', fiveSecondsRoutes)
  .route('/my-game', myGameRoutes);
```

### 7. Import Game in API

```typescript
// apps/api/src/app.ts
import '@guess-logo/my-game';
```

## Using Games in Frontend

### With Local Mode

```typescript
// apps/frontend/src/games/my-game/use-my-game.tsx
import hcWithType from '@guess-logo/api-client';
import { createHonoHttpClient } from '@guess-logo/game-core/adapters';
import { createGameEffectHandlers } from '@guess-logo/game-core';
import { useMyGameStore } from '@guess-logo/my-game/hooks';

export function useMyGame() {
  const apiUrl = 'https://api.example.com';

  // Create HTTP client
  const honoClient = hcWithType(apiUrl);
  const httpClient = createHonoHttpClient(honoClient);

  // Create effect handlers
  const effects = createGameEffectHandlers('my-game', httpClient, apiUrl, 'local');

  // Use game store
  const store = useMyGameStore();
  const dispatch = store.dispatch;

  // Inject effects into store (implementation depends on your setup)
  const executeEffects = async (action: GameAction) => {
    const results = await Promise.all(
      effects.map(effect => effect({
        action,
        state: store.getState(),
        dispatch,
        ctx: null, // Local mode has no Durable Object context
      }))
    );

    // Dispatch results
    results.forEach(result => {
      if (result) dispatch(result as any);
    });
  };

  return {
    state: store.getState(),
    dispatch: (action: GameAction) => {
      dispatch(action);
      executeEffects(action);
    },
  };
}
```

## Creating API Routes

### Using Shared Schemas

```typescript
// apps/api/src/routes/games/my-game/data/data.routes.ts
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { gameStateSchema } from '@guess-logo/shared/types/games/my-game.schema';

const tags = ['My Game'];

export const getData = createRoute({
  path: '/data',
  method: 'get',
  operationId: 'getMyGameData',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        data: gameStateSchema,
      }),
      'Game data',
    ),
  },
});

export type GetDataRoute = typeof getData;
```

### Implementation

```typescript
// apps/api/src/routes/games/my-game/data/data.handlers.ts
import type { GetDataRoute } from './data.routes';
import type { AppRouteHandler } from '@/lib/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';

export const getData: AppRouteHandler<GetDataRoute> = async (c) => {
  // Fetch data from database or external service
  const data = {
    score: 0,
    currentPlayer: 'player1',
    phase: 'setup',
  };

  return c.json({ data }, HttpStatusCodes.OK);
};
```

## Common Patterns

### Import from Shared (Preferred)

```typescript
// ✅ Correct: Import from shared
import { gameStateSchema } from '@guess-logo/shared/types/games/my-game.schema';

// ❌ Avoid: Import from game package in API
import { gameStateSchema } from '@guess-logo/my-game';
```

### Use Dependency Injection for HTTP

```typescript
// ✅ Correct: Inject HttpClient
export function createEffect(httpClient: HttpClient, apiUrl: string): GameEffect {
  const res = await httpClient.get(apiUrl + '/endpoint');
}

// ❌ Avoid: Create HTTP client in game package
import hcWithType from '@guess-logo/api-client';
const client = hcWithType(apiUrl);
```

### Type-Safe API Calls

```typescript
import hcWithType from '@guess-logo/api-client';

const client = hcWithType(apiUrl);

// ✅ Type-safe: Routes are inferred
const res = await client.api.games['my-game'].data.$get();

// ✅ Type-safe: Query parameters validated
const res2 = await client.api.games['my-game'].data.$get({
  query: { filter: 'active' }
});
```

## Troubleshooting

### Build Errors: Cannot Find Module

**Problem**: Import from source file instead of compiled package

```bash
Error: Cannot find module '@guess-logo/api/routes'
```

**Solution**: Import from `@guess-logo/api-contracts` instead

```typescript
// ❌ Wrong
import type { router } from '@guess-logo/api/routes';

// ✅ Correct
import type { RouterType } from '@guess-logo/api-contracts';
```

### Type Errors: HttpClient Not Defined

**Problem**: Missing HttpClient interface import

**Solution**: Import from game-core contracts

```typescript
import type { HttpClient } from '@guess-logo/game-core/contracts/http-client';
```

### Runtime Error: httpClient.get is not a function

**Problem**: Not creating Hono HTTP client adapter

**Solution**: Create adapter before injection

```typescript
import hcWithType from '@guess-logo/api-client';
import { createHonoHttpClient } from '@guess-logo/game-core/adapters';

const honoClient = hcWithType(apiUrl);
const httpClient = createHonoHttpClient(honoClient); // ← Create adapter
const effects = createGameEffectHandlers('my-game', httpClient, apiUrl, 'local');
```

### Circular Dependency Detected

**Problem**: Importing in wrong direction

**Solution**: Check dependency graph:
- Games → shared ✅
- Games → game-core ✅
- Games → api-client ❌ (should be injected)
- API → games ✅ (for registration)
- API → game schemas ❌ (should import from shared)

## Package Imports Reference

| What You Need | Import From |
|---------------|-------------|
| Game state/action schemas | `@guess-logo/shared/types/games/[game-name].schema` |
| Game definition factory | `@guess-logo/game-core` |
| HttpClient interface | `@guess-logo/game-core/contracts/http-client` |
| Hono HTTP client adapter | `@guess-logo/game-core/adapters` |
| Type-safe API client | `@guess-logo/api-client` |
| API router types | `@guess-logo/api-contracts` |
| Game-specific hooks | `@guess-logo/[game-name]/hooks` |

## File Structure Template

```
packages/shared/types/games/
  └── my-game.schema.ts        # Game schemas (source of truth)

packages/games/my-game/
  ├── src/
  │   ├── definition.ts        # Game definition + registration
  │   ├── schema.ts            # Re-exports from shared
  │   ├── logic/
  │   │   ├── reducer.ts       # State transitions
  │   │   ├── actions.ts       # Action creators
  │   │   ├── effects.ts       # Side effects (with HttpClient)
  │   │   └── validators.ts    # Action validators
  │   └── hooks/
  │       ├── use-my-game.ts   # React hooks
  │       └── index.ts
  ├── package.json             # No api-client dependency!
  └── tsconfig.json            # No path mappings!

apps/api/src/routes/games/my-game/
  ├── data/
  │   ├── data.routes.ts       # Route definitions (uses shared schemas)
  │   ├── data.handlers.ts     # Route handlers
  │   └── index.ts
  └── index.ts
```

## Build Commands

```bash
# Build everything
pnpm build

# Build specific package
pnpm --filter @guess-logo/my-game build

# Type check
pnpm check-types

# Lint
pnpm lint

# Test
pnpm test
```

---

## Related Documentation

- [Architecture Overview](./monorepo-structure-v2.md)
- [ADR 002: Breaking Circular Dependencies](../decisions/002-break-circular-dependencies.md)
- [Implementation Plan](../refactoring/002-implementation-plan.md)
