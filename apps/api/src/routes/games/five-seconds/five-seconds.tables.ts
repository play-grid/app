import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { timestamp } from '@/db/timestamp';

// Temporary cuid() implementation
const cuid = () => `cuid_${Math.random().toString(36).substring(2, 15)}`;

export const fiveSecondsCategories = sqliteTable(
  'five_seconds_categories',
  {
    id: text('id').primaryKey(), // e.g. cat_general_v1
    name: text('name').notNull(), // e.g. General
    ...timestamp,
  },
  t => [
    uniqueIndex('category_name_idx').on(t.name),
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
