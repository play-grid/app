# Implementation Plan: Breaking Circular Dependencies

**Status**: Draft
**Date**: Feb 6, 2026
**Related ADRs**: 002-break-circular-dependencies.md

## Overview

This document provides step-by-step instructions to break the circular dependency chain in the monorepo.

**Total Estimated Time**: 8-12 hours

---

## Phase 1: Extract Shared Schemas (2 hours)

### Step 1.1: Create Shared Schema Structure

```bash
mkdir -p packages/shared/types/games
```

### Step 1.2: Move Five Seconds Schemas

**Create:** `packages/shared/types/games/five-seconds.schema.ts`

```typescript
import { z } from 'zod';

export const difficultySchema = z.enum(['all', 'easy', 'medium', 'hard']);
export const DBDifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const categoryBaseSchema = z.object({
  id: z.string(),
  nameEn: z.string(),
  nameAr: z.string(),
});

export const baseQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(5),
  difficulty: difficultySchema,
  categoryId: z.string(),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type DBDifficulty = z.infer<typeof DBDifficultySchema>;
export type Question = z.infer<typeof baseQuestionSchema>;
```

### Step 1.3: Move Guess Logo Schemas

**Create:** `packages/shared/types/games/guess-logo.schema.ts`

```typescript
import { z } from 'zod';

export const logoSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export type Logo = z.infer<typeof logoSchema>;
```

### Step 1.4: Update Shared Package Exports

**Edit:** `packages/shared/index.ts`

```typescript
export * from './types/games/five-seconds.schema';
export * from './types/games/guess-logo.schema';
```

### Step 1.5: Re-export from Game Packages

**Edit:** `packages/games/five-seconds/src/schema.ts`

```typescript
import { z } from 'zod';

// Re-export from shared
export {
  difficultySchema,
  DBDifficultySchema,
  categoryBaseSchema,
  baseQuestionSchema,
  type Difficulty,
  type DBDifficulty,
  type Question,
} from '@guess-logo/shared';

// Add game-specific extensions
export const questionWithCategorySchema = baseQuestionSchema.extend({
  categoryNameEn: z.string().optional(),
  categoryNameAr: z.string().optional(),
});

export type QuestionWithCategory = z.infer<typeof questionWithCategorySchema>;
```

### Step 1.6: Update API Route Imports

**Edit:** `apps/api/src/routes/games/five-seconds/questions/questions.schemas.ts`

```typescript
import { baseQuestionSchema } from '@guess-logo/shared'; // Changed from @guess-logo/five-seconds
import { z } from 'zod';

// Rest of file unchanged
```

**Edit:** `apps/api/src/routes/games/five-seconds/categories/categories.schemas.ts`

```typescript
import type { z } from 'zod';
import { categoryBaseSchema } from '@guess-logo/shared'; // Changed from @guess-logo/five-seconds

export const gameCategorySchema = categoryBaseSchema.describe('Game Category');

export type GameCategory = z.infer<typeof gameCategorySchema>;
```

### Step 1.7: Update Guess Logo Schemas

Follow same pattern for any schemas in `@guess-logo/guess-logo` that API imports.

---

## Phase 2: Create api-contracts Package (2 hours)

### Step 2.1: Create New Package

```bash
mkdir -p packages/api-contracts
cd packages/api-contracts
pnpm init
```

### Step 2.2: Configure Package

**Create:** `packages/api-contracts/package.json`

```json
{
  "name": "@guess-logo/api-contracts",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

### Step 2.3: Create TypeScript Config

**Create:** `packages/api-contracts/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 2.4: Extract Router Type

**Create:** `packages/api-contracts/src/index.ts`

```typescript
// Import from COMPILED API output, not source!
import type { router } from '@guess-logo/api/routes';

// Re-export the router type
export type RouterType = typeof router;
```

**Important:** This imports from `@guess-logo/api`'s compiled output via its `package.json` exports:
```json
"exports": {
  "./routes": {
    "types": "./dist/routes/index.d.ts",
    "default": "./dist/routes/index.js"
  }
}
```

### Step 2.5: Update api-client to Use api-contracts

**Edit:** `packages/api-client/index.ts`

```typescript
import type { RouterType } from '@guess-logo/api-contracts';
import { hc } from 'hono/client';

export type Client = ReturnType<typeof hc<RouterType>>;

export function hcWithType(...args: Parameters<typeof hc>): Client {
  return hc<RouterType>(...args);
}

export default hcWithType;
```

