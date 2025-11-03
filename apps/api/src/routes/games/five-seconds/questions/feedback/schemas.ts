import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { toZodV4SchemaTyped } from '@/lib/zod-utils';
import { fiveSecondsFeedback } from '@/routes/games/five-seconds/five-seconds.tables';
import { feedbackTypes } from './types';

export const feedbackOutputSchema = toZodV4SchemaTyped(createSelectSchema(fiveSecondsFeedback));

export const createFeedbackInputSchema = createInsertSchema(fiveSecondsFeedback, {
  type: z.enum(feedbackTypes),
  // Make optional fields explicitly optional in the API
  comment: z.string().optional(),
  playerId: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FeedbackOutput = z.infer<typeof feedbackOutputSchema>;
export type CreateFeedbackInput = z.infer<typeof createFeedbackInputSchema>;
