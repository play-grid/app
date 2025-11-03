import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { timestamp } from '@/db/timestamp';
import { feedbackTypes } from './questions/feedback/types';

// Temporary cuid() implementation
const cuid = () => `cuid_${Math.random().toString(36).substring(2, 15)}`;

export const fiveSecondsCategories = sqliteTable(
  'five_seconds_categories',
  {
    id: text('id').primaryKey(), // e.g. cat_general_v1
    nameEn: text('name_en').notNull().default(''),
    nameAr: text('name_ar').notNull().default(''),

    ...timestamp,
  },
  t => [
    uniqueIndex('category_name_en_idx').on(t.nameEn),
    uniqueIndex('category_name_ar_idx').on(t.nameAr),
  ],
);

export const fiveSecondsQuestions = sqliteTable(
  'five_seconds_questions',
  {
    id: text('id').primaryKey().$defaultFn(cuid),
    question: text('question').notNull(),
    exampleAnswers: text('example_answers'),
    categoryId: text('category_id').notNull().references(() => fiveSecondsCategories.id),
    difficulty: text('difficulty').notNull(),
    metadata: text('metadata'), // stored as JSON string
    ...timestamp,
  },
  t => [
    uniqueIndex('question_idx').on(t.question),
  ],
);

export const fiveSecondsFeedback = sqliteTable('five_seconds_feedback', {
  id: text('id').primaryKey().$defaultFn(cuid),
  questionId: text('question_id')
    .notNull()
    .references(() => fiveSecondsQuestions.id, { onDelete: 'cascade' }),
  type: text('type', { enum: feedbackTypes }).notNull(),
  comment: text('comment'), // optional text feedback
  playerId: text('player_id'),
  ...timestamp,
});
