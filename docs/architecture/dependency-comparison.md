# Visual Dependency Comparison

**Version**: v1 (Current) → v2 (Target)
**Date**: Feb 6, 2026

## Current Architecture (v1) - ❌ WITH CYCLES

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           APPLICATIONS LAYER                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐        ┌─────────────────┐        ┌──────────────┐ │
│  │   frontend      │        │      api        │        │    admin     │ │
│  │                 │        │                 │        │              │ │
│  │ deps:           │        │ deps:           │        │ deps:        │ │
│  │ - api-client    │        │ - five-seconds  │        │ - api-client │ │
│  │ - games         │        │ - guess-logo    │        │              │ │
│  │ - game-core     │        │ - game-core     │        │              │ │
│  │ - shared        │        │ - shared        │        │              │ │
│  │ - ui            │        │                 │        │              │ │
│  └─────────────────┘        └─────────────────┘        └──────────────┘ │
│           │                          │                          │         │
│           │ imports                 │ imports                   │ imports │
│           ▼                          ▼                          ▼         │
│  ┌─────────────────┐        ┌─────────────────┐        ┌──────────────┐ │
│  │   api-client    │        │    five-seconds │        │ api-client   │ │
│  │                 │        │                 │        │              │ │
│  │ deps:           │        │ deps:           │        │              │ │
│  │ NONE ❌         │        │ - game-core     │        │              │ │
│  │                 │        │ - shared        │        │              │
│  │ BUT imports:    │        │ - logger        │        │              │ │
│  │ @guess-logo/    │        │                 │        │              │ │
│  │ api/routes      │        │ peerDeps:       │        │              │ │
│  │ (via tsconfig   │        │ - api-client ❌ │        │              │ │
│  │  path mapping   │        │                 │        │              │ │
│  │  to SOURCE!)    │        │ effect-handlers:│        │              │ │
│  │                 │        │ imports         │        │              │ │
│  │                 │        │ api-client ❌   │        │              │ │
│  └────────┬────────┘        └─────────────────┘        └──────────────┘ │
│           │                          │                                     │
│           │ import (path map)         │ import                              │
│           ▼                          ▼                                     │
│  ┌─────────────────┐        ┌─────────────────┐                          │
│  │  api/routes     │        │   api-contracts │                          │
│  │  (SOURCE FILE)  │        │   ❌ MISSING    │                          │
│  │  ❌ SHOULD BE   │        │                │                          │
│  │  COMPILED!      │        │                │                          │
│  └─────────────────┘        └─────────────────┘                          │
│                                                                           │
│  🔴 CIRCULAR DEPENDENCY:                                                 │
│  api-client → api/routes → api → five-seconds → api-client               │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## Target Architecture (v2) - ✅ NO CYCLES

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           APPLICATIONS LAYER                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐        ┌─────────────────┐        ┌──────────────┐ │
│  │   frontend      │        │      api        │        │    admin     │ │
│  │                 │        │                 │        │              │ │
│  │ deps:           │        │ deps:           │        │ deps:        │ │
│  │ - api-client    │        │ - game-core     │        │ - api-client │ │
│  │ - games         │        │ - games (for    │        │              │ │
│  │ - game-core     │        │   registration) │        │              │ │
│  │ - shared        │        │ - shared        │        │              │ │
│  │ - ui            │        │ - api-contracts │        │              │ │
│  └────────┬────────┘        └────────┬────────┘        └──────┬───────┘ │
│           │                          │                         │         │
│           │ imports                 │ imports                │ imports │
│           ▼                          ▼                         ▼         │
│  ┌─────────────────┐        ┌─────────────────┐        ┌──────────────┐ │
│  │   api-client    │        │  api-contracts  │        │ api-client   │ │
│  │                 │        │                 │        │              │ │
│  │ deps:           │        │ deps:           │        │              │ │
│  │ - api-contracts │        │ - api (build    │        │              │ │
│  │ ✅              │        │   output only)  │        │              │ │
│  │                 │        │ ✅              │        │              │ │
│  │ NO PATH MAPPING │        │ imports from   │        │              │ │
│  │ ✅              │        │ COMPILED API    │        │              │ │
│  └─────────────────┘        └─────────────────┘        └──────────────┘ │
│                                           │                                     │
│                                           │ import                             │
│                                           ▼                                     │
│                                  ┌─────────────────┐                          │
│                                  │   api/routes    │                          │
│                                  │   (COMPILED)    │                          │
│                                  │   ✅            │                          │
│                                  └─────────────────┘                          │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓ imports
┌──────────────────────────────────────────────────────────────────────────┐
│                            PACKAGES LAYER                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    SHARED INFRASTRUCTURE                          │    │
│  ├──────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │    │
│  │  │   shared     │  │  game-core   │  │   api-contracts       │   │    │
│  │  │              │  │              │  │                       │   │    │
│  │  │ deps: NONE   │  │ deps:        │  │ deps: api (build)     │   │    │
│  │  │ ✅ PURE      │  │ - shared     │  │ ✅                   │   │    │
│  │  │              │  │              │  │                       │   │    │
│  │  │ exports:     │  │ exports:     │  │ exports:              │   │    │
│  │  │ - types/     │  │ - contracts/ │  │ - RouterType          │   │    │
│  │  │   games/     │  │ - adapters/  │  │                       │   │    │
│  │  │ - schemas    │  │ - game-logic │  │                       │   │    │
│  │  │ - utils      │  │ - stores/    │  │                       │   │    │
│  │  └──────────────┘  └──────────────┘  └────────────────────────┘   │    │
│  │          ▲                  ▲                  ▲                     │    │
│  └──────────┼──────────────────┼──────────────────┼─────────────────────┘    │
│             │                  │                  │                         │
│             │                  │                  │                         │
│             └──────────────────┼──────────────────┘                         │
│                                │ imports                                    │
│                                ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                       GAMES LAYER                                │    │
│  ├──────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  ┌──────────────────┐        ┌──────────────────┐                │    │
│  │  │  five-seconds   │        │   guess-logo     │                │    │
│  │  │                 │        │                  │                │    │
│  │  │ deps:           │        │ deps:            │                │    │
│  │  │ - game-core     │        │ - game-core      │                │    │
│  │  │ - shared        │        │ - shared         │                │    │
│  │  │                 │        │                  │                │    │
│  │  │ NO api-client   │        │ NO api-client    │                │    │
│  │  │ ✅              │        │ ✅               │                │    │
│  │  │                 │        │                  │                │    │
│  │  │ HttpClient      │        │ HttpClient       │                │    │
│  │  │ INJECTED via    │        │ INJECTED via     │                │    │
│  │  │ factory ✅      │        │ factory ✅       │                │    │
│  │  └──────────────────┘        └──────────────────┘                │    │
│  │                                                                   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                        UI LAYER                                   │    │
│  ├──────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  ┌──────────────────┐        ┌──────────────────┐                │    │
│  │  │       ui         │        │      logger      │                │    │
│  │  │                  │        │                  │                │    │
│  │  │ deps: NONE       │        │ deps: NONE       │                │    │
│  │  └──────────────────┘        └──────────────────┘                │    │
│  │                                                                   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  🟢 NO CIRCULAR DEPENDENCIES ✅                                          │
│                                                                           │
│  Dependencies flow DOWNWARD only:                                        │
│  Applications → Packages → Shared                                       │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## Key Differences

