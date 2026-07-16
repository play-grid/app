# Dynamic Company Lists — Implementation Plan

## Goal

Replace the hardcoded `'companies' | 'saudi'` enum with a DB-backed `lists` table and full CRUD in the admin panel. Any admin user can create, edit, and delete named lists (e.g. "UAE Companies", "Tech Startups") and assign companies to them.

---

## Design Decisions (resolved)

These were decided via the architecture grilling process and should not be re-litigated without good reason.

| Decision | Choice | Rationale |
|---|---|---|
| **Reference strategy** | Companies reference `lists.slug` as a string (not `lists.id` as FK) | Keeps `listId` a readable string everywhere. Avoids a breaking migration on existing data and all consumers (logos, game endpoints, sync). Application-layer enforcement. |
| **Slug mutability** | Immutable after creation | Companies reference the slug; changing it would cascade-update `companies.listId` and `stat_items.category`. Immutable slugs avoid this complexity. |
| **Deletion cascade** | Cascade soft-delete companies | When a list is deleted, all companies in it are soft-deleted (`isActive = false`) along with their stat items. Keeps data consistent. |
| **Company form data source** | React Admin `useGetList` (via `SelectInput` with dynamic choices or `ReferenceInput`) | Follows existing react-admin conventions in the codebase. |
| **List badge on Companies page** | `ReferenceField` loading list name from `lists` resource | Replaces the current hardcoded color-coded badge with the actual list name (e.g. "Global", "Saudi"). |
| **Seed strategy** | Seed the two legacy lists | `{ slug: 'companies', nameEn: 'Global', nameAr: 'عالمي' }` and `{ slug: 'saudi', nameEn: 'Saudi', nameAr: 'سعودي' }` so existing data works immediately after migration. |
| **Logo metadata/registry** | Query DB at request time | `getLogoListsMetadata` and `getLogoFetcher` for the `companies` set will query the `lists` table instead of reading hardcoded objects. |
| **Sidebar icon** | Folder/list icon from @hugeicons (`ListIcon` or `Folder01Icon`) | Distinct from the Companies building icon. |
| **`stat_items.category`** | Set to `lists.slug` (same as `companies.listId`) | This is the existing convention — see ADR-006. The companies transformer already uses `config.listId` as `category`. Dynamic lists work transparently. |

---

## Data Model

### New Table: `lists`

```sql
CREATE TABLE lists (
  id         TEXT PRIMARY KEY,      -- cuid2, auto-generated
  name_en    TEXT NOT NULL,         -- "Saudi Companies"
  name_ar    TEXT,                  -- "شركات سعودية"
  slug       TEXT NOT NULL UNIQUE,  -- "saudi" — referenced by companies.listId
  is_active  INTEGER DEFAULT 1,     -- boolean
  created_at INTEGER,               -- timestamp
  updated_at INTEGER                -- timestamp
);
```

**Drizzle file:** `apps/api/src/db/lists.tables.ts`

```ts
export const listsTable = sqliteTable('lists', {
  id: cuid2('id').defaultRandom().primaryKey(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar'),
  slug: text('slug').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  ...timestamp,
});
```

**Export** from `apps/api/src/db/schema.ts`.

### Seed Data

`apps/api/seeds/shared/seed-lists.ts`:

| slug | nameEn | nameAr |
|---|---|---|
| `companies` | Global | عالمي |
| `saudi` | Saudi | سعودي |

These match the two existing `listId` values in `companies.json`.

---

## API Routes

### New Resource: `/api/admin/lists`

