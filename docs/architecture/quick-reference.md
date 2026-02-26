# Quick Reference: Architecture Patterns

**Version**: 2.1
**Date**: Feb 26, 2026
**What's New**: Updated game creation patterns based on codebase analysis (five-seconds as reference)

## Creating a New Game

### 1. Define Game Schemas

```typescript
// packages/games/my-game/src/logic/schema.ts
import {
  BaseGameStateSchema,
  GameActionSchema,
  PlayerSchema,
} from '@guess-logo/game-core';
import { z } from 'zod';

export const MyGameSettingsSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  maxScore: z.number(),
});

export const MyGameGameStateSchema = BaseGameStateSchema.extend({
  settings: MyGameSettingsSchema,
  players: z.record(z.string(), PlayerSchema),
  score: z.number(),
});

export const SubmitAnswerActionSchema = z.object({
  type: z.literal('SUBMIT_ANSWER'),
  payload: z.object({
    answer: z.string(),
    playerId: z.string(),
  }),
});

export const MyGameCustomActionSchema = z.discriminatedUnion('type', [
  SubmitAnswerActionSchema,
]);

export const MyGameActionSchema = z.discriminatedUnion('type', [
  ...GameActionSchema.options,
  ...MyGameCustomActionSchema.options,
]);

export type MyGameGameState = z.infer<typeof MyGameGameStateSchema>;
export type MyGameAction = z.infer<typeof MyGameActionSchema>;
export type SubmitAnswerAction = z.infer<typeof SubmitAnswerActionSchema>;
```

### 2. Create Pure Action Functions

```typescript
// packages/games/my-game/src/logic/actions.ts
import type { Draft } from 'immer';
import type { MyGameGameState, SubmitAnswerAction } from './schema';

export function submitAnswer(
  draft: Draft<MyGameGameState>,
  payload: SubmitAnswerAction['payload'],
): void {
  const { answer, playerId } = payload;

  if (!draft.turnState || draft.turnState.currentPlayerId !== playerId) {
    return;
  }

  const player = draft.players[playerId];
  if (!player) {
    return;
  }

  if (answer === 'correct') {
    player.score += 10;
    draft.score += 10;
  }
}

export function clearGameContent(draft: Draft<MyGameGameState>): void {
  draft.score = 0;
  Object.values(draft.players).forEach(player => {
    player.score = 0;
  });
}
```

### 3. Create Reducer with Pure Action Functions

```typescript
// packages/games/my-game/src/logic/reducer.ts
import type { MyGameAction, MyGameGameState } from './schema';
import { produce } from 'immer';
import { clearGameContent, submitAnswer } from './actions';

export function myGameReducer(
  state: MyGameGameState,
  action: MyGameAction,
): MyGameGameState {
  switch (action.type) {
    case 'START_GAME':
      return produce(state, clearGameContent);

    case 'END_GAME':
      return produce(state, clearGameContent);

    case 'RESET_GAME':
      return produce(state, clearGameContent);

    case 'SUBMIT_ANSWER':
      return produce(state, (draft) => {
        submitAnswer(draft, action.payload);
      });

    default:
      return state;
  }
}
```

### 4. Create Game Definition

```typescript
// packages/games/my-game/src/definition.ts
import { createGameDefinition, registerGame } from '@guess-logo/game-core';
import { MyGameActionSchema, MyGameGameStateSchema } from './logic/schema';
import { myGameReducer } from './logic/reducer';

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

  stateSchema: MyGameGameStateSchema,
  actionSchema: MyGameActionSchema,

  initialState: {
    phase: 'lobby',
    players: {},
    hostId: '',
    createdAt: Date.now(),
    settings: {
      difficulty: 'medium',
      maxScore: 100,
    },
    score: 0,
  },

  customReducer: myGameReducer,
});

registerGame(myGame);
```

### 5. Create Effect Handlers (with HTTP)

