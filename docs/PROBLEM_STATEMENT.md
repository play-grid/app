# Problem Statement: Circular Dependencies & Architectural Issues

**Date:** Feb 6, 2026
**Status:** Identified
**Related Documentation:**
- [ADR 002: Breaking Circular Dependencies](./decisions/002-break-circular-dependencies.md)
- [Implementation Plan](./refactoring/002-implementation-plan.md)
- [Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md)

---

## Overview

The (PlayGrid) monorepo has several architectural issues that create technical debt and fragility. These issues impact build reliability, maintainability, and ability to scale the platform.

---

## Problem 1: Circular Dependencies

### Description

There is a circular dependency chain across multiple packages:

```
api-client → api/routes (via path mapping to source) → api → five-seconds → api-client
```

### Impact

1. **Build Order Complexity**: Build scripts must carefully orchestrate package order to avoid cycles
2. **Fragile Builds**: Changes in one package can break builds in seemingly unrelated packages
3. **Production Deployment Risk**: Source file access may break in production builds
4. **Difficult Dependency Reasoning**: Hard to understand which package actually depends on what
5. **Testing Complications**: Tests may pass locally but fail in CI/production due to different build states

### Where This Occurs

**Path Mappings to Source:**
- `packages/api-client/tsconfig.json` maps `@playgrid/api/routes` to `../../apps/api/src/routes/index.ts` (SOURCE)
- `packages/games/five-seconds/tsconfig.json` maps `@playgrid/api/routes` to same source file
- `packages/games/guess-logo/tsconfig.json` maps `@playgrid/api/routes` to same source file

**Peer Dependencies:**
- `packages/games/five-seconds/package.json` has `@playgrid/api-client` as peerDependency
- `packages/games/five-seconds/src/logic/effect-handlers.ts` imports from api-client

**API Imports Games:**
- `apps/api/src/routes/games/five-seconds/questions/questions.schemas.ts` imports from `@playgrid/five-seconds`
- `apps/api/src/routes/games/five-seconds/categories/categories.schemas.ts` imports from `@playgrid/five-seconds`

### Related Documentation

- [ADR 002: Breaking Circular Dependencies](./decisions/002-break-circular-dependencies.md) - Detailed analysis of this issue

---

## Problem 2: Path Mappings to Source Files

### Description

Multiple TypeScript configuration files map imports to source files instead of compiled package outputs.

### Current State

```json
// packages/api-client/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@playgrid/api/routes": ["../../apps/api/src/routes/index.ts"]
      //                                ^^^^^ SOURCE FILE, not compiled output!
    }
  }
}
```

### Impact

1. **Build Breaks in Production**: When API is compiled, the path becomes invalid
2. **Type Inconsistency**: TypeScript sees source, runtime sees compiled code
3. **Modularity Violation**: Packages depend on internal implementation, not public API
4. **Deployment Failures**: Wrangler/Cloudflare builds may fail to find modules
5. **Package Publishing**: Cannot publish packages independently

### Affected Packages

1. `packages/api-client`
2. `packages/games/five-seconds`
3. `packages/games/guess-logo`

### Related Documentation

- [Dependency Comparison](./architecture/dependency-comparison.md) - Visual comparison of path mapping issues

---

## Problem 3: Wrong Direction Coupling

### Description

Architecture has dependencies in the wrong direction between layers.

### Specific Issues

**API Imports from Games (Wrong Direction):**
```
apps/api (backend) → imports from → packages/games/five-seconds (game logic)
```

- API routes import `baseQuestionSchema` and `categoryBaseSchema` from five-seconds package
- This means backend depends on game implementation details
- API should define its own schemas or import from shared layer

**Games Import Infrastructure (Wrong Direction):**
```
packages/games/five-seconds (game logic) → imports from → packages/api-client (infrastructure)
```

- Game effect handlers directly import and create HTTP clients
- Games should be pure and not depend on HTTP implementation
- HTTP client should be injected via dependency injection

### Impact

1. **Separation of Concerns Violation**: Game logic mixed with infrastructure concerns
2. **Testability**: Game logic difficult to test without actual HTTP client
3. **Portability**: Games cannot be reused without the specific HTTP client
4. **Circular Dependency Risk**: Creates or contributes to dependency cycles
5. **Inconsistent Patterns**: Some games use api-client, others don't

### Related Documentation

- [Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md) - Rule about separation of concerns
- [ADR 002: Breaking Circular Dependencies](./decisions/002-break-circular-dependencies.md) - Coupling analysis