| Aspect | v1 (Current) | v2 (Target) |
|--------|-------------|-------------|
| **Circular Dependencies** | ❌ YES | ✅ NO |
| **Path Mappings** | ❌ To source files | ✅ Removed or to compiled |
| **api-client deps** | ❌ None (but imports source) | ✅ api-contracts |
| **Games import api-client** | ❌ YES (five-seconds) | ✅ NO (injected) |
| **API imports game schemas** | ❌ YES | ✅ NO (from shared) |
| **api-contracts package** | ❌ MISSING | ✅ EXISTS |
| **HttpClient injection** | ❌ NO | ✅ YES |

## Import Flow Examples

### v1: Question Fetching

```
Frontend (React)
  ↓ uses
api-client (Hono hc)
  ↓ imports (via path mapping to source)
api/routes/index.ts
  ↓ registered by
API app
  ↓ imports
five-seconds package
  ↓ imports (peer dependency)
api-client ← CYCLE! ❌
```

### v2: Question Fetching

```
Frontend (React)
  ↓ uses
api-client (Hono hc)
  ↓ imports
api-contracts (RouterType from compiled API)
  ↓ imports
api (compiled output) ✅

When creating game effects:
Frontend
  ↓ creates
honoClient = hcWithType(apiUrl)
  ↓ wraps with adapter
httpClient = createHonoHttpClient(honoClient)
  ↓ injects into
createGameEffectHandlers('five-seconds', httpClient, apiUrl)
  ↓ calls
five-seconds effect handlers
  ↓ uses (injected)
httpClient.get(url)
  ↓ requests
API routes
  ↓ returns data
Frontend ✅
```

