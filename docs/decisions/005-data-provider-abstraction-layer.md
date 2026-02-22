# ADR: Data Provider Abstraction Layer for CRUD & Fetchers

**Status**: Proposed
**Date**: Feb 22, 2026
**Related ADRs**: 001-explicit-dataprovider.md, 002-break-circular-dependencies.md

## Context

### Current State

The monorepo has multiple data resources that are implemented independently with significant duplication:

**Data Fetchers (Public API):**
- Logos: `apps/api/src/routes/games/guess-logo/logos/` - 16 files, 828 lines
- Questions: `apps/api/src/routes/games/five-seconds/questions/` - 16 files, 743 lines
- Each resource has its own fetchers, services, handlers, and routes

**Admin Panels (CRUD):**
- Questions admin: 18 files, 670 lines
- Banners admin: 4 files, 460 lines
- Categories admin: 4 files, 127 lines

### Problem

Adding a new data type (e.g., NBA players, soccer teams) requires creating **14-17 files** and writing **~1,050 lines of code** with **60-90% duplication** of existing patterns.

**Quantitative Impact:**
| Metric | Single Resource | 4 Resources | 10 Resources |
|--------|----------------|-------------|--------------|
| Time | 34 hours | 95 hours | 200 hours |
| Files | 14-17 | 56-68 | 140-170 |
| Lines | ~1,050 | ~4,200 | ~10,500 |

**Major Duplication Hotspots:**
1. **Admin CRUD handlers** (~80% duplicated per resource)
   - Pagination logic
   - Filtering logic
   - Sorting logic
   - Soft delete patterns
   - Join patterns
   - Response formatting

2. **Route definitions** (~90% duplicated per resource)
   - GET / (list endpoint)
   - GET /:id (get by id)
   - POST / (create)
   - PATCH /:id (update)
   - DELETE /:id (delete)

3. **Schema validation** (~70% duplicated per resource)
   - createXxxInputSchema
   - updateXxxInputSchema
   - xxxOutputSchema
   - listXxxResponseSchema

4. **Admin UI forms** (~60% duplicated per resource)
   - List view structure
   - Create form structure
   - Edit form structure
   - Field definitions

### Requirements

1. **Reduce duplication** for adding new data types
2. **Maintain type safety** (no `any` in generated code)
3. **Support hybrid pattern**: External API data with optional DB storage
4. **Allow customization**: Auto-generated code must be overrideable
5. **Keep code explicit**: Avoid magic, maintain KISS principle

## Decision

Create a **mix-in/composable abstraction layer** in a new `packages/data-provider` package with:

1. **CRUD mixins** - Reusable handler/route creators
2. **Fetcher registry** - Centralized registry with caching
3. **Hybrid admin generator** - Auto-generate admin from public fetcher config
4. **Override support** - Full customization when needed

### Architecture

```
packages/data-provider/
├── src/
│   ├── crud/
│   │   ├── create-crud-handlers.ts      # Reusable CRUD handler creators
│   │   ├── create-crud-routes.ts        # Reusable route creators
│   │   ├── pagination-builder.ts         # Composable pagination logic
│   │   ├── filter-builder.ts            # Composable filtering logic
│   │   ├── sort-builder.ts              # Composable sorting logic
│   │   └── index.ts
│   ├── fetchers/
│   │   ├── create-fetcher-registry.ts   # Registry pattern factory
│   │   ├── create-metadata-registry.ts  # Metadata registry factory
│   │   ├── create-cached-fetcher.ts     # Cached fetcher wrapper
│   │   ├── external-api-base.ts        # Base class for external APIs
│   │   └── index.ts
│   ├── admin/
│   │   ├── generate-admin-handlers.ts   # Auto-generate admin handlers
│   │   ├── generate-admin-routes.ts     # Auto-generate admin routes
│   │   ├── generate-admin-schemas.ts    # Auto-generate schemas
│   │   ├── generate-admin-ui-config.ts  # Auto-generate UI config
│   │   └── index.ts
│   ├── types.ts                         # Shared types
│   └── index.ts
```

