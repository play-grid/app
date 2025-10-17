import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { question, questionQuery } from './schemas';

export const tags = ['questions'];

export const getRandomQuestion = createRoute({
  path: '/question/random',
  request: {
    query: questionQuery,
  },
  tags,
  method: 'get',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(question), 'Successfully retrieved a random question'),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid logo set',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export type getRandomQuestionRoute = typeof getRandomQuestion;
