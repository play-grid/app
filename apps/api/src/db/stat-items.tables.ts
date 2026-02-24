import type { InferSelectModel } from 'drizzle-orm';
import { cuid2 } from 'drizzle-cuid2/sqlite';
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { countriesTable } from './countries.tables';
import { teamsTable } from './teams.tables';

export const statItemsTable = sqliteTable('stat_items', {
  id: cuid2('id').defaultRandom().primaryKey(),

  entity: text('entity_type').notNull(),
  externalId: text('external_id'),
  category: text('category').notNull(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),

  metricType: text('metric_type').notNull(),
  value: real('value').notNull(),
  unit: text('unit').notNull(),
  unitAr: text('unit_ar'),

  imageUrl: text('image_url'),
  teamId: text('team_id').references(() => teamsTable.id),
  playerId: text('player_id'),
  countryId: text('country_id').references(() => countriesTable.id),

  hint: text('hint'),
  hintAr: text('hint_ar'),

  source: text('source').notNull(),
  status: text('status').notNull().default('pending'),
  isManualOverride: integer('is_manual_override', { mode: 'boolean' }).default(false),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}, table => ({
  gameQueryIdx: index('idx_stat_items_game').on(table.category, table.status, table.metricType),
  externalLookupIdx: index('idx_stat_items_external').on(table.externalId, table.category, table.metricType),
}));

export type StatItem = InferSelectModel<typeof statItemsTable>;