### Step 2.6: Update api-client Dependencies

**Edit:** `packages/api-client/package.json`

```json
{
  "name": "@guess-logo/api-client",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./index.ts"
  },
  "dependencies": {
    "@guess-logo/api-contracts": "workspace:*"
  },
  "peerDependencies": {
    "hono": "catalog:"
  }
}
```

### Step 2.7: Remove Path Mapping from api-client

**Edit:** `packages/api-client/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // Remove paths section entirely
  },
  "include": ["index.ts"]
}
```

### Step 2.8: Build Order Update

**Edit:** Root `package.json`

```json
{
  "scripts": {
    "build": "pnpm --filter @guess-logo/shared build && pnpm --filter @guess-logo/api-contracts build && pnpm --filter @guess-logo/api build && turbo run build --filter='!@guess-logo/shared' --filter='!@guess-logo/api-contracts' --filter='!@guess-logo/api'"
  }
}
```

---

## Phase 3: Dependency Injection for HTTP Client (3 hours)

### Step 3.1: Define HttpClient Interface

**Create:** `packages/game-core/src/contracts/http-client.ts`

```typescript
/**
 * Generic HTTP client interface for game effects
 * Allows games to be independent of specific HTTP client implementations
 */
export interface HttpClient {
  get(url: string, options?: RequestInit): Promise<Response>;
  post(url: string, body?: any, options?: RequestInit): Promise<Response>;
  put(url: string, body?: any, options?: RequestInit): Promise<Response>;
  delete(url: string, options?: RequestInit): Promise<Response>;
}
```

**Edit:** `packages/game-core/src/contracts/index.ts`

```typescript
export * from './game-effects';
export * from './http-client'; // Add export
```

### Step 3.2: Update Effect Handler Factory Signature

**Edit:** `packages/game-core/src/game-registry.ts`

```typescript
import type { HttpClient } from './contracts/http-client';

// Update EffectHandlerFactory type
export type EffectHandlerFactory = (
  httpClient: HttpClient,
  apiUrl: string,
  mode?: 'local' | 'multiplayer'
) => GameEffect[];

// Update registerGame default
export function registerGame<
  TStateSchema extends z.ZodType<BaseGameState>,
  TActionSchema extends z.ZodType<BaseAction>,
>(
  definition: GameDefinition<TStateSchema, TActionSchema>,
  effectHandlerFactory: EffectHandlerFactory = (_client, _apiUrl, _mode) => [],
): void {
  // ... rest unchanged
}

// Update createGameEffectHandlers
export function createGameEffectHandlers(
  gameId: string,
  httpClient: HttpClient, // Add parameter
  apiUrl: string,
  mode?: 'local' | 'multiplayer',
): GameEffect[] {
  const registered = gameRegistry.get(gameId);
  if (!registered) {
    logger.warn(`No game found for ID: ${gameId}, returning empty effect handlers`);
    return [];
  }

  const handlers = registered.effectHandlerFactory(httpClient, apiUrl, mode);
  logger.debug(`Created ${handlers.length} effect handler(s) for game: ${gameId} in ${mode} mode`);
  return handlers;
}
```

### Step 3.3: Remove api-client Dependency from five-seconds

**Edit:** `packages/games/five-seconds/package.json`

```json
{
  "dependencies": {
    "@guess-logo/game-core": "workspace:*",
    "@guess-logo/logger": "workspace:*",
    "@guess-logo/shared": "workspace:*",
    "react": "catalog:react19",
    "immer": "catalog:",
    "zod": "catalog:",
    "hono": "catalog:"
  },
  "peerDependencies": {
    // REMOVE: "@guess-logo/api-client": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "catalog:react19",
    "typescript": "catalog:"
  }
}
```

### Step 3.4: Update five-seconds Effect Handlers

**Edit:** `packages/games/five-seconds/src/logic/effect-handlers.ts`

