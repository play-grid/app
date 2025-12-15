import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { questionBatchQuery, questionQuery, questionSchema } from './questions.schemas';

export const tags = ['questions'];

export const getRandomQuestion = createRoute({
  path: '/random',
  request: {
    query: questionQuery,
  },
  tags,
  method: 'get',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.union([
        questionSchema,
        z.object({
          code: z.literal('NO_QUESTIONS_FOUND'),
          message: z.string(),
        }),
      ]),
      'Successfully retrieved a random question or no questions found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid request set',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export type getRandomQuestionRoute = typeof getRandomQuestion;

export const getBatchQuestions = createRoute({
  path: '/batch',
  method: 'get',
  request: {
    query: questionBatchQuery,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        questions: z.array(questionSchema),
      }),
      'Batch of random questions',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export type getBatchQuestionsRoute = typeof getBatchQuestions;
