# Documentation

This directory contains architecture documentation, architecture decision records (ADRs), and refactoring guides for the guess-logo monorepo.

## 📚 Quick Navigation

### New? Start Here
- **[Problem Statement](PROBLEM_STATEMENT.md)** - Overview of current architectural issues (start here for context)
- **[System Context](SYSTEM_CONTEXT.md)** - High-level overview of PlayGrid platform architecture and core concepts
- **[Quick Reference](architecture/quick-reference.md)** - Developer guide for common patterns and how to work with codebase
- **[Architecture Overview v2](architecture/monorepo-structure-v2.md)** - Complete system architecture with dependency graph

### Refactoring Documentation (Active)
- **[Refactoring Index](REFRACTORING_INDEX.md)** - Master index for all refactoring documentation
- **[ADR 002: Breaking Circular Dependencies](decisions/002-break-circular-dependencies.md)** - Why we're refactoring the architecture
- **[Implementation Plan](refactoring/002-implementation-plan.md)** - Step-by-step guide to break circular dependencies
- **[Dependency Comparison](architecture/dependency-comparison.md)** - Visual comparison before/after refactoring

### Architecture Decision Records (ADRs)
| ID | Title | Status |
|----|-------|--------|
| [001](decisions/001-explicit-dataprovider.md) | Explicit, Type-Safe DataProvider for React-Admin | Accepted |
| [002](decisions/002-break-circular-dependencies.md) | Breaking Circular Dependencies | Proposed |

### Architecture Documents
| Document | Description |
|----------|-------------|
| [System Context](SYSTEM_CONTEXT.md) | High-level platform overview with core concepts and data flows |
| [Monorepo Structure v2](architecture/monorepo-structure-v2.md) | Target architecture with dependency graph and data flow |
| [Quick Reference](architecture/quick-reference.md) | Developer guide for creating games, API routes, and using dependencies |
| [Dependency Comparison](architecture/dependency-comparison.md) | Visual comparison of v1 vs v2 architecture |

### Constraints & Rules
| Document | Description |
|----------|-------------|
| [game-core Must Be Agnostic](CONSTRAINTS/game-core-agnostic.md) | Constraint that game-core must not contain game-specific logic |

## 🎯 Current Architecture Status

### Version
- **Current**: v1 (with circular dependencies)
- **Target**: v2 (clean layered architecture)

### Known Issues

For detailed analysis of all architectural issues, see **[Problem Statement](PROBLEM_STATEMENT.md)**.

**Summary:**
1. 🔴 Circular dependencies across multiple packages
2. 🔴 Path mappings point to source files instead of compiled output
3. 🔴 Wrong direction coupling between layers
4. 🔴 Mixed concerns in game packages
5. 🔴 Inconsistent patterns between games
6. 🔴 Multiple tsconfig files with overlapping configurations

### Target Architecture
- 🟢 Clean layered: Applications → Packages → Shared
- 🟢 No circular dependencies
- 🟢 All imports from compiled packages
- 🟢 Dependency injection for infrastructure concerns

## 📖 Documentation Structure

```
docs/
├── README.md                    # This file
├── SYSTEM_CONTEXT.md            # High-level system overview and core concepts
├── REFRACTORING_INDEX.md        # Master refactoring documentation index
│
├── decisions/                   # Architecture Decision Records (ADRs)
│   ├── 001-explicit-dataprovider.md
│   └── 002-break-circular-dependencies.md
│
├── architecture/                # Architecture documentation
│   ├── monorepo-structure-v2.md      # Target architecture overview
│   ├── quick-reference.md            # Developer quick reference
│   └── dependency-comparison.md      # Before/after comparison
│
└── refactoring/                 # Refactoring implementation guides
    └── 002-implementation-plan.md     # Step-by-step refactoring plan
```

## 🚀 Getting Started

### For New Developers
1. Read [System Context](SYSTEM_CONTEXT.md) for high-level understanding of the platform
2. Read [Quick Reference](architecture/quick-reference.md) to understand common patterns
3. Review [Architecture Overview v2](architecture/monorepo-structure-v2.md) to understand the system
4. Check [ADR 002](decisions/002-break-circular-dependencies.md) for context on current refactoring

### For Developers Working on Refactoring
1. Start with [Refactoring Index](REFRACTORING_INDEX.md)
2. Read [ADR 002](decisions/002-break-circular-dependencies.md) for rationale
3. Follow [Implementation Plan](refactoring/002-implementation-plan.md) step-by-step
4. Reference [Quick Reference](architecture/quick-reference.md) for code patterns

### For Reviewers
1. Review [ADR 002](decisions/002-break-circular-dependencies.md) for problem/solution
2. Check [Dependency Comparison](architecture/dependency-comparison.md) for visual changes
3. Verify [Implementation Plan](refactoring/002-implementation-plan.md) was followed

## 📝 Documentation Guidelines

### Writing New ADRs
1. Use template from [ADR 001](decisions/001-explicit-dataprovider.md)
2. Include context, alternatives considered, and consequences
3. Reference related ADRs
4. Update this README with new ADR

### Updating Architecture Docs
1. Keep diagrams up-to-date with actual code
2. Update dependency graphs after structural changes
3. Update quick reference when new patterns emerge
4. Cross-reference related documents

### Adding Refactoring Guides
1. Follow format of [Implementation Plan](refactoring/002-implementation-plan.md)
2. Include step-by-step instructions with code examples
3. Add rollback procedures
4. List success criteria
5. Update [Refactoring Index](REFRACTORING_INDEX.md)

## 🔍 Key Concepts

### Dependency Injection
Games receive HTTP clients via factory functions rather than importing them directly.

```typescript
// ✅ Correct: Injected dependency
registerGame(game, (httpClient, apiUrl) => createEffects(httpClient, apiUrl));

// ❌ Avoid: Direct import
import hcWithType from '@playgrid/api-client';
const client = hcWithType(apiUrl);
```

### Shared Schemas
Game data schemas live in `@playgrid/shared/types/games/` and are imported by both API and games.

```typescript
// ✅ Correct: Import from shared
import { gameStateSchema } from '@playgrid/shared/types/games/my-game.schema';

// ❌ Avoid: API imports from games
import { gameStateSchema } from '@playgrid/my-game';
```

### Contract Pattern
API types are extracted to `@playgrid/api-contracts` package to break circular dependencies.

```typescript
// ✅ Correct: Import from contracts
import type { RouterType } from '@playgrid/api-contracts';

// ❌ Avoid: Import via path mapping
import type { router } from '@playgrid/api/routes';
```

## 📊 Current Package Structure

### Applications (`apps/`)
- `frontend` - React Vite app
- `api` - Hono backend on Cloudflare Workers
- `admin` - Admin panel

### Packages (`packages/`)
- `shared` - Types, schemas, utilities
- `game-core` - Game contracts, adapters, state management
- `api-contracts` - API router types (target: v2)
- `api-client` - Type-safe Hono client
- `five-seconds` - Five Seconds game
- `guess-logo` - Guess the Logo game
- `ui` - Shared UI components
- `logger` - Logging utilities

## 🔗 External Resources

- [Turbo](https://turbo.build/repo/docs) - Monorepo build system
- [Hono](https://hono.dev/docs) - Web framework
- [Zod](https://zod.dev) - TypeScript-first schema validation
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - Edge compute platform
- [Radix UI](https://www.radix-ui.com/) - UI primitives

## 📧 Questions or Suggestions?

1. Check existing documentation first
2. Look for similar patterns in the codebase
3. Ask in team chat or create an issue

---

**Last Updated**: Feb 7, 2026
