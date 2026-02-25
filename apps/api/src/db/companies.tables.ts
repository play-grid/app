import type { InferSelectModel } from 'drizzle-orm';
import { cuid2 } from 'drizzle-cuid2/sqlite';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp } from './utils/timestamp';

export const companiesTable = sqliteTable('companies', {
  id: cuid2('id').defaultRandom().primaryKey(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar'),
  listId: text('list_id').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isManualOverride: integer('is_manual_override', { mode: 'boolean' }).default(false),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  ...timestamp,
});

export type Company = InferSelectModel<typeof companiesTable>;