```typescript
import type { GameEffect, GameEffectContext } from '@guess-logo/game-core';
import type { HttpClient } from '@guess-logo/game-core/contracts/http-client'; // Import interface
import type {
  FetchQuestionsErrorAction,
  FiveSecondsAction,
  FiveSecondsGameState,
  LoadQuestionsAction,
  SetQuestionAction,
  StartReadingTimerAction,
  StartTurnTimerAction,
} from './schema';
import { logger } from '../logger';

// REMOVE: import hcWithType from '@guess-logo/api-client';

function getQuestionsNeeded(state: FiveSecondsGameState): number {
  const currentBuffered = state.questions.length;
  const minBuffer = 5;
  const maxBatch = 9;

  return currentBuffered >= minBuffer ? 0 : maxBatch;
}

function getNextUnseenQuestion(state: FiveSecondsGameState) {
  return state.questions.find(q => !state.seenQuestionIds.includes(q.id));
}

function isErrorResponse(
  data: any,
): data is Extract<any, { code: 'NO_QUESTIONS_FOUND' }> {
  return 'code' in data && data.code === 'NO_QUESTIONS_FOUND';
}

// CHANGE: Add httpClient parameter
export function createFetchQuestionsEffect(
  httpClient: HttpClient,
  apiUrl: string,
): GameEffect {
  let isFetching = false;

  return async (
    ctx: GameEffectContext,
  ): Promise<LoadQuestionsAction | SetQuestionAction | FetchQuestionsErrorAction | null> => {
    const action = ctx.action as FiveSecondsAction;
    const gameState = ctx.state as FiveSecondsGameState;
    const isServer = !!ctx.ctx?.storage;

    const triggerActions = ['FETCH_QUESTION', 'START_GAME', 'START_TURN', 'NEXT_TURN', 'TALLY_VOTES'];

    if (!triggerActions.includes(action.type)) {
      return null;
    }

    try {
      if (isServer) {
        if (!gameState.currentQuestion) {
          const nextQuestion = getNextUnseenQuestion(gameState);
          if (nextQuestion) {
            logger.info(`[FetchQuestionsEffect] Current question missing, pulling from buffer: ${nextQuestion.id}`);
            return {
              type: 'SET_QUESTION',
              payload: { question: nextQuestion },
            };
          }
        }
        const questionsNeeded = getQuestionsNeeded(gameState);

        if (questionsNeeded === 0) {
          return null;
        }

        if (isFetching) {
          logger.warn('[FetchQuestionsEffect] Fetch already in progress, skipping');
          return null;
        }

        try {
          isFetching = true;
          logger.info(`[FetchQuestionsEffect] Fetching ${questionsNeeded} questions from API`);

          const query = {
            count: questionsNeeded.toString(),
            categoryIds: gameState.settings.categoryIds,
            excludeIds: gameState.seenQuestionIds,
            timePerTurn: gameState.settings.timePerTurn.toString(),
            difficulty: gameState.settings.difficulty === 'all' ? undefined : gameState.settings.difficulty,
          };

          // CHANGE: Use injected httpClient instead of hcWithType
          const url = new URL(`${apiUrl}/api/games/five-seconds/questions/batch`);
          Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
              url.searchParams.set(key, String(value));
            }
          });

          const res = await httpClient.get(url.toString());

          if (!res.ok) {
            const errorText = await res.text().catch(() => `HTTP ${res.status}`);
            logger.error(`[FetchQuestionsEffect] API error: ${res.status} - ${errorText}`);

            return {
              type: 'FETCH_QUESTIONS_ERROR',
              payload: {
                message: 'Unable to load questions from server. Please check your connection and try again.',
                canRetry: true,
                suggestSettingsChange: false,
              },
            };
          }

          const data = await res.json();

          if (!data.questions || data.questions.length === 0) {
            logger.warn('[FetchQuestionsEffect] No questions available matching current filters');
            return {
              type: 'FETCH_QUESTIONS_ERROR',
              payload: {
                message: 'No questions available with the current settings. Try changing difficulty or categories.',
                canRetry: true,
                suggestSettingsChange: true,
              },
            };
          }

          return {
            type: 'LOAD_QUESTIONS',
            payload: {
              questions: data.questions.map((q: any) => ({
                id: q.id,
                text: q.text,
                difficulty: q.difficulty,
                categoryId: q.categoryId,
              })),
            },
          };
        }
        finally {
          isFetching = false;
        }
      }
      else {
        // For local mode with custom questions, skip API fetch (handled by useQuestion hook)
        if (gameState.settings.useCustomQuestions) {
          return null;
        }

        if (gameState.currentQuestion) {
          return null;
        }

        if (isFetching) {
          logger.warn('[FetchQuestionsEffect] Fetch already in progress, skipping');
          return null;
        }

        try {
          isFetching = true;
          logger.info('[FetchQuestionsEffect] Fetching single question from API');

          const query = {
            categoryIds: gameState.settings.categoryIds,
            excludeIds: gameState.seenQuestionIds,
            timePerTurn: gameState.settings.timePerTurn,
            difficulty: gameState.settings.difficulty === 'all' ? undefined : gameState.settings.difficulty,
          };

          // CHANGE: Use injected httpClient
          const url = new URL(`${apiUrl}/api/games/five-seconds/questions/random`);
          Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined) {
              url.searchParams.set(key, String(value));
            }
          });

          const res = await httpClient.get(url.toString());

          if (!res.ok) {
            const errorText = await res.text().catch(() => `HTTP ${res.status}`);
            logger.error(`[FetchQuestionsEffect] API error: ${res.status} - ${errorText}`);

            return {
              type: 'FETCH_QUESTIONS_ERROR',
              payload: {
                message: 'Unable to load questions from server. Please check your connection and try again.',
                canRetry: true,
                suggestSettingsChange: false,
              },
            };
          }

          const data = await res.json();

          if (isErrorResponse(data)) {
            logger.warn('[FetchQuestionsEffect] No questions available matching current filters');
            return {
              type: 'FETCH_QUESTIONS_ERROR',
              payload: {
                message: (data as any).message,
                canRetry: true,
                suggestSettingsChange: true,
              },
            };
          }

          const questionData = data as any;
          const question = {
            id: questionData.id,
            text: questionData.text,
            difficulty: questionData.difficulty,
            categoryId: questionData.categoryId,
          };

          return {
            type: 'SET_QUESTION',
            payload: { question },
          };
        }
        finally {
          isFetching = false;
        }
      }
    }
    catch (error) {
      isFetching = false;
      logger.error('[FetchQuestionsEffect] Unexpected error:', error);
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');

      return {
        type: 'FETCH_QUESTIONS_ERROR',
        payload: {
          message: isNetworkError
            ? 'Network connection failed. Please check your internet connection and try again.'
            : 'An unexpected error occurred while loading questions. Please try again.',
          canRetry: true,
          suggestSettingsChange: false,
        },
      };
    }
  };
}

export function createTimerEffect(): GameEffect {
  // ... unchanged
}

// CHANGE: Update export to accept httpClient
export function createFiveSecondsEffects(
  httpClient: HttpClient,
  apiUrl: string,
): GameEffect[] {
  return [
    createFetchQuestionsEffect(httpClient, apiUrl),
    createTimerEffect()
  ];
}
```