```typescript
// packages/games/my-game/src/logic/effect-handlers.ts
import type { GameEffect, GameEffectContext, HttpClient } from '@guess-logo/game-core';
import type { MyGameAction, MyGameGameState } from './schema';

export function createFetchQuestionsEffect(
  httpClient: HttpClient,
  apiUrl: string,
): GameEffect {
  return async (ctx: GameEffectContext) => {
    const action = ctx.action as MyGameAction;
    const state = ctx.state as MyGameGameState;

    if (action.type !== 'START_GAME') return null;

    try {
      const url = new URL(`${apiUrl}/api/games/my-game/questions`);
      url.searchParams.set('category', state.settings.difficulty);

      const res = await httpClient.get(url.toString());

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      return {
        type: 'LOAD_QUESTIONS',
        payload: { questions: data },
      };
    } catch (error) {
      return {
        type: 'FETCH_ERROR',
        payload: { message: 'Failed to load questions', canRetry: true },
      };
    }
  };
}

export function createMyGameEffects(
  httpClient: HttpClient,
  apiUrl: string,
): GameEffect[] {
  return [
    createFetchQuestionsEffect(httpClient, apiUrl),
  ];
}
```

### 6. Register with Effect Handlers

```typescript
// packages/games/my-game/src/definition.ts
import { createGameDefinition, registerGame } from '@guess-logo/game-core';
import { createMyGameEffects } from './logic/effect-handlers';
import { MyGameActionSchema, MyGameGameStateSchema } from './logic/schema';
import { myGameReducer } from './logic/reducer';

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

  stateSchema: MyGameGameStateSchema,
  actionSchema: MyGameActionSchema,

  initialState: {
    phase: 'lobby',
    players: {},
    hostId: '',
    createdAt: Date.now(),
    settings: {
      difficulty: 'medium',
      maxScore: 100,
    },
    score: 0,
  },

  customReducer: myGameReducer,
});

registerGame(myGame, (httpClient, apiUrl) => createMyGameEffects(httpClient, apiUrl));
```

### 7. Add Game to API Routes

```typescript
// apps/api/src/routes/games/my-game/questions/index.ts
import createRouter from '@/lib/create-router';
import * as handlers from './questions.handlers';
import * as routes from './questions.routes';

export const myGameRoutes = createRouter()
  .openapi(routes.getQuestions, handlers.getQuestions);

// apps/api/src/routes/games/index.ts
import { fiveSecondsRoutes } from './five-seconds';
import { myGameRoutes } from './my-game';

export const gamesRouter = createRouter()
  .route('/five-seconds', fiveSecondsRoutes)
  .route('/my-game', myGameRoutes);
```

### 8. Import Game in API

```typescript
// apps/api/src/app.ts
import '@guess-logo/five-seconds';
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
  // API URL: Use full URL in dev, relative URL in production (same domain)
  const apiUrl = import.meta.env.DEV ? 'http://localhost:8787' : '';

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

### Always Extend GameActionSchema

```typescript
// ✅ Correct: Include core game actions
export const MyGameActionSchema = z.discriminatedUnion('type', [
  ...GameActionSchema.options,
  ...MyGameCustomActionSchema.options,
]);

// ❌ Wrong: Missing core actions
export const MyGameActionSchema = z.discriminatedUnion('type', [
  ...MyGameCustomActionSchema.options,
]);
```

### Use turnState for Turn Management

```typescript
// ✅ Correct: Access turn state through turnState
export function submitAnswer(
  draft: Draft<MyGameGameState>,
  payload: SubmitAnswerAction['payload'],
): void {
  const currentPlayerId = draft.turnState?.currentPlayerId;
  const playerOrder = draft.turnState?.playerOrder;

  // Use turnState properties
}

// ❌ Wrong: Using root level playerOrder/currentPlayerId
export const MyGameGameStateSchema = BaseGameStateSchema.extend({
  playerOrder: z.array(z.string()), // Don't add this!
  currentPlayerId: z.string(),      // Don't add this!
});
```

### Split Reducer into Pure Functions

```typescript
// ✅ Correct: Pure action functions
export function submitAnswer(
  draft: Draft<MyGameGameState>,
  payload: SubmitAnswerAction['payload'],
): void {
  // Pure function: only mutates state
  if (draft.turnState?.currentPlayerId === payload.playerId) {
    draft.players[payload.playerId].score += 10;
  }
}

