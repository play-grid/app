import { sql } from 'drizzle-orm';
import { integer } from 'drizzle-orm/sqlite-core';

const nowSql = sql`cast((julianday('now') - 2440587.5)*86400000 as integer)`;

export const timestamp = {
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$onUpdate(() => nowSql),
};
