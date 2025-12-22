import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import {
  getBatchQuestionsQuerySchema,
  getRandomQuestionQuerySchema,
  questionResponseSchema,
} from './questions.schemas';

const tags = ['Five Seconds - Questions'];

export const getRandomQuestion = createRoute({
  path: '/random',
  method: 'get',
  tags,
  request: {
    query: getRandomQuestionQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.union([
        questionResponseSchema,
        z.object({
          code: z.literal('NO_QUESTIONS_FOUND'),
          message: z.string(),
        }),
      ]),
      'A random question or no questions found',
    ),
  },
});

export type GetRandomQuestionRoute = typeof getRandomQuestion;

export const getBatchQuestions = createRoute({
  path: '/batch',
  method: 'get',
  tags,
  request: {
    query: getBatchQuestionsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        questions: z.array(questionResponseSchema),
      }),
      'A batch of questions',
    ),
  },
});

export type GetBatchQuestionsRoute = typeof getBatchQuestions;
