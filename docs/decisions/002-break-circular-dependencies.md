# Breaking Circular Dependencies: api ↔ five-seconds ↔ api-client

**Status**: Proposed
**Date**: Feb 6, 2026
**Related ADRs**: 001-explicit-dataprovider.md

## Context

The current monorepo has a critical circular dependency chain:

```
api-client
  ├─ imports: '@playgrid/api/routes' (via tsconfig path mapping to source)
  └─ depends on: apps/api/src/routes/index.ts
         ↓
apps/api
  ├─ dependencies: @playgrid/five-seconds, @playgrid/guess-logo
  └─ imports schemas from game packages
         ↓
@playgrid/five-seconds
  ├─ peerDependency: @playgrid/api-client
  └─ effect-handlers.ts imports: import hcWithType from '@playgrid/api-client'
         ↓
⬆️ BACK TO api-client ⬆️
```

### Why This Is Problematic

1. **Fragile Builds**: Build order must be carefully orchestrated
2. **Path Mapping to Source**: `api-client` imports from `apps/api/src/routes/index.ts` (not compiled output)
3. **Production Deployment Risk**: Source file access breaks in production builds
4. **Wrong Direction Coupling**:
   - API imports game schemas (should be shared)
   - Game logic imports HTTP client (should be injected)

## Decision

### Phase 1: Extract Shared Schemas

Move data schemas from game packages to shared layer:

**Before:**
```
@playgrid/five-seconds/src/schema.ts (baseQuestionSchema, categoryBaseSchema)
  ↓ imported by
apps/api/src/routes/games/five-seconds/questions/questions.schemas.ts
```

**After:**
```
@playgrid/shared/types/games/five-seconds.schema.ts
  ↓ imported by
apps/api/src/routes/games/five-seconds/questions/questions.schemas.ts
@playgrid/five-seconds/src/schema.ts (re-exports from shared)
```

### Phase 2: Create api-contracts Package

Extract router type to separate package:

**Before:**
```
@playgrid/api-client/index.ts
  ├─ imports: type { router } from '@playgrid/api/routes'
  └─ path mapping points to: ../../apps/api/src/routes/index.ts
```

**After:**
```
@playgrid/api-contracts/index.ts
  └─ exports: type { RouterType } from './router-type.generated.ts'
     (generated from compiled API output)

@playgrid/api-client/index.ts
  └─ imports: type { RouterType } from '@playgrid/api-contracts'
```

### Phase 3: Dependency Injection for HTTP Client

Remove `api-client` from game packages, inject via factory:

**Before:**
```typescript
// @playgrid/five-seconds/src/logic/effect-handlers.ts
import hcWithType from '@playgrid/api-client';

export function createFetchQuestionsEffect(apiUrl: string): GameEffect {
  const client = hcWithType(apiUrl); // ❌ Game creates HTTP client
  // ...
}
```

**After:**
```typescript
// @playgrid/five-seconds/src/logic/effect-handlers.ts
export interface HttpClient {
  get: (url: string, query?: any) => Promise<Response>;
}

export function createFetchQuestionsEffect(
  httpClient: HttpClient,
  apiUrl: string
): GameEffect {
  // Use injected client
  // ...
}

// @playgrid/api/src/app.ts or game-session.object.ts
const client = hcWithType(apiUrl);
const effects = createFiveSecondsEffects(client, apiUrl);
```

### Phase 4: Remove Path Mappings

All imports use proper package exports:

**Before:**
```json
// packages/api-client/tsconfig.json
{
  "paths": {
    "@playgrid/api/routes": ["../../apps/api/src/routes/index.ts"]
  }
}
```

**After:**
```json
// No path mappings needed - all imports use package exports
{
  "compilerOptions": {
    "paths": {}
  }
}
```

## Alternatives Considered

### Alternative 1: Keep Current Structure + Build Scripts
- **Rejected**: Doesn't solve architectural issues
- Complexity increases with each new package

### Alternative 2: Monolithic Package
- **Rejected**: Loses benefits of monorepo
- Would require massive restructure

### Alternative 3: Use Nx/Turbo workspace aliases
- **Rejected**: Doesn't fix coupling, just masks it
- Path to source still fragile

## Consequences

### Positive

1. **No Circular Dependencies**: Clear dependency hierarchy
2. **Type Safety**: All imports from compiled packages
3. **Portability**: Game packages don't depend on infrastructure
4. **Testability**: Can mock HTTP client in game logic tests
5. **Build Simplicity**: Build order follows dependency graph

### Negative

1. **Breaking Changes**: Requires coordinated update across packages
2. **Initial Effort**: ~8-12 hours of refactoring work
3. **Additional Package**: `@playgrid/api-contracts` adds complexity
4. **Indirection**: HTTP client adds one level of abstraction

### Migration Path

See `docs/refactoring/002-implementation-plan.md` for detailed steps.

## Future Considerations

1. **OpenAPI Schema Generation**: Auto-generate client from API contract
2. **Versioned Contracts**: Support multiple API versions
3. **Contract Testing**: Validate API routes match contracts
4. **Game Protocol Standardization**: Common pattern for game-data APIs

## References

- [Turbo](https://turbo.build/repo/docs) - Monorepo build system
- [Hono Client](https://hono.dev/docs/guides/rpc) - Type-safe RPC client
- [Zod](https://zod.dev/) - TypeScript-first schema validation