// ❌ Wrong: Monolithic reducer with inline logic
export function myGameReducer(
  state: MyGameGameState,
  action: MyGameAction,
): MyGameGameState {
  return produce(state, (draft) => {
    // Hundreds of lines of inline logic
    switch (action.type) {
      case 'SUBMIT_ANSWER':
        // 50 lines of logic here
        break;
      // More actions...
    }
  });
}
```

### Always Use createGameDefinition

```typescript
// ✅ Correct: Use factory function
export const myGame = createGameDefinition({
  meta: { /* ... */ },
  stateSchema: MyGameGameStateSchema,
  actionSchema: MyGameActionSchema,
  initialState: { /* ... */ },
  customReducer: myGameReducer,
});

registerGame(myGame);

// ❌ Wrong: Manual game definition object this is does not make the composing for reducers 
export const statClashGame = {
  meta: { /* ... */ },
  stateSchema: StatClashGameStateSchema,
  actionSchema: StatClashActionSchema,
  initialState: createInitialState('', 'Player', 'solo'),
  initialStateFactory: createInitialState,
  validator: validateStatClashAction,
  reducer: statClashReducer,
};
```

## Troubleshooting

### Action Type Errors: Core Actions Missing

**Problem**: GameActionSchema doesn't include core actions like START_GAME

```typescript
Error: Type 'START_GAME' is not assignable to type 'MyGameAction'
```

**Solution**: Extend GameActionSchema with spread operator

```typescript
// ❌ Wrong: Missing core actions
export const MyGameActionSchema = z.discriminatedUnion('type', [
  SubmitAnswerActionSchema,
]);

// ✅ Correct: Include core actions
export const MyGameActionSchema = z.discriminatedUnion('type', [
  ...GameActionSchema.options,
  SubmitAnswerActionSchema,
]);
```

### Turn Management Errors: playerOrder Not Found

**Problem**: Accessing root level playerOrder instead of turnState.playerOrder

```typescript
Error: Cannot read property 'playerOrder' of undefined
```

**Solution**: Use turnState for all turn-related properties

```typescript
// ❌ Wrong: Adding playerOrder to root state
export const MyGameGameStateSchema = BaseGameStateSchema.extend({
  playerOrder: z.array(z.string()),
  currentPlayerId: z.string(),
});

// ✅ Correct: Use turnState from BaseGameStateSchema
const currentPlayerId = draft.turnState?.currentPlayerId;
const playerOrder = draft.turnState?.playerOrder;
```

### Reducer Complexity: Hard to Test and Maintain

**Problem**: Monolithic reducer with hundreds of lines

**Solution**: Split into pure action functions

```typescript
// ❌ Wrong: All logic inline in reducer
export function myGameReducer(state, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'SUBMIT_ANSWER':
        // 50 lines of logic here
        break;
      case 'NEXT_TURN':
        // 40 lines of logic here
        break;
    }
  });
}

// ✅ Correct: Pure action functions
export function submitAnswer(draft, payload) {
  // Testable, reusable function
}

export function myGameReducer(state, action) {
  switch (action.type) {
    case 'SUBMIT_ANSWER':
      return produce(state, (draft) => submitAnswer(draft, action.payload));
  }
}
```

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
const httpClient = createHonoHttpClient(honoClient);
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
packages/games/my-game/
  ├── src/
  │   ├── definition.ts                    # Game definition + registration
  │   ├── logic/
  │   │   ├── schema.ts                    # Game schemas (extends GameActionSchema)
  │   │   ├── reducer.ts                   # Main reducer (switch statement)
  │   │   ├── actions.ts                   # Pure action functions
  │   │   ├── effect-handlers.ts           # Side effects (with HttpClient)
  │   │   └── validator.ts                 # Action validators (optional)
  │   └── hooks/
  │       ├── use-my-game-state.ts         # React hooks for state
  │       ├── use-my-game-actions.ts       # React hooks for dispatch
  │       └── index.ts
  ├── package.json                         # No api-client dependency!
  └── tsconfig.json                        # No path mappings!

apps/api/src/routes/games/my-game/
  ├── questions/
  │   ├── questions.routes.ts              # Route definitions
  │   ├── questions.handlers.ts            # Route handlers
  │   └── index.ts
  └── index.ts
```

