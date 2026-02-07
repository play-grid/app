# Architecture Overview: Monorepo Structure (Post-Refactor)

**Version**: 2.0
**Date**: Feb 7, 2026
**Status**: Target Architecture

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                           APPLICATIONS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐ │
│  │   @guess-logo/   │    │   @guess-logo/   │    │    admin      │ │
│  │    frontend      │    │      api         │    │               │ │
│  └────────┬─────────┘    └────────┬─────────┘    └───────┬───────┘ │
│           │                       │                      │         │
│           │ imports               │ imports              │ imports │
│           ▼                       ▼                      ▼         │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐ │
│  │ @guess-logo/     │    │ @guess-logo/     │    │ @guess-logo/  │ │
│  │  api-client      │    │  api-contracts   │    │  api-client   │ │
│  └──────────────────┘    └──────────────────┘    └───────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           PACKAGES                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     SHARED LAYER                            │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │    shared    │  │ game-core    │  │api-contracts│       │   │
│  │  │              │  │              │  │              │       │   │
│  │  │ - types/     │  │ - contracts/ │  │ - router     │       │   │
│  │  │   games/     │  │ - adapters/  │  │   types      │       │   │
│  │  │ - schemas    │  │ - game-logic │  │              │       │   │
│  │  │ - utils      │  │ - stores     │  └──────────────┘       │   │
│  │  │ - i18n       │  │ - react/     │                           │   │
│  │  │              │  │              │                           │   │
│  │  └──────────────┘  └──────────────┘                           │   │
│  │         │                  │                                    │   │
│  └─────────┼──────────────────┼────────────────────────────────────┘   │
│            │                  │                                        │
│            ▼                  ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     GAMES LAYER                             │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  ┌──────────────────┐    ┌──────────────────┐                │   │
│  │  │  @guess-logo/    │    │  @guess-logo/    │                │   │
│  │  │   five-seconds   │    │   guess-logo     │                │   │
│  │  │                  │    │                  │                │   │
│  │  │ - logic/         │    │ - logic/         │                │   │
│  │  │ - hooks/         │    │ - hooks/         │                │   │
│  │  │ - definition.ts  │    │ - definition.ts  │                │   │
│  │  └──────────────────┘    └──────────────────┘                │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     UI LAYER                                 │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  ┌──────────────────┐    ┌──────────────────┐                │   │
│  │  │ @guess-logo/     │    │ @guess-logo/     │                │   │
│  │  │       ui         │    │     logger       │                │   │
│  │  └──────────────────┘    └──────────────────┘                │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Dependency Directions

### ✅ **DOWNWARD** (Correct Direction)

```
Applications → Packages → Shared
   ↓            ↓          ↓
API → api-contracts (reads compiled types)
API → shared/types/games (imports schemas)
Games → shared/types/games (imports schemas)
Games → game-core (uses contracts/adapters)
```

### ❌ **NO CYCLES**

- Games do NOT import api-client
- Games do NOT import API routes
- API does NOT import game logic (only schemas from shared)
- api-client imports from api-contracts (not API directly)

## Package Purposes

### Applications Layer

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| `@guess-logo/frontend` | React Vite app - game UI | All game packages, api-client, ui, shared |
| `@guess-logo/api` | Hono backend on Cloudflare Workers | api-contracts, shared |
| `admin` | Admin panel for content management | api-client |

### Packages Layer

#### Shared Infrastructure

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| `@guess-logo/shared` | Shared types, schemas, utilities | None (pure) |
| `@guess-logo/game-core` | Game contracts, adapters, state management | shared |
| `@guess-logo/api-contracts` | API router types | @guess-logo/api (after build) |

#### Game Implementations

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| `@guess-logo/five-seconds` | Five Seconds Q&A game | game-core, shared |
| `@guess-logo/guess-logo` | Guess the Logo game | game-core, shared |

#### UI & Utilities

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| `@guess-logo/ui` | Shared UI components | None |
| `@guess-logo/logger` | Pino logging | None |

## Key Architectural Patterns

### 1. Shared Schemas Pattern

**Before:** API imports from game packages
```typescript
// apps/api/src/routes/games/five-seconds/questions/questions.schemas.ts
import { baseQuestionSchema } from '@guess-logo/five-seconds'; // ❌ Wrong direction
```