### Key Components

#### 1. CRUD Mixins (Composable Pattern)

```typescript
export function createCRUDHandlers<T extends DrizzleTable>(
  table: T,
  options: CRUDHandlerOptions<T>,
): CRUDHandlers {
  return {
    list: async (c) => {
      const db = getDB(c);
      const { page, limit, search, filters, sort, order } = c.req.valid('query');

      // Composable builders
      const query = db.select().from(table);

      // Apply soft delete filter if configured
      const withSoftDelete = options.softDelete ? query.where(eq(table.deletedAt, null)) : query;

      const withPagination = applyPagination(withSoftDelete, page, limit);
      const withFilters = applyFilters(withPagination, filters, options.filterMap);
      const withSearch = applySearch(withFilters, search, options.searchFields);
      const withSorting = applySorting(withSearch, sort, order, options.sortFields);

      const data = await withSorting;
      const [{ count }] = await getCount(db, table, filters, search, options);

      return c.json({
        data,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
      });
    },
    getOne: async (c) => { /* ... */ },
    create: async (c) => { /* ... */ },
    update: async (c) => { /* ... */ },
    delete: async (c) => {
      // Soft delete if configured, otherwise hard delete
      if (options.softDelete) {
        return db.update(table).set({ deletedAt: new Date() }).where(eq(table.id, id));
      }
      return db.delete(table).where(eq(table.id, id));
    },
  };
}

// Usage
export const listQuestionsHandler = createCRUDHandlers(fiveSecondsQuestions, {
  searchFields: ['text'],
  filterMap: {
    difficulty: eq(fiveSecondsQuestions.difficulty),
    categoryId: eq(fiveSecondsQuestions.categoryId),
  },
  sortFields: { text: fiveSecondsQuestions.text, createdAt: fiveSecondsQuestions.createdAt },
  relations: {
    category: leftJoin(fiveSecondsCategories, eq(fiveSecondsQuestions.categoryId, fiveSecondsCategories.id)),
  },
}).list;
```

**Effort Reduction**: ~80% less handler code per resource

#### 2. Public Fetcher Registry

```typescript
export type ResourceFamily = 'players' | 'companies' | 'countries' | 'movies' | 'stats';

export function createFetcherRegistry<TData, TFamily extends ResourceFamily>(
  config: FetcherRegistryConfig<TData, TFamily>,
) {
  const REGISTRY = new Map<TFamily, Map<string, Fetcher<TData>>>();

  return {
    register: (family: TFamily, variant: string, fetcher: Fetcher<TData>, options?: { ttl?: number }) => {
      if (!REGISTRY.has(family)) REGISTRY.set(family, new Map());
      const ttl = options?.ttl ?? config.defaultTtl;
      REGISTRY.get(family)!.set(variant, createCachedFetcher(fetcher, { cacheKey: `${family}:${variant}`, ttl }));
    },
    get: (family: TFamily, variant: string) => REGISTRY.get(family)?.get(variant) || null,
    getAll: (family: TFamily) => REGISTRY.get(family) || new Map(),
    getCatalog: () => {
      const catalog: Record<string, { variants: string[]; defaultTtl: number }> = {};
      REGISTRY.forEach((variants, family) => {
        catalog[family] = {
          variants: Array.from(variants.keys()),
          defaultTtl: config.defaultTtl,
        };
      });
      return catalog;
    },
  };
}

export function createCachedFetcher<TData>(
  fetcher: Fetcher<TData>,
  options: { cacheKey: string; ttl: number },
): Fetcher<TData> {
  return async (language: SupportedLanguage) => {
    const cacheKey = `${options.cacheKey}:${language}`;
    const cached = await env.CACHE.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = await fetcher(language);
    await env.CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: options.ttl });
    return data;
  };
}

// Usage
const statsRegistry = createFetcherRegistry<StatItem, 'stats'>({
  cacheNamespace: 'stats',
  defaultTtl: 86400,
});

statsRegistry.register('stats', 'companies', fetchCompanyStats, { ttl: 3600 });
statsRegistry.register('stats', 'nba', fetchNBAStats, { ttl: 1800 });
statsRegistry.register('stats', 'movies', fetchMovieStats);

// Catalog endpoint: GET /data/catalog
export const getDataCatalog = async (c) => {
  return c.json(statsRegistry.getCatalog());
};

// Frontend can use: /data/stats/companies?lang=en&variant=tech-giants
```

