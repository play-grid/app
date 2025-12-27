import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { gameCategorySchema } from './categories.schemas';

export const tags = ['categories'];

export const listCategories = createRoute({
  path: '/',
  tags,
  method: 'get',
  operationId: 'listGameCategories',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(gameCategorySchema),
      'Successfully retrieved all categories',
    ),
  },
});

export const getCategory = createRoute({
  path: '/{id}',
  tags,
  method: 'get',
  operationId: 'getGameCategory',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      gameCategorySchema,
      'Successfully retrieved a category',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Category not found',
    ),
  },
});
