# Refactoring Documentation Index

**Last Updated**: Feb 6, 2026

## Overview

This directory contains comprehensive documentation for breaking circular dependencies and refactoring the monorepo architecture.

## Problem Statement

The current monorepo has a critical circular dependency chain:

```
api-client → api/routes (via path mapping to source) → api → five-seconds → api-client
```

### Key Issues

1. **Circular Dependencies**: Breaks build order and modularity
2. **Path Mapping to Source**: Fragile, breaks in production builds
3. **Wrong Direction Coupling**: API imports from game packages, games import API client
4. **Mixed Concerns**: Game logic depends on infrastructure (HTTP client)

## Documentation Structure

### 📋 Architecture Decision Records (ADRs)

| Document | Description | Status |
|----------|-------------|--------|
| [001-explicit-dataprovider.md](../decisions/001-explicit-dataprovider.md) | Explicit data provider pattern for admin panel | Accepted |
| [002-break-circular-dependencies.md](../decisions/002-break-circular-dependencies.md) | High-level decision to break circular dependencies | Proposed |

### 🏗️ Architecture Documents

| Document | Description |
|----------|-------------|
| [monorepo-structure-v2.md](./monorepo-structure-v2.md) | Target architecture with dependency graph |
| [quick-reference.md](./quick-reference.md) | Developer guide for working with new architecture |

### 🔧 Refactoring Plans

| Document | Description | Estimated Time |
|----------|-------------|----------------|
| [002-implementation-plan.md](../refactoring/002-implementation-plan.md) | Step-by-step implementation guide | 8-12 hours |

## Quick Links

### For Developers
- **Start Here**: [Quick Reference](./quick-reference.md) - How to work with the new architecture
- **Big Picture**: [Architecture Overview v2](./monorepo-structure-v2.md) - Complete system design

### For Architects/Tech Leads
- **Decision**: [ADR 002](../decisions/002-break-circular-dependencies.md) - Why we're refactoring
- **Plan**: [Implementation Plan](../refactoring/002-implementation-plan.md) - Detailed steps

### For Managers
- **Rationale**: [ADR 002](../decisions/002-break-circular-dependencies.md) - Problem and solution
- **Timeline**: [Implementation Plan](../refactoring/002-implementation-plan.md) - Phase breakdown

## Refactoring Phases

### Phase 1: Extract Shared Schemas (2 hours)
Move game data schemas from game packages to shared layer.

**Impact**: Breaks API → Game schema coupling

### Phase 2: Create api-contracts Package (2 hours)
Extract router type to separate package, remove path mappings.

**Impact**: Breaks api-client → API coupling

### Phase 3: Dependency Injection for HTTP Client (3 hours)
Remove api-client from game packages, inject via factory pattern.

**Impact**: Breaks Game → api-client coupling

### Phase 4: Remove Path Mappings (1 hour)
Clean up all tsconfig path mappings to source.

**Impact**: Improves build reliability

### Phase 5: Testing & Validation (2-4 hours)
Comprehensive testing of all changes.

**Impact**: Ensures no regressions

### Phase 6: Documentation Updates (30 minutes)
Update architecture docs and onboarding guides.

**Impact**: Knowledge transfer

## Before vs After

### Before (Current)

```
┌──────────────────────────────────────┐
│  circular dependencies exist           │
│  api-client → api → games → api-client│
└──────────────────────────────────────┘

Problems:
- Build order is fragile
- Path mappings point to source
- Games import HTTP client
- API imports game schemas
```

### After (Target)

```
┌──────────────────────────────────────┐
│  clean layered architecture           │
│  Apps → Packages → Shared             │
│  No cycles!                           │
└──────────────────────────────────────┘

Benefits:
- Clear dependency hierarchy
- All imports from compiled packages
- Games use dependency injection
- Shared schemas eliminate duplication
```

## Key Changes

### New Packages

- `@guess-logo/api-contracts` - API router types (extracted from API build output)

### New Patterns

- **Shared Schemas**: All game data schemas in `@guess-logo/shared/types/games/`
- **Dependency Injection**: HTTP client injected into effect handlers
- **Contract Pattern**: API types exported via separate package

### Removed Patterns

- ❌ Path mappings to source files
- ❌ Game packages importing api-client
- ❌ API importing game package schemas
- ❌ Cyclic dependencies

## Success Criteria

- [ ] No circular dependencies (verified with dependency graph tool)
- [ ] All path mappings removed or point to compiled packages
- [ ] Game packages don't import api-client directly
- [ ] All type checks pass
- [ ] All builds succeed
- [ ] All tests pass
- [ ] Manual testing confirms functionality unchanged

## Rollback Plan

If issues arise after deployment:

1. Revert all commits in reverse order
2. Restore package.json backups
3. Run `pnpm install` and `pnpm build`
4. Test all functionality

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1 | 2 hours | TBD | TBD |
| Phase 2 | 2 hours | TBD | TBD |
| Phase 3 | 3 hours | TBD | TBD |
| Phase 4 | 1 hour | TBD | TBD |
| Phase 5 | 2-4 hours | TBD | TBD |
| Phase 6 | 30 min | TBD | TBD |
| **Total** | **8-12 hours** | | |

## Questions?

- **Technical Questions**: Refer to [Quick Reference](./quick-reference.md)
- **Architecture Questions**: Refer to [Architecture Overview](./monorepo-structure-v2.md)
- **Implementation Questions**: Refer to [Implementation Plan](../refactoring/002-implementation-plan.md)

## Next Steps

1. **Review Documentation**: Read ADR 002 and Implementation Plan
2. **Stakeholder Approval**: Get sign-off from tech lead and team
3. **Schedule Refactor**: Book dedicated time for implementation
4. **Create Feature Branch**: `git checkout -b refactor/break-circular-dependencies`
5. **Start Implementation**: Follow Implementation Plan step-by-step
6. **Code Review**: Get review from team before merging
7. **Deploy to Staging**: Test in staging environment
8. **Production Deploy**: Monitor for issues after deployment

---

## Related Resources

- [Turbo](https://turbo.build/repo/docs) - Monorepo build system
- [Hono](https://hono.dev/docs) - Web framework for API
- [Zod](https://zod.dev) - TypeScript-first schema validation
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - Edge compute platform

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 6, 2026 | Initial documentation |
