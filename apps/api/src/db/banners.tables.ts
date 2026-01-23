import type { InferSelectModel } from 'drizzle-orm';
import { cuid2 } from 'drizzle-cuid2/sqlite';
import {
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const banners = sqliteTable(
  'banners',
  {
    id: cuid2('id').defaultRandom().primaryKey(),
    titleEn: text('title_en').notNull(),
    titleAr: text('title_ar').notNull(),
    descriptionEn: text('description_en'),
    descriptionAr: text('description_ar'),
    imageUrl: text('image_url'),
    linkUrl: text('link_url'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    position: integer('position').notNull().default(0),
    startDate: integer('start_date', { mode: 'timestamp' }),
    endDate: integer('end_date', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
);

export type Banner = InferSelectModel<typeof banners>;