### Step 3.5: Update five-seconds Game Definition

**Edit:** `packages/games/five-seconds/src/definition.ts`

```typescript
import { createGameDefinition, registerGame, type HttpClient } from '@guess-logo/game-core';
import { createFiveSecondsEffects } from './logic/effect-handlers';
import { fiveSecondsGameReducer } from './logic/reducer';
import { FiveSecondsActionSchema, FiveSecondsGameStateSchema } from './logic/schema';
import { validateFiveSecondsAction } from './logic/validator';

export const ENABLE_CUSTOM_QUESTIONS_FEATURE = false;

export const fiveSecondsGame = createGameDefinition({
  // ... unchanged
});

// CHANGE: Update registerGame call
registerGame(fiveSecondsGame, (httpClient, apiUrl) => createFiveSecondsEffects(httpClient, apiUrl));
```

### Step 3.6: Create Hono HttpClient Adapter

**Create:** `packages/game-core/src/adapters/hono-http-client.ts`

```typescript
import type { hc } from 'hono/client';
import type { HttpClient } from '../contracts/http-client';

/**
 * Adapter that makes Hono's hc client compatible with our HttpClient interface
 */
export function createHonoHttpClient(client: ReturnType<typeof hc>): HttpClient {
  return {
    get: async (url, options) => {
      // Extract path and query from URL
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search;

      // Navigate through the hc client to find the matching route
      // This is a simplified version - you may need to adjust based on your routing structure
      const parts = path.split('/').filter(Boolean);
      let current = client.api as any;

      for (const part of parts) {
        if (current[part]) {
          current = current[part];
        }
      }

      if (current.$get) {
        const res = await current.$get();
        return res;
      }

      // Fallback to regular fetch
      return fetch(url, { ...options, method: 'GET' });
    },

    post: async (url, body, options) => {
      return fetch(url, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
    },

    put: async (url, body, options) => {
      return fetch(url, {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
    },

    delete: async (url, options) => {
      return fetch(url, {
        ...options,
        method: 'DELETE',
      });
    },
  };
}
```