## Common Anti-Patterns to Avoid

### 1. Not Using createGameDefinition Factory

**Problem:** Manually creating game definition objects
```typescript
// ❌ Wrong: Manual object creation (from stat-clash)
export const statClashGame = {
  meta: { /* ... */ },
  stateSchema: StatClashGameStateSchema,
  actionSchema: StatClashActionSchema,
  initialState: createInitialState('', 'Player', 'solo'),
  initialStateFactory: createInitialState,
  validator: validateStatClashAction,
  reducer: statClashReducer,
};
```

**Solution:** Always use createGameDefinition for consistency
```typescript
// ✅ Correct: Use factory function
export const myGame = createGameDefinition({
  meta: { /* ... */ },
  stateSchema: MyGameGameStateSchema,
  actionSchema: MyGameActionSchema,
  initialState: { /* ... */ },
  customReducer: myGameReducer,
});
```

### 2. Not Extending GameActionSchema

**Problem:** Missing core game actions (START_GAME, END_GAME, etc.)
```typescript
// ❌ Wrong: Missing core actions (from stat-clash)
export const StatClashActionSchema = z.discriminatedUnion('type', [
  StartGameActionSchema,
  RequestStatItemsActionSchema,
  GuessHigherActionSchema,
  // Missing core actions!
]);
```

**Solution:** Always spread GameActionSchema.options
```typescript
// ✅ Correct: Include core actions
export const MyGameActionSchema = z.discriminatedUnion('type', [
  ...GameActionSchema.options,
  SubmitAnswerActionSchema,
]);
```

### 3. Using Root Level playerOrder/currentPlayerId

**Problem:** Adding turn state properties to root instead of using turnState
```typescript
// ❌ Wrong: Root level turn management (from stat-clash)
export const StatClashGameStateSchema = BaseGameStateSchema.extend({
  playerOrder: z.array(z.string()).default([]),
  currentPlayerId: z.string().nullable().default(null),
});
```

**Solution:** Use turnState from BaseGameStateSchema
```typescript
// ✅ Correct: Use turnState
const currentPlayerId = draft.turnState?.currentPlayerId;
const playerOrder = draft.turnState?.playerOrder;
```

### 4. Monolithic Reducer Functions

**Problem:** All reducer logic inline in one large function
```typescript
// ❌ Wrong: All logic inline in reducer
export function statClashReducer(state, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'START_GAME':
        // 30 lines of inline logic
        break;
      case 'GUESS_HIGHER':
        // 90 lines of inline logic!
        break;
    }
  });
}
```

**Solution:** Extract pure action functions (five-seconds pattern)
```typescript
// ✅ Correct: Pure action functions
export function startTurn(draft: Draft<FiveSecondsGameState>): void {
  // Testable, reusable function
  const currentPlayerId = draft.turnState.currentPlayerId;
  // ...
}

export function fiveSecondsGameReducer(
  state: FiveSecondsGameState,
  action: FiveSecondsAction,
): FiveSecondsGameState {
  switch (action.type) {
    case 'START_TURN':
      return produce(state, startTurn);
  }
}
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

## Key Changes from Previous Pattern

This guide reflects the latest best practices after analyzing existing games. Key differences:

| Old Pattern | New Pattern | Reason |
|------------|-------------|---------|
| Manual game definition objects | `createGameDefinition` factory | Consistency and proper composition |
| Custom action schemas only | Extend `GameActionSchema` | Include core game actions automatically |
| Root `playerOrder`/`currentPlayerId` | Use `turnState.playerOrder`/`turnState.currentPlayerId` | Centralized turn management in game-core |
| Inline reducer logic | Pure action functions | Testability, reusability, maintainability |

**Reference Games:**
- ✅ Five Seconds: Follows all best practices correctly
- ❌ Stat Clash: Uses old patterns (manual definition, root playerOrder)
- ❌ Guess Logo: Missing GameActionSchema extension

---

## Related Documentation

- [Architecture Overview](./monorepo-structure-v2.md)
- [ADR 002: Breaking Circular Dependencies](../decisions/002-break-circular-dependencies.md)
- [Implementation Plan](../refactoring/002-implementation-plan.md)
