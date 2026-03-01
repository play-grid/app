# @playgrid/data-provider

A lightweight package providing reusable CRUD handlers and cached external data fetchers for Hono APIs with Drizzle ORM.

## What It Does

Two focused utilities:

1. **CRUD Handlers** — Generate database CRUD operations (list, get, create, update, delete) with built-in pagination, sorting, filtering, and soft delete support
2. **Fetchers** — Register external API data fetchers with KV caching and multi-language support

## Why This Exists

### The Problem We Actually Have

Adding a new data type (stat items, players, companies, etc.) required creating 14-17 files and writing ~1,050 lines of code with 60-90% duplication.

**What we need:**
- Stat items live in the database from day one
- Admin approval workflow before data reaches the game
- Standard CRUD operations with status transitions (approve/reject)

### What We Ditched

The original ADR (docs/decisions/005-data-provider-abstraction-layer.md) proposed a "hybrid admin generator" that was solving a problem we don't have:

| Original Idea | Ditched Because |
|---------------|-----------------|
| Hybrid in-memory fallback | We need DB from day one for admin curation |
| `generateAdminHandlers` | `createCRUDHandlers` is enough |
| `generateAdminUIConfig` | Frontend owns UI config, not backend |
| Zod schema inference from Drizzle | Good future idea, wrong time |

**The hybrid pattern was designed for a world where you might not need a DB. We definitely need a DB.**

## Quick Start

### CRUD Handlers

```typescript
import { createCRUDHandlers } from '@playgrid/data-provider';
import { statItemsTable } from '@/db/schema';

const handlers = createCRUDHandlers(statItemsTable, outputSchema, {
  searchFields: ['name', 'description'],
  sortFields: { name: statItemsTable.name, createdAt: statItemsTable.createdAt },
  filterMap: {
    category: eq(statItemsTable.categoryId),
    status: eq(statItemsTable.status),
  },
  softDelete: true,
});

// Use in routes
app.get('/items', handlers.list);
app.get('/items/:id', handlers.getOne);
app.post('/items', handlers.create);
app.patch('/items/:id', handlers.update);
app.delete('/items/:id', handlers.delete);
```

### Status Transitions (Approve/Reject)

```typescript
import { createStatusHandlers } from '@playgrid/data-provider';

const statusHandlers = createStatusHandlers({
  table: statItemsTable,
  statusField: 'status',
  transitions: {
    approve: { from: ['pending', 'rejected'], to: 'approved' },
    reject: { from: ['pending', 'approved'], to: 'rejected' },
  },
});

app.post('/items/:id/approve', statusHandlers.approve);
app.post('/items/:id/reject', statusHandlers.reject);
app.post('/items/bulk-approve', statusHandlers['bulk-approve']);
```

### Fetchers with Caching

```typescript
import { createFetcherRegistry, createCachedFetcher } from '@playgrid/data-provider';

const registry = createFetcherRegistry<StatItem, 'stats'>({
  cacheNamespace: 'stats',
  defaultTtl: 86400,
  cache: env.CACHE,
});

registry.register('stats', 'companies', fetchCompanyStats, {
  ttl: 3600,
  description: 'Tech company logos',
});

const fetcher = registry.get('stats', 'companies');
const data = await fetcher('en'); // Supports multi-language
```

### Admin Routes

```typescript
import { createAdminRoutes } from '@playgrid/data-provider';

const adminRoutes = createAdminRoutes({
  handlers: crudHandlers,
  statusHandlers,
  schemas: { create: createSchema, update: updateSchema, query: querySchema },
  bulkLimit: 500,
});

app.route('/admin/items', adminRoutes);
```

## Package Structure

```
src/
├── types.ts                    # Shared interfaces (Pagination, Filter, Sort)
├── crud/                       # Database CRUD layer
│   ├── create-crud-handlers.ts # Main CRUD factory
│   ├── create-status-handlers.ts # Status workflow (approve/reject)
│   ├── pagination-builder.ts   # Apply pagination to queries
│   ├── sort-builder.ts         # Apply sorting
│   └── filter-builder.ts       # Build WHERE conditions
├── fetchers/                   # External API layer
│   ├── types.ts                # Fetcher and KV cache interfaces
│   ├── create-cached-fetcher.ts # Wrap fetcher with KV caching
│   ├── create-fetcher-registry.ts # Manage multiple fetchers
│   └── external-api-base.ts    # Base class for external API calls
└── admin/                      # Hono route factory
    └── create-admin-routes.ts  # Wire handlers into Hono routes
```

## Dependencies

- **drizzle-orm** — Database queries
- **zod** — Runtime validation
- **stoker** — HTTP status codes
- **hono** (peer) — Web framework for routes
- **@playgrid/shared** — Common types (SupportedLanguage)

## Architecture

```
types (foundation)
  ↑
  ├─→ crud/ (database layer)
  │     └─→ uses pagination/sort/filter builders
  │
  ├─→ fetchers/ (external API layer)
  │     └─→ KV caching wrapper
  │
  └─→ admin/ (routing layer)
        └─→ wires CRUD handlers into Hono routes
```

**No circular dependencies** — All dependencies flow in one direction.

## Example: Adding NBA Players

```typescript
// 1. Define Drizzle table
export const nbaPlayersTable = sqliteTable('nba_players', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  team: text('team').notNull(),
  position: text('position'),
  imageUrl: text('image_url'),
  status: text('status').default('pending'),
  deletedAt: integer('deleted_at'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
});

// 2. Create CRUD handlers
const handlers = createCRUDHandlers(nbaPlayersTable, playerOutputSchema, {
  searchFields: ['name', 'team'],
  sortFields: { name: nbaPlayersTable.name },
  softDelete: true,
});

// 3. Add status workflow
const statusHandlers = createStatusHandlers({
  table: nbaPlayersTable,
  statusField: 'status',
  transitions: {
    approve: { from: ['pending'], to: 'approved' },
    reject: { from: ['pending'], to: 'rejected' },
  },
});

// 4. Create admin routes
const routes = createAdminRoutes({
  handlers,
  statusHandlers,
  schemas: { create, update, query },
});

app.route('/admin/players', routes);
```

**Time saved**: ~80% less code vs writing from scratch

## Key Features

- **Pagination** — `page`, `limit`, `total`, `totalPages` meta
- **Sorting** — Configurable sort fields with asc/desc
- **Filtering** — Flexible filter map with custom WHERE conditions
- **Search** — Multi-field text search with case-insensitive matching
- **Soft Delete** — Optional soft delete with `deletedAt` field
- **Status Workflows** — Define transitions (pending → approved/rejected)
- **Bulk Operations** — Batch approve/reject with configurable limits
- **Multi-Language** — Fetchers support language parameter
- **KV Caching** — Built-in Cloudflare KV caching with TTL

## Build/Test

```bash
pnpm --filter @playgrid/data-provider check-types  # Type check
pnpm --filter @playgrid/data-provider test         # Run all tests
pnpm --filter @playgrid/data-provider test:unit    # Unit tests only
pnpm --filter @playgrid/data-provider test:integration # Integration tests only
```