**Edit:** `packages/game-core/src/adapters/index.ts`

```typescript
export * from './hono-http-client';
```

### Step 3.7: Update API to Inject HttpClient

**Edit:** `apps/api/src/durable-objects/game-session/game-session.object.ts`

```typescript
import { createGameEffectHandlers } from '@guess-logo/game-core';
import hcWithType from '@guess-logo/api-client';
import { createHonoHttpClient } from '@guess-logo/game-core/adapters';

// ...

// CHANGE: Create and inject HTTP client
const honoClient = hcWithType(apiUrl);
const httpClient = createHonoHttpClient(honoClient);

const effectHandlers = createGameEffectHandlers(
  metadata.gameType,
  httpClient, // Inject httpClient
  apiUrl,
  'multiplayer'
);
```

### Step 3.8: Update Frontend to Inject HttpClient

**Edit:** `apps/frontend/src/games/five-seconds/hooks/use-five-seconds-actions.ts` (or similar)

```typescript
import hcWithType from '@guess-logo/api-client';
import { createHonoHttpClient } from '@guess-logo/game-core/adapters';
import { createGameEffectHandlers } from '@guess-logo/game-core';

// In your hook:
const honoClient = hcWithType(apiUrl);
const httpClient = createHonoHttpClient(honoClient);

const effectHandlers = createGameEffectHandlers(
  'five-seconds',
  httpClient,
  apiUrl,
  'local'
);
```

---

## Phase 4: Remove Path Mappings (1 hour)

### Step 4.1: Remove Path Mapping from five-seconds

**Edit:** `packages/games/five-seconds/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // Remove paths section
  },
  "include": ["src/**/*"]
}
```

### Step 4.2: Remove Path Mapping from guess-logo

**Edit:** `packages/games/guess-logo/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // Remove paths section
  },
  "include": ["src/**/*"]
}
```

### Step 4.3: Verify No Other Path Mappings to Source

```bash
grep -r "@guess-logo/api" packages/*/tsconfig.json
```

Ensure no results point to source files.

---

## Phase 5: Testing & Validation (2-4 hours)

### Step 5.1: Type Check All Packages

```bash
pnpm check-types
```

### Step 5.2: Build All Packages

```bash
pnpm build
```

### Step 5.3: Run Tests

```bash
pnpm test
```

### Step 5.4: Verify Dependency Graph

```bash
# Using turbo graph or similar tool
pnpm turbo build --filter='...' --dry-run
```

### Step 5.5: Manual Testing Checklist

- [ ] Five Seconds game loads questions in local mode
- [ ] Five Seconds game loads questions in multiplayer mode
- [ ] Guess Logo game works (if it has effects)
- [ ] Admin panel can manage questions
- [ ] Type errors are resolved

### Step 5.6: Lint Check

```bash
pnpm lint
```

---

## Phase 6: Documentation Updates (30 minutes)

### Step 6.1: Update Architecture Documentation

Create or update `docs/architecture/monorepo-structure.md` with new dependency graph.

### Step 6.2: Update README

Add section about the new package structure.

### Step 6.3: Update Onboarding Docs

Explain the new pattern for creating games with HTTP dependencies.

---

## Rollback Plan

If issues arise:

1. **Git Branch**: Keep all changes on feature branch
2. **Revert Steps**: Use `git revert` for each commit
3. **Restore Backups**: Keep backup of package.json files

```bash
# Rollback sequence
git revert <commit-range>
pnpm install
pnpm build
```

---

## Success Criteria

1. ✅ No circular dependencies (verify with dependency graph tool)
2. ✅ All path mappings removed or point to compiled packages
3. ✅ Game packages don't import api-client directly
4. ✅ All type checks pass
5. ✅ All builds succeed
6. ✅ All tests pass
7. ✅ Manual testing confirms functionality unchanged

---

## Next Steps After Refactoring

1. **Performance Testing**: Verify no regression in load times
2. **Code Review**: Get team approval on changes
3. **Documentation**: Update internal wiki
4. **Onboarding**: Walk team through new architecture
