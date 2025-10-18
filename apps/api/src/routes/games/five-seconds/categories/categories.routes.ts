import { languageQuery } from '@guess-logo/shared/schemas';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { categorySchema } from './categories.schemas';

export const tags = ['categories'];

export const listCategories = createRoute({
  path: '/',
  tags,
  method: 'get',
  request: {
    query: languageQuery,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(categorySchema), 'Successfully retrieved all categories'),
  },
});

export const getCategory = createRoute({
  path: '/{id}',
  tags,
  method: 'get',
  request: {
    params: z.object({
      id: z.string(),
    }),
    query: languageQuery,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(categorySchema, 'Successfully retrieved a category'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Category not found',
    ),
  },
});