Follows the existing [categories pattern](https://github.com/playgrid/playgrid/apps/api/src/routes/admin/categories/) but with full CRUD.

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | `listAdminLists` | Paginated list, filterable by `isActive`, searchable by `nameEn`/`nameAr` |
| GET | `/:id` | `getAdminListById` | Single list |
| POST | `/` | `createAdminList` | Create new list, slug auto-generated from name or provided |
| PATCH | `/:id` | `updateAdminList` | Update `nameEn`, `nameAr`, `isActive`. Slug is immutable. |
| DELETE | `/:id` | `deleteAdminList` | Soft-delete: sets `isActive = false`, cascade soft-deletes all companies with this `listId` |

### Files to create

All under `apps/api/src/routes/admin/lists/`:

- **`lists.schemas.ts`** — Zod schemas for create/update/output/query
- **`lists.routes.ts`** — OpenAPI route definitions
- **`lists.handlers.ts`** — CRUD handlers
- **`lists.index.ts`** — Router assembly

### Registration

Add to `apps/api/src/routes/admin/index.ts`:

```ts
import lists from './lists/lists.index';

export const adminRoutes = createRouter()
  // ...existing routes...
  .route('/lists', lists);
```

---

## Admin Frontend

### New Feature: Lists

All files under `apps/admin/src/features/lists/`:

| File | Purpose |
|------|---------|
| `list.tsx` | DataTable with columns: Name (EN), Name (AR), Slug, Active, Actions |
| `create.tsx` | SimpleForm: nameEn (required), nameAr (optional), isActive. Slug auto-generated from nameEn. |
| `edit.tsx` | Same fields. Slug shown as read-only. |

### Data Provider Update

In `apps/admin/src/lib/data-provider.ts`:

```ts
type ResourceType = 'questions' | 'question-feedback' | 'categories' | 'banners' | 'companies' | 'lists';
```

Add to `routeMap`:

```ts
'lists': {
  getList: () => (client.api.admin).lists.$get,
  getOne: () => (client.api.admin).lists[':id'].$get,
  create: () => (client.api.admin).lists.$post,
  update: () => (client.api.admin).lists[':id'].$patch,
  delete: () => (client.api.admin).lists[':id'].$delete,
},
```

### Route Registration

In `apps/admin/src/routes/index.tsx`, add:

```tsx
<Resource
  name="lists"
  list={ListLists}
  icon={ListIcon}
  create={CreateList}
  edit={EditList}
/>
```

### List Icon

Use `ListIcon` (or `Folder01Icon`, `Folder02Icon`) from `@hugeicons/core-free-icons`.

---

## Companies Integration

### Schemas

In `apps/api/src/routes/admin/companies/companies.schemas.ts`:

```diff
- export const companyListIdSchema = z.enum(['companies', 'saudi']).openapi('CompanyListId');
+ // Validated at the application layer — listId must exist in the lists table
+ export const companyListIdSchema = z.string().min(1).openapi('CompanyListId');
```

### Handlers — Add search support

In `listCompaniesHandler`: currently ignores the `search`/`q` query param. Add `ilike` filtering on `nameEn` and `nameAr`:

```ts
if (search) {
  whereConditions.push(
    or(
      like(companiesTable.nameEn, `%${search}%`),
      like(companiesTable.nameAr, `%${search}%`),
    ),
  );
}
```

### Create/Edit Forms

Replace hardcoded `<SelectInput choices={[...]}>` with a dynamic choice loader. Two approaches (both acceptable, prefer `useGetList`):

**Option A: `useGetList` + custom SelectInput**

```tsx
import { useGetList } from 'ra-core';

function ListSelectInput(props: any) {
  const { data, isLoading } = useGetList('lists', {
    pagination: { page: 1, perPage: 100 },
    filter: { isActive: true },
  });

  const choices = (data || []).map((list: any) => ({
    id: list.slug,
    name: list.nameEn,
  }));

  return <SelectInput {...props} choices={choices} isLoading={isLoading} />;
}
```

**Option B: `ReferenceInput`**

Use `ReferenceInput` + `SelectInput` which is the canonical react-admin pattern for this. However, `ReferenceInput` expects the `lists` resource to supply IDs that match the foreign key. Since companies use `lists.slug` (string) as the reference key, this works naturally if the `lists` resource returns `slug` as `id`.

### List Badge on Companies Page

Replace the current `ListIdBadge` component with a `ReferenceField`:

```tsx
import { ReferenceField, TextField } from '@/components/admin';

// Inside DataTable:
<DataTable.Col label="List" source="listId">
  <ReferenceField source="listId" reference="lists">
    <TextField source="nameEn" />
  </ReferenceField>
</DataTable.Col>
```

This requires the `lists` resource to support `getMany` (so react-admin can batch-fetch the referenced lists by their slug). If `getMany` isn't implemented, implement it in the lists route.

### Sync Routes

In `apps/api/src/routes/admin/sync/sync.routes.ts`:

```diff
- listId: z.enum(['companies', 'saudi']).default('companies'),
+ listId: z.string().default('companies'),
```

---

## Logo Metadata & Registry (Game-Facing)

These are consumed by `GET /api/games/guess-logo/logos/companies/:listId` and the lists-listing endpoint.

### Metadata

In `apps/api/src/routes/games/guess-logo/logos/data/metadata.ts`:

Currently `getLogoListsMetadata(set)` returns a hardcoded `METADATA` constant. For the `companies` set, make it async and query the `lists` table:

```ts
async function getCompaniesListMetadata(db: DB, language: SupportedLanguage): Promise<ListMetadata[]> {
  const lists = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.isActive, true));

  // For each list, count how many stat items have that category
  // ...

  return lists.map(list => ({
    id: list.slug,
    name: { en: list.nameEn, ar: list.nameAr ?? '' },
    logosCount: count,
  }));
}
```

This means `getLogoListsMetadata` needs to accept an optional DB parameter for the companies case. The route handler already has `c` (context) available to get the DB.

### Registry

In `apps/api/src/routes/games/guess-logo/logos/data/registry.ts`:

Currently `getLogoFetcher(set, listId)` looks up a hardcoded fetcher. For companies, the fetcher is always `fetchCompaniesFromDB(listId, lang, c)` — so no change needed to the fetcher itself. We just need to validate that the listId exists in the `lists` table instead of checking the hardcoded object keys.

Simplest approach: in the `getLogosBySetAndList` handler, for `set === 'companies'`, first verify the list exists in the `lists` table, then fall through to the generic companies fetcher.

```ts
// In logos.handlers.ts, getLogosBySetAndList:
if (set === 'companies') {
  const list = await db
    .select()
    .from(listsTable)
    .where(and(eq(listsTable.slug, list), eq(listsTable.isActive, true)))
    .limit(1);

  if (!list.length) {
    return c.json({ error: 'Not found' }, HttpStatusCodes.NOT_FOUND);
  }

  const fetcher: Fetcher = (lang, ctx) => fetchCompaniesFromDB(list, lang, ctx);
  // ...continue with fetch...
}
```

This requires `getLogosBySetAndList` to have access to the DB, which it already does via `c`.

---

## Impact on the Unified Data Model (`stat_items`)

The `stat_items` table is a shared data layer consumed by both guess-logo (logos endpoint) and stat-clash (stat items endpoint). Per ADR-006, `stat_items.category` is the top-level grouping identifier. For companies, `category = listId = lists.slug`.

### Current Data Flow

```
lists.slug ──► companies.listId ──► stat_items.category ──► game queries
                      │                       │
                      │                       ├── GET /logos/companies/:listId
                      │                       └── GET /data/stat-items?category=:listId
                      │
                      └── ETL: createCompaniesTransformer({ listId: slug })
                             writes stat_items with category = listId
```

### What Changes (and What Doesn't)

| Layer | Status | Why |
|-------|--------|-----|
| **`packages/data-pipeline/src/transformers/companies.ts`** | ✅ No change needed | Already accepts `config.listId: string` and sets `category: config.listId`. The transformer is fully generic. |
| **`apps/api/src/services/stat-items.service.ts`** | ✅ No change needed | `fetchStatItems` already accepts any `category` string via `FetchStatItemsOptions.category`. |
| **`apps/api/src/routes/data/stat-items/`** | ✅ No change needed | The game consumption endpoint (`GET /data/stat-items`) filters by `category` — any list slug works. |
| **`apps/api/src/routes/games/guess-logo/logos/data/companies/fetchers-from-db.ts`** | ✅ No change needed | `fetchCompaniesFromDB` already takes a generic `category: string` parameter and passes it to `fetchStatItems`. |
| **`apps/api/src/routes/admin/sync/sync.handlers.ts` — `syncCompaniesHandler`** | ⚠️ Replace enum with `z.string()` | The `listId` param is already passed as-is to `createCompaniesTransformer`. Only the Zod schema needs updating. |
| **`apps/api/src/routes/admin/companies/companies.handlers.ts` — `upsertCompanyStatItem`** | ⚠️ Uses `company.listId` as `category` | Already generic. The `listId` flows from the company record. Only the Zod schema needs updating. |

### Concrete Example

When an admin creates a new list `{ slug: 'uae', nameEn: 'UAE Companies', nameAr: 'شركات الإمارات' }`:

1. Companies can now be created with `listId: 'uae'`
2. Sync with `{ listId: 'uae' }` triggers `createCompaniesTransformer({ listId: 'uae' })`
3. The transformer writes stat items with `category: 'uae'`
4. `GET /logos/companies/uae` returns company logos for the UAE list
5. `GET /data/stat-items?category=uae` returns company stat items for the UAE list (usable by stat-clash)

No changes to the ETL pipeline, stat-items service, or game endpoints are needed — all of them already treat `category` as an opaque string.

---

## Migration Plan

### Phase 1: Database & API (admin CRUD)

| Step | Files | Description |
|------|-------|-------------|
| 1.1 | `apps/api/src/db/lists.tables.ts` | Create Drizzle table definition |
| 1.2 | `apps/api/src/db/schema.ts` | Export `listsTable` |
| 1.3 | `apps/api/src/routes/admin/lists/*` | Create routes, handlers, schemas, index |
| 1.4 | `apps/api/src/routes/admin/index.ts` | Register `/lists` route |
| 1.5 | Generate migration via `pnpm db:generate` | Creates the `lists` table in D1 |
| 1.6 | `apps/api/seeds/shared/seed-lists.ts` | Seed "Global" and "Saudi" lists |
| 1.7 | Run migration locally via `pnpm db:migrate:local` | Apply migration |

### Phase 2: Admin Frontend

| Step | Files | Description |
|------|-------|-------------|
| 2.1 | `apps/admin/src/features/lists/list.tsx` | List page |
| 2.2 | `apps/admin/src/features/lists/create.tsx` | Create page |
| 2.3 | `apps/admin/src/features/lists/edit.tsx` | Edit page |
| 2.4 | `apps/admin/src/lib/data-provider.ts` | Add `'lists'` to ResourceType + routeMap |
| 2.5 | `apps/admin/src/routes/index.tsx` | Register lists Resource |

### Phase 3: Companies Integration

| Step | Files | Description |
|------|-------|-------------|
| 3.1 | `apps/api/src/routes/admin/companies/companies.schemas.ts` | Replace `z.enum` with `z.string()` |
| 3.2 | `apps/api/src/routes/admin/companies/companies.handlers.ts` | Add `search`/`q` support with `ilike` |
| 3.3 | `apps/api/src/routes/admin/sync/sync.routes.ts` | Replace sync enum with `z.string()` |
| 3.4 | `apps/admin/src/features/companies/create.tsx` | Dynamic list SelectInput |
| 3.5 | `apps/admin/src/features/companies/edit.tsx` | Dynamic list SelectInput |
| 3.6 | `apps/admin/src/features/companies/list.tsx` | ReferenceField for list badge |

### Phase 4: Game-Facing Endpoints

| Step | Files | Description |
|------|-------|-------------|
| 4.1 | `apps/api/src/routes/games/guess-logo/logos/data/metadata.ts` | Make company metadata query DB |
| 4.2 | `apps/api/src/routes/games/guess-logo/logos/data/registry.ts` | Make company registry validate against DB |
| 4.3 | `apps/api/src/routes/games/guess-logo/logos/logos.handlers.ts` | Update `getLogosBySetAndList` to handle dynamic company lists |

### Phase 5: Cleanup

| Step | Files | Description |
|------|-------|-------------|
| 5.1 | Remove `companyListIdSchema` usage from all imports | Dead code elimination |
| 5.2 | Remove hardcoded company list references in seed types | `CompanySeed.listId` type can become just `string` |
| 5.3 | Update `docs/games/guess-logo/company-list-management.md` | Reflect new workflow (admin UI instead of manual seed) |

---

## Delete Cascade Logic

When `deleteAdminList` is called:

```ts
// 1. Soft-delete the list
await db.update(listsTable)
  .set({ isActive: false, updatedAt: now })
  .where(eq(listsTable.id, id));

// 2. Soft-delete all companies in this list
const companies = await db
  .select()
  .from(companiesTable)
  .where(eq(companiesTable.listId, list.slug));

for (const company of companies) {
  await db.update(companiesTable)
    .set({ isActive: false, updatedAt: now })
    .where(eq(companiesTable.id, company.id));

  // 3. Soft-delete their stat items
  await db.update(statItemsTable)
    .set({ deletedAt: now, updatedAt: now })
    .where(and(
      eq(statItemsTable.entity, 'company'),
      eq(statItemsTable.externalId, company.id),
    ));
}
```

---

## Rollback Strategy

If things go wrong:

1. **Database**: Drop the `lists` table and restore `companyListIdSchema` to the enum.
2. **Admin**: Remove the `lists` Resource and revert company create/edit forms.
3. **Data**: The existing companies data is unaffected — their `listId` strings remain valid. No data migration needed since we're not changing the column type.

---

## Open Questions (resolved during grilling)

None. All design decisions are documented above. If a new question arises during implementation, record it in this document before proceeding.