**Effort Reduction**: ~70% less fetcher code

#### 3. Hybrid Admin Generator

```typescript
export function generateAdminHandlers<TData extends { id: string }>(
  publicFetcher: Fetcher<TData[]>,
  options: AdminHandlerOptions<TData>,
): AdminHandlers {
  return {
    list: async (c) => {
      const db = getDB(c);
      const { page, limit } = c.req.valid('query');

      // Use database if available, fallback to public fetcher
      if (options.dbTable) {
        const crudHandlers = createCRUDHandlers(options.dbTable, options.crudOptions);
        return crudHandlers.list(c);
      }

      // Otherwise, fetch from public API and paginate in-memory
      const allData = await publicFetcher(c.req.valid('query').language);
      const offset = (page - 1) * limit;
      const data = allData.slice(offset, offset + limit);

      return c.json({
        data,
        pagination: { page, limit, total: allData.length, totalPages: Math.ceil(allData.length / limit) },
      });
    },
    create: options.dbTable ? createCRUDHandlers(options.dbTable, options.crudOptions).create : null,
    update: options.dbTable ? createCRUDHandlers(options.dbTable, options.crudOptions).update : null,
    delete: options.dbTable ? createCRUDHandlers(options.dbTable, options.crudOptions).delete : null,
  };
}

export function generateAdminUIConfig<TData>(
  resourceName: string,
  schema: z.ZodType<TData>,
  overrides?: Partial<AdminUIConfig>,
): AdminUIConfig {
  const defaultConfig: AdminUIConfig = {
    resource: resourceName,
    columns: generateColumnsFromSchema(schema),
    formFields: generateFormFieldsFromSchema(schema),
    actions: ['edit', 'delete'],
  };

  return { ...defaultConfig, ...overrides };
}
```

**Effort Reduction**: ~50% less admin code, with full customization

### Usage Example: Adding NBA Players

```typescript
// Step 1: Define schema (5 min)
const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string(),
  position: z.string(),
  imageUrl: z.string(),
});

// Step 2: Create fetcher (30 min)
async function fetchNBAPlayers(language: SupportedLanguage): Promise<PlayerData[]> {
  const api = new NBAAPI(env.NBA_API_KEY);
  const players = await api.getPlayers();
  return players.map(p => ({
    id: p.id,
    name: p.fullName,
    team: p.team.abbreviation,
    position: p.position,
    imageUrl: p.headshotUrl,
  }));
}

// Step 3: Register fetcher (5 min)
playerRegistry.register('players', 'nba', fetchNBAPlayers, { ttl: 86400 });

// Step 4: Create public API route (10 min)
export const getNBAPlayers = async (c) => {
  const { language } = c.req.valid('query');
  const fetcher = playerRegistry.get('players', 'nba');
  const players = await fetcher(language);
  return c.json(players);
};

// Step 5: Auto-generate admin (5 min)
export const playersAdminHandlers = generateAdminHandlers(fetchNBAPlayers, {
  dbTable: null, // No DB table, read-only from external API
  crudOptions: { /* ... */ },
});

export const playersAdminRoutes = generateAdminRoutes('players', playerSchema);

export const playersAdminUIConfig = generateAdminUIConfig('players', playerSchema, {
  columns: [
    { source: 'name', label: 'Player Name' },
    { source: 'team', label: 'Team' },
    { source: 'position', label: 'Position' },
  ],
});
```

**Total time**: ~55 minutes vs 34 hours (without abstraction)

## Alternatives Considered

### Alternative 1: Generic Factory (High Abstraction)

Generate all CRUD handlers/routes from table config with minimal customization.

