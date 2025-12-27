import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import {
  createQuestionsInputSchema,
  listQuestionsQuerySchema,
  listQuestionsResponseSchema,
  questionsOutputSchema,
  updateQuestionsInputSchema,
} from './schemas';

const tags = ['Questions'];

export const listQuestions = createRoute({
  path: '/',
  method: 'get',
  operationId: 'listAdminQuestions',
  tags,
  request: {
    query: listQuestionsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      listQuestionsResponseSchema,
      'List of questions with pagination',
    ),
  },
});

export type ListQuestionsRoute = typeof listQuestions;

export const getQuestionsById = createRoute({
  path: '/:id',
  method: 'get',
  operationId: 'getAdminQuestionById',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      questionsOutputSchema,
      'Questions details',
    ),
    [HttpStatusCodes.NOT_FOUND]: {
      description: 'Questions not found',
    },
  },
});

export type GetQuestionsByIdRoute = typeof getQuestionsById;

export const createQuestions = createRoute({
  path: '/',
  method: 'post',
  operationId: 'createAdminQuestion',
  tags,
  request: {
    body: jsonContentRequired(
      createQuestionsInputSchema,
      'The question to create',
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      questionsOutputSchema,
      'Question created successfully',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid input or category does not exist',
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      z.object({ error: z.string() }),
      'Question already exists',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Internal server error',
    ),
  },
});

export type CreateQuestionsRoute = typeof createQuestions;

export const updateQuestions = createRoute({
  path: '/:id',
  method: 'patch',
  operationId: 'updateAdminQuestion',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: jsonContentRequired(
      updateQuestionsInputSchema,
      'The Questions updates',
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      questionsOutputSchema,
      'Questions updated successfully',
    ),
    [HttpStatusCodes.NOT_FOUND]: {
      description: 'Questions not found',
    },
    [HttpStatusCodes.BAD_REQUEST]: {
      description: 'Invalid input',
    },
  },
});

export type UpdateQuestionsRoute = typeof updateQuestions;

export const deleteQuestions = createRoute({
  path: '/:id',
  method: 'delete',
  operationId: 'deleteAdminQuestion',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Questions deleted successfully',
    },
    [HttpStatusCodes.NOT_FOUND]: {
      description: 'Questions not found',
    },
  },
});

export type DeleteQuestionsRoute = typeof deleteQuestions;