## Dependency Graph Comparison

### v1 Dependency Matrix

```
                    api-client  api  five-seconds  guess-logo  game-core  shared
──────────────────────────────────────────────────────────────────────────
api-client        ────────      ❌       ❌             ❌          ❌        ❌
api                ✅CYCLE!    ──────     ✅              ✅          ✅        ✅
five-seconds      ✅CYCLE!    ─────      ─────────────   ❌          ✅        ✅
guess-logo        ❌         ─────      ❌              ─────────    ✅        ✅
game-core         ❌         ─────      ❌              ❌         ──────      ✅
shared            ❌         ─────      ❌              ❌          ❌       ──────

❌ = No dependency
✅ = Has dependency
✅CYCLE! = Circular dependency
```

### v2 Dependency Matrix

```
                    api-client  api-contracts  api  five-seconds  guess-logo  game-core  shared
──────────────────────────────────────────────────────────────────────────────────
api-client        ────────        ✅           ❌       ❌             ❌          ❌        ❌
api-contracts      ❌           ────────────   ✅       ❌             ❌          ❌        ❌
api                ❌              ❌        ──────     ✅              ✅          ✅        ✅
five-seconds       ❌              ❌           ─────    ─────────────   ❌          ✅        ✅
guess-logo         ❌              ❌           ─────    ❌           ─────────     ✅        ✅
game-core          ❌              ❌           ─────    ❌              ❌         ──────      ✅
shared             ❌              ❌           ─────    ❌              ❌          ❌       ──────

❌ = No dependency
✅ = Has dependency (acyclic)
```

## Schema Import Comparison

### v1: API Imports from Games (Wrong Direction)

```typescript
// apps/api/src/routes/games/five-seconds/questions/questions.schemas.ts
import { baseQuestionSchema } from '@guess-logo/five-seconds';
// ^ Depends on game package ❌

// packages/games/five-seconds/package.json
{
  "peerDependencies": {
    "@guess-logo/api-client": "workspace:*" // Depends on api-client ❌
  }
}
```

**Result**: Circular dependency: API → five-seconds → api-client → API

### v2: Both Import from Shared (Correct)

```typescript
// apps/api/src/routes/games/five-seconds/questions/questions.schemas.ts
import { baseQuestionSchema } from '@guess-logo/shared/types/games/five-seconds.schema';
// ^ Imports from shared ✅

// packages/games/five-seconds/src/schema.ts
export { baseQuestionSchema } from '@guess-logo/shared/types/games/five-seconds.schema';
// ^ Re-exports from shared ✅

// packages/games/five-seconds/package.json
{
  "dependencies": {
    "@guess-logo/shared": "workspace:*" // Only depends on shared ✅
  }
}
```

**Result**: No circular dependency ✅

## Summary

### The Problem (v1)
- 🔴 Circular dependencies break build order
- 🔴 Path mappings to source files are fragile
- 🔴 Wrong direction coupling (API ← Games, Games ← API client)

### The Solution (v2)
- 🟢 Clean layered architecture
- 🟢 All imports from compiled packages
- 🟢 Shared schemas eliminate duplication
- 🟢 Dependency injection for infrastructure concerns
- 🟢 No circular dependencies

---

## Related Documentation

- [ADR 002: Breaking Circular Dependencies](../decisions/002-break-circular-dependencies.md)
- [Architecture Overview v2](./monorepo-structure-v2.md)
- [Implementation Plan](../refactoring/002-implementation-plan.md)