---

## Problem 4: Mixed Concerns in Game Packages

### Description

Game packages contain logic that mixes game rules with infrastructure concerns.

### Example: Five Seconds Effect Handlers

```typescript
// packages/games/five-seconds/src/logic/effect-handlers.ts
import hcWithType from '@playgrid/api-client'; // Infrastructure concern

export function createFetchQuestionsEffect(apiUrl: string): GameEffect {
  const client = hcWithType(apiUrl); // Creates HTTP client directly
  // Game fetches questions using HTTP
}
```

### Issues

1. **Game Logic Not Pure**: Effect handlers include HTTP client creation
2. **Testing Difficulty**: Need to mock API calls in game logic tests
3. **Infrastructure in Wrong Layer**: HTTP client details in game implementation
4. **Coupling**: Game is tied to this specific API implementation
5. **Inconsistent**: Guess Logo game doesn't use this pattern

### Related Documentation

- [Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md) - General constraint on game logic separation
- [ADR 002: Breaking Circular Dependencies](./decisions/002-break-circular-dependencies.md) - Detailed analysis

---

## Problem 5: Inconsistent Patterns Between Games

### Description

Different games use different patterns for similar functionality.

### Five Seconds Game

```typescript
// Has api-client as peerDependency
// Imports api-client in effect handlers
// Uses HTTP client directly
```

### Guess Logo Game

```typescript
// No api-client peerDependency
// Does not import api-client
// May fetch data differently
```

### Impact

1. **Confusion**: Developers must learn multiple patterns
2. **Onboarding Complexity**: New games don't have clear example to follow
3. **Inconsistent Testing**: Each game needs different test setup
4. **Code Review Burden**: Different patterns to review for each game
5. **Maintenance Overhead**: Changes must be applied to multiple implementations

### Related Documentation

- [System Context](./SYSTEM_CONTEXT.md) - Overview of game patterns

---

## Problem 6: Multiple tsconfig Files with Overlapping Configurations

### Description

The monorepo has 15+ TypeScript configuration files with subtle differences and overlapping settings.

### Current State

- Root `tsconfig.json` with base configuration
- Package-level `tsconfig.json` files extending base
- Package-level `tsconfig.build.json` files for build output
- Multiple packages define similar path mappings
- Duplicate compiler options across files

### Impact

1. **Configuration Drift**: Files diverge over time without clear process
2. **TypeScript Inconsistency**: Different packages may compile differently
3. **Maintenance Overhead**: Changes need to be applied to multiple files
4. **Unclear Responsibility**: Which file should contain what configuration?
5. **Error-Prone**: Easy to make mistakes or miss updates

### Affected Files

Examples (not exhaustive):
- `tsconfig.json` (root)
- `packages/api-client/tsconfig.json`
- `packages/games/five-seconds/tsconfig.json`
- `packages/games/five-seconds/tsconfig.build.json`
- `packages/games/guess-logo/tsconfig.json`
- `apps/api/tsconfig.json`
- `apps/frontend/tsconfig.json`
- `apps/admin/tsconfig.json`
- And 7+ more

### Related Documentation

- [Dependency Comparison](./architecture/dependency-comparison.md) - Package structure overview

---

## Summary of Issues

| Issue | Severity | Affected Packages | Impact Area |
|--------|-----------|-------------------|---------------|
| Circular Dependencies | HIGH | api-client, api, five-seconds | Build reliability |
| Path Mappings to Source | HIGH | api-client, five-seconds, guess-logo | Production builds |
| Wrong Direction Coupling | HIGH | api, five-seconds | Maintainability |
| Mixed Concerns | MEDIUM | five-seconds | Testability |
| Inconsistent Patterns | MEDIUM | all games | Onboarding |
| Duplicate Configs | LOW | all packages | Maintenance |

---

## References for Solutions

This document describes problems only. For proposed solutions, see:

- **[ADR 002: Breaking Circular Dependencies](./decisions/002-break-circular-dependencies.md)** - High-level architectural decision
- **[Implementation Plan](./refactoring/002-implementation-plan.md)** - Detailed step-by-step plan
- **[Constraint: game-core Must Be Agnostic](./CONSTRAINTS/game-core-agnostic.md)** - Design constraints
- **[Dependency Comparison](./architecture/dependency-comparison.md)** - Before/after visualization
- **[System Context](./SYSTEM_CONTEXT.md)** - System overview

---

**Last Updated:** Feb 6, 2026
