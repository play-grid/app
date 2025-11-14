import * as fiveSecondsQuestionsSchema from '@/routes/games/five-seconds/five-seconds.tables';
import * as sportScehemas from '@/routes/games/guess-logo/sports/sports.tables';
import * as authSchema from './auth.schema';

export * from './auth.schema';
export * from '@/routes/games/five-seconds/five-seconds.tables';
export * from '@/routes/games/guess-logo/sports/sports.tables';

export const schema = {
  ...authSchema,
  ...fiveSecondsQuestionsSchema,
  ...sportScehemas,
} as const;