**After:** Both import from shared
```typescript
// packages/shared/types/games/five-seconds.schema.ts
export const baseQuestionSchema = z.object({ ... });

// apps/api/src/routes/games/five-seconds/questions/questions.schemas.ts
import { baseQuestionSchema } from '@guess-logo/shared'; // ✅

// packages/games/five-seconds/src/schema.ts
export { baseQuestionSchema } from '@guess-logo/shared'; // ✅ Re-export
```

### 2. Contract Pattern

**Before:** api-client imports from source
```typescript
// packages/api-client/index.ts
import type { router } from '@guess-logo/api/routes'; // ❌ Points to source
```

**After:** api-client imports from contracts package
```typescript
// packages/api-contracts/src/index.ts
import type { router } from '@guess-logo/api/routes'; // Imports compiled output
export type RouterType = typeof router;

// packages/api-contracts/tsconfig.json
{
  "compilerOptions": {
    "declaration": true, // Generates .d.ts files
    "types": ["node"]
  }
}

// packages/api-client/index.ts
import type { RouterType } from '@guess-logo/api-contracts'; // ✅
```

### 3. Dependency Injection Pattern

**Before:** Games create HTTP clients
```typescript
// packages/games/five-seconds/src/logic/effect-handlers.ts
import hcWithType from '@guess-logo/api-client'; // ❌ Game imports infrastructure

export function createFetchQuestionsEffect(apiUrl: string): GameEffect {
  const client = hcWithType(apiUrl);
  // ...
}
```

**After:** Inject HTTP client
```typescript
// packages/game-core/src/contracts/http-client.ts
export interface HttpClient {
  get(url: string, options?: RequestInit): Promise<Response>;
  // ...
}

// packages/games/five-seconds/src/logic/effect-handlers.ts
import type { HttpClient } from '@guess-logo/game-core/contracts/http-client';

export function createFetchQuestionsEffect(
  httpClient: HttpClient, // ✅ Injected
  apiUrl: string,
): GameEffect {
  const res = await httpClient.get(url);
  // ...
}

// apps/api/src/durable-objects/game-session/game-session.object.ts
import hcWithType from '@guess-logo/api-client';
import { createHonoHttpClient } from '@guess-logo/game-core/adapters';

const honoClient = hcWithType(apiUrl);
const httpClient = createHonoHttpClient(honoClient);
const effects = createGameEffectHandlers('five-seconds', httpClient, apiUrl, 'multiplayer');
```

## Build Order

```bash
# Phase 1: Shared infrastructure (no dependencies)
pnpm --filter @guess-logo/shared build

# Phase 2: Game core (depends on shared)
pnpm --filter @guess-logo/game-core build

# Phase 3: API (depends on shared, game packages)
pnpm --filter @guess-logo/api build

# Phase 4: API contracts (depends on compiled API)
pnpm --filter @guess-logo/api-contracts build

# Phase 5: Games (depends on shared, game-core)
pnpm --filter @guess-logo/five-seconds build
pnpm --filter @guess-logo/guess-logo build

# Phase 6: Everything else (api-client, frontend, admin)
turbo run build
```

## Data Flow

### Question Fetching Flow (Five Seconds)

```
┌─────────────┐
│  Frontend   │
│  (React)    │
└──────┬──────┘
       │ 1. Dispatch FETCH_QUESTION action
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Game State Machine (five-seconds reducer)                   │
│ - Pure state transitions                                    │
│ - No side effects                                            │
└──────┬──────────────────────────────────────────────────────┘
       │ 2. Action triggers effect handler
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Effect Handler (injected HttpClient)                         │
│ - Calls httpClient.get(apiUrl + '/questions/random')       │
│ - Returns LOAD_QUESTIONS action                             │
└──────┬──────────────────────────────────────────────────────┘
       │ 3. HTTP request
       ▼
┌─────────────────────────────────────────────────────────────┐
│ API Route (apps/api/src/routes/games/five-seconds/...)      │
│ - Validates request with shared schemas                     │
│ - Queries database                                          │
│ - Returns response                                          │
└──────┬──────────────────────────────────────────────────────┘
       │ 4. Response (questions data)
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Effect Handler                                               │
│ - Maps response to question objects                         │
│ - Returns LOAD_QUESTIONS action with questions              │
└──────┬──────────────────────────────────────────────────────┘
       │ 5. Dispatch LOAD_QUESTIONS action
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Game State Machine                                           │
│ - Updates state.questions array                              │
│ - Triggers SET_QUESTION                                     │
└──────┬──────────────────────────────────────────────────────┘
       │ 6. State update
       ▼
┌─────────────┐
│  Frontend   │
│  (React)    │
│  Re-renders │
└─────────────┘
```

