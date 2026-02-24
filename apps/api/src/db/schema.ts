import * as bannersSchemas from '@/db/banners.tables';
import * as statItemsSchema from '@/db/stat-items.tables';
import * as teamsSchema from '@/db/teams.tables';
import * as fiveSecondsQuestionsSchema from '@/routes/games/five-seconds/five-seconds.tables';
import * as sportSchemas from '@/routes/games/guess-logo/sports/sports.tables';
import * as authSchema from './auth.schema';

export * from './auth.schema';
export * from '@/db/banners.tables';
export * from '@/db/stat-items.tables';
export * from '@/db/teams.tables';
export * from '@/routes/games/five-seconds/five-seconds.tables';
export * from '@/routes/games/guess-logo/sports/sports.tables';

export const schema = {
  ...authSchema,
  ...fiveSecondsQuestionsSchema,
  ...sportSchemas,
  ...bannersSchemas,
  ...statItemsSchema,
  ...teamsSchema,

} as const;