**Rejected** because:
- Less flexibility for custom logic
- Harder to debug (generated code is opaque)
- May become too complex with many edge cases
- Higher initial effort to build generic system

### Alternative 2: Base Classes (Low Abstraction)

Extend base handler classes per resource using OOP pattern.

**Rejected** because:
- Requires more boilerplate than mixins
- Harder to compose functionality
- Less idiomatic in functional TypeScript
- Mixins better fit composable pattern

### Alternative 3: Code Generation (tRPC, OpenAPI)

Auto-generate API clients from OpenAPI spec or tRPC.

**Rejected** because:
- Doesn't solve duplication in API implementation
- Requires build step and generated files
- Adds complexity to build process
- We already use Hono's typed client effectively

### Alternative 4: Keep Current Manual Approach

Continue duplicating code for each resource.

**Rejected** because:
- Clearly unsustainable at scale
- 200+ hours for 10 resources
- High maintenance burden
- Violates DRY principle

## Consequences

### Positive

1. **Massive Code Reduction**: ~80% less code per resource
2. **Faster Development**: Add new resources in ~1 hour vs ~34 hours
3. **Type Safety Maintained**: All generated code is fully typed
4. **Composability**: Mixins can be combined in different ways
5. **Hybrid Support**: External API + optional DB storage
6. **Customizable**: Auto-generated code can be overridden
7. **Explicit**: No magic, clear what each mixin does
8. **Scalable**: Adding 10 resources = 35 hours vs 200 hours

### Negative

1. **Initial Effort**: 12-15 hours to build abstractions
2. **New Package**: Adds `packages/data-provider` to monorepo
3. **Learning Curve**: Team must learn new mixin/composable patterns
4. **Migration Required**: Existing resources should be updated (optional but recommended)
5. **Indirection**: One more layer of abstraction to understand

### Break-even Analysis

| Scenario | Without Abstraction | With Abstraction + Build | Savings |
|----------|-------------------|--------------------------|---------|
| 1 resource | 34 hours | 15+3 = 18 hours | 16 hours |
| 2 resources | 58 hours | 15+4 = 19 hours | 39 hours |
| 4 resources | 95 hours | 15+2+1+1+1 = 20 hours | 75 hours |
| 10 resources | 200 hours | 15+2+1*9 = 26 hours | 174 hours |

**Break-even point**: 2 resources

## Implementation Plan

### Phase 0: Setup Package (1 hour)

```bash
mkdir -p packages/data-provider
cd packages/data-provider
pnpm init

# Configure TypeScript and build scripts
# Add dependencies: zod, hono, @hono/zod-openapi, drizzle-orm
```

### Phase 1: Build Abstraction Layer (12-15 hours)

| Task | Time |
|------|------|
| Create `packages/data-provider` structure | 1 hour |
| Build CRUD mixins (handlers, routes, builders) | 4 hours |
| Build fetcher registry (registry, caching, external API base) | 3 hours |
| Build admin generator (handlers, routes, schemas, UI config) | 4 hours |
| Unit tests and documentation | 2-3 hours |

### Phase 2: Migrate Existing Resources (3-5 hours)

| Task | Time |
|------|------|
| Migrate questions to use CRUD mixins | 1.5 hours |
| Migrate logos to use fetcher registry | 1.5 hours |
| Migrate admin panels to use generators | 1-2 hours |

### Phase 3: Add Example Resource (2-3 hours)

| Task | Time |
|------|------|
| Add NBA players using new abstractions | 1 hour |
| Add admin panel for NBA players | 30 min |
| Test and document | 30-60 min |

### Phase 4: Documentation & Training (2-3 hours)

| Task | Time |
|------|------|
| Write API documentation | 1 hour |
| Create examples and tutorials | 1 hour |
| Team training session | 1 hour |

**Total**: 19-26 hours (including building abstractions, migration, and examples)

---

## Migration Strategy: In-Memory → DB-Backed Resources

### Phase 1: Start with In-Memory Fallback

**Use when**: <1-2k items, rapid prototyping, external API is fast

