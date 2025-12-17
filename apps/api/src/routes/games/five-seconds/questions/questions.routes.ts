import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import {
  getBatchQuestionsResponseSchema,
  getRandomQuestionResponseSchema,
  questionBatchQuery,
  questionQuery,
} from './questions.schemas';

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
      getRandomQuestionResponseSchema,
      'Successfully retrieved a random question or no questions found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid request parameters',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export type GetRandomQuestionRoute = typeof getRandomQuestion;

export const getBatchQuestions = createRoute({
  path: '/batch',
  method: 'get',
  request: {
    query: questionBatchQuery,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      getBatchQuestionsResponseSchema,
      'Batch of random questions',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export type GetBatchQuestionsRoute = typeof getBatchQuestions;
