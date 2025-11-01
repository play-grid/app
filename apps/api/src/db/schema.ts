import * as authSchema from './auth.schema';
import * as fiveSecondsQuestionsSchema from './five-seconds-questions.schema';

export * from './auth.schema';
export * from './five-seconds-questions.schema';

export const schema = {
  ...authSchema,
  ...fiveSecondsQuestionsSchema,
} as const;
