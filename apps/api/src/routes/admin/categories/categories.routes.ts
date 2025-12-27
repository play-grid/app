import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { categoriesOutputSchema, listCategoriesResponseSchema } from './schemas';

const tags = ['Categories'];

export const listCategories = createRoute({
  path: '/',
  method: 'get',
  operationId: 'listAdminCategories',
  tags,
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      listCategoriesResponseSchema,
      'List of categories with pagination',
    ),
  },
});

export type ListCategoriesRoute = typeof listCategories;

export const getCategoriesById = createRoute({
  path: '/:id',
  method: 'get',
  operationId: 'getAdminCategoryById',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      categoriesOutputSchema,
      'Category details',
    ),
    [HttpStatusCodes.NOT_FOUND]: {
      description: 'Category not found',
    },
  },
});

export type GetCategoriesByIdRoute = typeof getCategoriesById;