## Layer Responsibilities

### ✅ **Application Layer** (`apps/`)
- **API**: HTTP endpoints, database access, authentication
- **Frontend**: UI, user interaction, rendering
- **Admin**: Content management interface

### ✅ **Shared Layer** (`packages/shared/`)
- **types**: TypeScript types, Zod schemas
- **schemas**: Shared validation schemas
- **utils**: Pure utility functions
- **i18n**: Internationalization data

### ✅ **Game Core Layer** (`packages/game-core/`)
- **contracts**: Game definition interfaces, effect handler contracts
- **adapters**: HTTP client adapters, multiplayer adapters
- **game-logic**: Generic game patterns (reducers, validators)
- **stores**: Zustand stores for React integration

### ✅ **Game Implementation Layer** (`packages/games/*/`)
- **definition**: Game-specific state machine
- **logic**: Game rules, actions, state transitions
- **hooks**: React hooks for game integration
- **effects**: Side effects (using injected dependencies)

### ✅ **UI Layer** (`packages/ui/`)
- **components**: Reusable UI components
- **styles**: Tailwind/ Radix UI configurations

## Testing Strategy

### Unit Tests
- Game logic (reducers, validators)
- Pure utilities (shared package)
- Effect handlers (with mocked HttpClient)

### Integration Tests
- API routes (with test database)
- Game state machine + effects
- Frontend components (with mocked API)

### E2E Tests
- Full user flows (play game, answer questions)
- Multiplayer scenarios

## Deployment Considerations

### Unified Cloudflare Workers Deployment
The API and frontend are deployed together as a single Cloudflare Worker:

- **API Route Handling**: Hono handles all API routes
- **Frontend Serving**: Static assets served from `apps/frontend/dist/` using Cloudflare Workers assets binding
- **Single Domain**: Both frontend and API served from same domain (no `api.` subdomain)
- **Relative URLs**: Production uses relative URLs (`''`), development uses `http://localhost:8787`

**Environment URLs:**
- **Development**: `http://localhost:8787` (API and frontend together)
- **Staging**: `https://staging.playgrid.mohadalaa.com`
- **Production**: `https://playgrid.mohadalaa.com`

### API Build
- Build output: `dist/` folder
- Dependencies: No path mappings, all compiled
- Runtime: Node.js compatibility mode
- Frontend assets: Built from `apps/frontend/` and served via assets binding

### Frontend Build
- Build output: `dist/` folder (served by API worker)
- Dependencies: All packages via workspace protocol
- Runtime: Browser
- API communication: Uses relative URLs in production

### Durable Objects
- Build output: Included in API build
- Runtime: Cloudflare Workers
- Important: HTTP client injection works in Workers

## Migration from v1 to v2

### Breaking Changes
1. Game packages: Effect handler factories now receive `HttpClient` parameter
2. API: Must create `HttpClient` and inject into `createGameEffectHandlers`
3. Frontend: Must create `HttpClient` and inject into game hooks
4. API routes: Import schemas from `@guess-logo/shared` instead of game packages

### Migration Checklist
- [ ] Update game effect handler signatures
- [ ] Update API route imports to use shared schemas
- [ ] Update API to create and inject HttpClient
- [ ] Update frontend to create and inject HttpClient
- [ ] Remove path mappings from tsconfig files
- [ ] Update package.json dependencies
- [ ] Run full test suite
- [ ] Deploy to staging environment
- [ ] Verify all games work correctly

---

## References

- [ADR 002: Breaking Circular Dependencies](../decisions/002-break-circular-dependencies.md)
- [Implementation Plan](../refactoring/002-implementation-plan.md)
- [Turbo](https://turbo.build/repo/docs)
- [Hono](https://hono.dev/docs)
- [Zod](https://zod.dev)
