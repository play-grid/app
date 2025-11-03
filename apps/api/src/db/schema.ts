import * as fiveSecondsQuestionsSchema from '@/routes/games/five-seconds/five-seconds.tables';
import * as authSchema from './auth.schema';

export * from './auth.schema';
export * from '@/routes/games/five-seconds/five-seconds.tables';

export const schema = {
  ...authSchema,
  ...fiveSecondsQuestionsSchema,
} as const;
