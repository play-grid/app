// apps/api/src/routes/games/five-seconds/categories/categories.routes.ts
import { categorySchema } from '@guess-logo/five-seconds';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

export const tags = ['categories'];

export const listCategories = createRoute({
  path: '/',
  tags,
  method: 'get',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(categorySchema),
      'Successfully retrieved all categories',
    ),
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
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      categorySchema,
      'Successfully retrieved a category',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Category not found',
    ),
  },
});
