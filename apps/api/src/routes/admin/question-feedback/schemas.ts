import { z } from 'zod';
import { paginationSchema } from '@/routes/admin/shared-schemas';
import { feedbackOutputSchema } from '@/routes/games/five-seconds/questions/feedback/schemas';

export const listQuestionFeedbackQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export const listQuestionFeedbackResponseSchema = z.object({
  data: z.array(feedbackOutputSchema),
  pagination: paginationSchema,
});

export type ListQuestionFeedbackResponse = z.infer<typeof listQuestionFeedbackResponseSchema>;
