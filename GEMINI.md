# Guess Logo Game - Project Context

## Project Structure
This is a monorepo using **pnpm** workspaces with:
- **apps/frontend** - React + Vite SPA
- **apps/api** - Cloudflare Workers + Hono
- **packages/game-core** - Shared game framework
- **packages/games** - Game implementations

## Tech Stack
**Frontend**: React, TypeScript, Vite, Zustand, TanStack Query, Radix UI, Tailwind CSS, i18next

**Backend**: Cloudflare Workers, Hono, Durable Objects, Zod schemas

### Admin Panel (`apps/admin`)
React Admin, shadcn-admin-kit, TanStack Router, TypeScript
- Manages games, users, and application data
- Custom UI built with shadcn-admin-kit
- Client-side routing with TanStack Router

## Development Standards
- Use TypeScript everywhere
- Commits linted with `lint-staged` and `simple-git-hooks`

## Core Architecture

### Game Definition System
```typescript
GameDefinition {
  stateSchema: ZodSchema
  actionSchema: ZodSchema
  reducer: (state, action) => newState  // Pure, deterministic
  initialState: GameState
}
```

### Execution Modes
1. **Local Mode** - Client-authoritative, instant updates
2. **Multiplayer Mode** - Server-authoritative via WebSocket

Both modes use the same pure reducer and adapter pattern.

### Game Adapter Pattern
```typescript
interface GameAdapter {
  getState: () => GameState
  dispatch: (action: Action) => Promise<void>
  subscribe: (listener) => Unsubscribe
}
```

### Backend Authority
- Durable Objects = one game room = one state machine
- Runs reducer for each action
- Validates with Zod schemas
- Broadcasts updates to all clients
- Prevents cheating

## Build & Run Commands

### Frontend
```bash
pnpm install
pnpm --filter @guess-logo/frontend dev
pnpm --filter @guess-logo/frontend build
pnpm --filter @guess-logo/frontend lint:fix
```

### Backend
```bash
pnpm install
pnpm --filter api dev
pnpm --filter api deploy
pnpm --filter api lint:fix
pnpm turbo gen  # Generate new API routes
```

## Key Files & Paths
- Frontend source: `apps/frontend/src/` (use `@/` prefix)
- API templates: `apps/api/turbo/generators/templates/`
- Game implementations: `packages/games/`
- Shared utilities: `packages/game-core/`

## Game Logic Rules
- All game rules = pure reducers
- No side effects in reducers
- Identical composition for local & multiplayer
- Only the **adapter** layer changes between modes