import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import {
  listQuestionFeedbackQuerySchema,
  listQuestionFeedbackResponseSchema,
} from './schemas';

const tags = ['Question Feedback'];

export const listQuestionFeedback = createRoute({
  path: '/',
  method: 'get',
  tags,
  request: {
    query: listQuestionFeedbackQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      listQuestionFeedbackResponseSchema,
      'List of question feedback with pagination',
    ),
  },
});

export type ListQuestionFeedbackRoute = typeof listQuestionFeedback;