```typescript
// apps/api/src/routes/players/players.handlers.ts
export const playersAdminHandlers = generateAdminHandlers(fetchNBAPlayers, {
  dbTable: null, // No DB, use in-memory pagination
  cacheNamespace: 'players',
  crudOptions: {
    // Read-only mode - no create/update/delete
    enableCreate: false,
    enableUpdate: false,
    enableDelete: false,
  },
});
```

**Pros**:
- Fast to set up (no DB schema, no migrations)
- No data sync issues with external API
- Perfect for static reference data

**Cons**:
- Pagination is in-memory (slow for large datasets)
- No admin curation (can't add/edit/delete)
- No search, filter, sort optimization

### Phase 2: Add DB Table When Scale Requires

**Use when**: >1-2k items, need admin curation, frequent updates

```typescript
// Step 1: Create Drizzle table
export const nbaPlayersTable = sqliteTable('nba_players', {
  id: text('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),
  name: text('name').notNull(),
  team: text('team').notNull(),
  position: text('position'),
  imageUrl: text('image_url'),
  stats: text('stats'), // JSON
  cachedAt: integer('cached_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Step 2: Generate and run migration
pnpm drizzle-kit generate
pnpm drizzle-kit push

// Step 3: Update handler to use DB
export const playersAdminHandlers = generateAdminHandlers(fetchNBAPlayers, {
  dbTable: nbaPlayersTable, // Use DB for efficient pagination
  cacheNamespace: 'players',
  crudOptions: {
    softDelete: true,
    enableCreate: true,
    enableUpdate: true,
    enableDelete: true,
    // Map external API fields to DB columns
    fieldMapping: {
      externalId: 'id', // NBA API ID → DB external_id
      // ... other mappings
    },
  },
});

// Step 4: Seed initial data from external API
export const seedNBAPlayers = async (c) => {
  const db = getDB(c);
  const players = await fetchNBAPlayers('en');

  for (const player of players) {
    await db.insert(nbaPlayersTable).values({
      externalId: player.id,
      name: player.name,
      team: player.team,
      position: player.position,
      imageUrl: player.imageUrl,
      cachedAt: new Date(),
    }).onConflictDoNothing();
  }

  return c.json({ seeded: players.length });
};
```

**Pros**:
- Efficient pagination with database indexes
- Full CRUD support for admin curation
- Can cache API data locally for resilience
- Can add custom fields not in external API

**Cons**:
- Requires DB schema and migrations
- Data sync complexity (keep cache fresh)
- Higher initial effort

### Phase 3: Hybrid ETL Pipeline

**Use when**: External API is primary source, DB is local cache with admin overrides

```typescript
// ETL job runs periodically (cron or scheduled task)
export const syncNBAPlayers = async (c) => {
  const db = getDB(c);
  const externalPlayers = await fetchNBAPlayers('en');

  for (const externalPlayer of externalPlayers) {
    const existing = await db.select()
      .from(nbaPlayersTable)
      .where(eq(nbaPlayersTable.externalId, externalPlayer.id))
      .limit(1);

    if (existing.length > 0) {
      // Update existing if not manually curated
      if (!existing[0].isManualOverride) {
        await db.update(nbaPlayersTable)
          .set({
            name: externalPlayer.name,
            team: externalPlayer.team,
            position: externalPlayer.position,
            imageUrl: externalPlayer.imageUrl,
            cachedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(nbaPlayersTable.id, existing[0].id));
      }
    }
    else {
      // Insert new
      await db.insert(nbaPlayersTable).values({
        externalId: externalPlayer.id,
        name: externalPlayer.name,
        team: externalPlayer.team,
        position: externalPlayer.position,
        imageUrl: externalPlayer.imageUrl,
        cachedAt: new Date(),
      });
    }
  }

  return c.json({ synced: externalPlayers.length });
};
```

**Features**:
- External API is source of truth
- Admin can manually override specific records
- Automatic sync keeps data fresh
- Graceful fallback if external API is down

---

## Decision Checklist

Before adding a new resource, answer these questions:

| Question | Answer → Approach |
|----------|-------------------|
| **How many items?** | <1k → in-memory OK<br>>1k → DB table needed |
| **Does it change frequently?** | No → long TTL (days)<br>Yes → short TTL (minutes) |
| **Do we need admin curation?** | No → read-only mode<br>Yes → DB + CRUD enabled |
| **Is data static or dynamic?** | Static → cache forever<br>Dynamic → SWR pattern |
| **Is external API reliable?** | Yes → rely on it<br>No → seed to DB ASAP |
| **Do we need custom fields?** | No → use external API only<br>Yes → DB table with custom columns |

## Future Evolution

1. **Schema Inference**: Auto-generate admin UI config from Drizzle table schemas
2. **Validation Auto-generation**: Derive Zod schemas from table definitions
3. **Relationship Management**: Composable helpers for complex joins
4. **ETL Pipeline Integration**: Auto-register ETL-fetched data in registry
5. **Admin Auth Hooks**: Built-in RBAC hooks for admin endpoints
6. **Audit Trail**: Mixin for tracking CRUD operations
7. **Versioning**: Support multiple data versions per resource

## Important Considerations & Limitations

### 1. In-Memory Pagination Fallback

**Current Behavior**: Hybrid mode uses in-memory pagination when no DB table is configured.

**Limitations**:
- Works well for <1-2k items per list
- Becomes painful at scale (memory, latency)
- Cannot use database indexes for filtering/sorting

**Recommendation**: Plan to add DB tables for high-volume resources **sooner rather than later**:
- All players (NBA, soccer, etc.)
- All movies/TV shows
- All companies in large datasets

**Migration Path**:
```typescript
// Phase 1: Start with in-memory fallback
export const playersAdminHandlers = generateAdminHandlers(fetchNBAPlayers, {
  dbTable: null, // In-memory pagination
  // ...
});

// Phase 2: Add DB table when scale requires
export const nbaPlayersTable = sqliteTable('nba_players', { /* ... */ });

export const playersAdminHandlers = generateAdminHandlers(fetchNBAPlayers, {
  dbTable: nbaPlayersTable, // Use DB for efficient pagination
  crudOptions: {
    softDelete: true,
    // ...
  },
});
```

### 2. Zod Schema Inference

**Current State**: Manual schema duplication required for:
- Drizzle table definitions
- Zod validation schemas
- Admin UI config

**Planned Future Work**:
- Auto-generate Zod schemas from Drizzle tables
- Generate admin UI config from schemas
- Reduce manual configuration to ~10% of current

**Temporary Mitigation**:
- Keep Zod schemas alongside table definitions
- Use consistent naming to make relationship clear
- Document schema mapping in comments

### 3. Error & Fallback Handling in Hybrid Mode

**When External Fetcher Fails**:

| Context | Behavior | Rationale |
|---------|----------|-----------|
| **Admin List** | Return cached data + warning banner | Admin needs visibility, degraded UX acceptable |
| **Public Game Fetch** | Return stale cache (if available) or empty with error code | Games fail gracefully, avoid broken UX |
| **Create/Update/Delete** | Fail fast with clear error message | Prevent data corruption, surface issues immediately |

**Implementation**:
```typescript
export function generateAdminHandlers<TData extends { id: string }>(
  publicFetcher: Fetcher<TData[]>,
  options: AdminHandlerOptions<TData>,
): AdminHandlers {
  return {
    list: async (c) => {
      try {
        const data = await publicFetcher(c.req.valid('query').language);
        return c.json({ data, pagination: { /* ... */ } });
      }
      catch (error) {
        // Try to return cached data for admin
        const cacheKey = `${options.cacheNamespace}:${variant}`;
        const cached = await env.CACHE.get(cacheKey);
        if (cached) {
          const staleData = JSON.parse(cached);
          return c.json({
            data: staleData,
            pagination: { /* ... */ },
            warning: 'Showing stale data - external API unavailable',
          });
        }

        // If no cache, return error
        return c.json({ error: 'Failed to fetch data' }, 503);
      }
    },
    // ...
  };
}
```

### 4. Caching Strategy Guardrails

**Default TTL Requirements**:
- **Mandate** `defaultTtl` per registry configuration
- **Allow override** per fetcher registration
- **Separate TTL** for admin vs public endpoints

**Recommended TTLs**:
| Context | TTL | Rationale |
|---------|-----|-----------|
| Public game fetches | 24-48 hours | Stable data, maximize performance |
| Admin preview | 5-15 minutes | Admin needs fresh data for curation |
| Frequently changing stats | 5-15 minutes | Real-time-ish updates |
| Static reference data | 7-30 days | Rarely changes, long cache OK |

**Stale-While-Revalidate (Optional)**:
```typescript
export function createStaleWhileRevalidateFetcher<TData>(
  fetcher: Fetcher<TData>,
  options: {
    cacheKey: string;
    ttl: number;
    staleWhileRevalidateTtl?: number; // Allow stale for X seconds while revalidating
  },
): Fetcher<TData> {
  return async (language: SupportedLanguage) => {
    const cacheKey = `${options.cacheKey}:${language}`;
    const cached = await env.CACHE.get(cacheKey);
    const now = Date.now();

    if (cached) {
      const data = JSON.parse(cached);
      const age = now - data._cachedAt;

      // If fresh, return immediately
      if (age < options.ttl * 1000) {
        return data;
      }

      // If stale but within SWR window, return stale and revalidate async
      if (options.staleWhileRevalidateTtl && age < (options.ttl + options.staleWhileRevalidateTtl) * 1000) {
        // Revalidate in background
        fetcher(language).then(freshData => {
          env.CACHE.put(cacheKey, JSON.stringify({ ...freshData, _cachedAt: Date.now() }), { expirationTtl: options.ttl });
        });

        return data; // Return stale data immediately
      }
    }

    // No cache or expired, fetch fresh
    const data = await fetcher(language);
    await env.CACHE.put(cacheKey, JSON.stringify({ ...data, _cachedAt: now }), { expirationTtl: options.ttl });
    return data;
  };
}
```

### 5. Soft Delete Support

**Built-in to `createCRUDHandlers`**:
```typescript
export interface CRUDHandlerOptions<T> {
  // ...
  softDelete?: boolean; // Enable soft delete pattern
}

// Usage
export const questionsHandlers = createCRUDHandlers(questionsTable, {
  softDelete: true, // Automatically filter out deleted items in list, use soft delete on delete
  // ...
});
```

**Why Important**:
- Admin curation requires ability to "remove" items without losing data
- Audit trails and rollback capabilities
- Future: "trash can" feature for restoring deleted items

### 6. Metadata / Catalog Endpoint

**Purpose**: Help frontend and admin discover available resources without hardcoding.

**Endpoint**: `GET /data/catalog`

**Response**:
```json
{
  "players": {
    "variants": ["nba", "soccer", "premier-league"],
    "defaultTtl": 86400,
    "description": "Professional sports player data",
    "source": "External APIs"
  },
  "companies": {
    "variants": ["tech-giants", "fortune500", "saudi"],
    "defaultTtl": 86400,
    "description": "Company logos and metadata",
    "source": "External APIs + Admin curation"
  },
  "movies": {
    "variants": ["top-imdb", "family", "drama"],
    "defaultTtl": 86400,
    "description": "Movie posters and metadata",
    "source": "TMDB API",
    "lastUpdated": "2026-02-22T10:00:00Z"
  }
}
```

**Benefits**:
- Frontend can dynamically build category selectors
- Admin can discover what's available without hardcoding
- Easy to add new resources without frontend changes
- Debugging and monitoring (last cached timestamps)

## References

- [React Admin](https://marmelab.com/react-admin/) - Admin panel framework
- [Hono](https://hono.dev/) - Web framework for API
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Zod](https://zod.dev/) - Schema validation
- [Mixin Pattern](https://www.patterns.dev/posts/mixin-pattern/) - Design pattern reference
