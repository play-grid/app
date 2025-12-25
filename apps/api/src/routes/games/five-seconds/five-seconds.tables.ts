import type { InferSelectModel } from 'drizzle-orm';
import { cuid2 } from 'drizzle-cuid2/sqlite';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { timestamp } from '@/db/utils/timestamp';

export const fiveSecondsCategories = sqliteTable(
  'five_seconds_categories',
  {
    id: cuid2('id').defaultRandom().primaryKey(),
    nameEn: text('name_en').notNull().default(''),
    nameAr: text('name_ar').notNull().default(''),
    ...timestamp,
  },
  t => [
    uniqueIndex('category_name_en_idx').on(t.nameEn),
    uniqueIndex('category_name_ar_idx').on(t.nameAr),
  ],
);

export type FiveSecondsCategory = InferSelectModel<typeof fiveSecondsCategories>;

export const fiveSecondsQuestions = sqliteTable(
  'five_seconds_questions',
  {
    id: cuid2('id').defaultRandom().primaryKey(),
    text: text('text').notNull(),
    difficulty: text('difficulty', {
      enum: ['easy', 'medium', 'hard'],
    }).notNull(),
    categoryId: text('category_id')
      .notNull()
      .references(() => fiveSecondsCategories.id),
    deletedAt: integer('deletedAt', { mode: 'timestamp' }),
    ...timestamp,
  },
  t => [uniqueIndex('question_text_idx').on(t.text)],
);

export type FiveSecondsQuestion = InferSelectModel<typeof fiveSecondsQuestions>;

export const fiveSecondsFeedback = sqliteTable('five_seconds_feedback', {
  id: cuid2('id').defaultRandom().primaryKey(),
  questionId: text('question_id')
    .notNull()
    .references(() => fiveSecondsQuestions.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  comment: text('comment'),
  playerId: text('player_id'),
  ...timestamp,
});
