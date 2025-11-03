import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { z } from 'zod';
import { createFeedbackInputSchema, feedbackOutputSchema } from './schemas';
import { feedbackTypes } from './types';

const tags = ['questions'];

const messageSchema = z.object({
  message: z.string(),
});

// Get Feedback Types
export const getFeedbackTypes = createRoute({
  path: '/types',
  method: 'get',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(z.enum(feedbackTypes)),
      'A list of feedback types',
    ),
  },
});

// Create Feedback (POST /feedback)
export const createFeedback = createRoute({
  path: '/',
  method: 'post',
  tags,
  request: {
    body: jsonContentRequired(
      createFeedbackInputSchema,
      'The Feedback to create',
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      feedbackOutputSchema,
      'Feedback created successfully',
    ),
    [HttpStatusCodes.BAD_REQUEST]: {
      description: 'Invalid input (e.g., bad questionId)',
    },
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      messageSchema,
      'Internal server error',
    ),
  },
});

export type CreateFeedbackRoute = typeof createFeedback;
export type GetFeedbackTypesRoute = typeof getFeedbackTypes;
