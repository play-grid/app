import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import {
  createStatItemSchema,
  listStatItemsQuerySchema,
  listStatItemsResponseSchema,
  statItemOutputSchema,
  statusTransitionSchema,
  updateStatItemSchema,
} from './stat-items.schemas';

const tags = ['Stat Items'];

export const listStatItems = createRoute({
  path: '/',
  method: 'get',
  operationId: 'listAdminStatItems',
  tags,
  request: {
    query: listStatItemsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      listStatItemsResponseSchema,
      'List of stat items with pagination',
    ),
  },
});

export const getStatItemById = createRoute({
  path: '/:id',
  method: 'get',
  operationId: 'getAdminStatItemById',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(statItemOutputSchema, 'Stat item details'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Stat item not found',
    ),
  },
});

export const createStatItem = createRoute({
  path: '/',
  method: 'post',
  operationId: 'createAdminStatItem',
  tags,
  request: {
    body: {
      content: {
        'application/json': {
          schema: createStatItemSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      statItemOutputSchema,
      'Stat item created successfully',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid input',
    ),
  },
});

export const updateStatItem = createRoute({
  path: '/:id',
  method: 'patch',
  operationId: 'updateAdminStatItem',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateStatItemSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      statItemOutputSchema,
      'Stat item updated successfully',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Stat item not found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid input',
    ),
  },
});

export const deleteStatItem = createRoute({
  path: '/:id',
  method: 'delete',
  operationId: 'deleteAdminStatItem',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Stat item deleted successfully',
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Stat item not found',
    ),
  },
});

export const updateStatItemStatus = createRoute({
  path: '/:id/status',
  method: 'patch',
  operationId: 'updateStatItemStatus',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: statusTransitionSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      statItemOutputSchema,
      'Stat item status updated successfully',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Stat item not found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid status transition',
    ),
  },
});

export const bulkUpdateStatus = createRoute({
  path: '/bulk/status',
  method: 'patch',
  operationId: 'bulkUpdateStatItemStatus',
  tags,
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            ids: z.array(z.string()).min(1),
            status: z.enum(['approved', 'rejected', 'pending']),
          }),
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        updated: z.number(),
        errors: z.array(z.string()).optional(),
      }),
      'Status update result',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid request',
    ),
  },
});

export type ListStatItemsRoute = typeof listStatItems;
export type GetStatItemByIdRoute = typeof getStatItemById;
export type CreateStatItemRoute = typeof createStatItem;
export type UpdateStatItemRoute = typeof updateStatItem;
export type DeleteStatItemRoute = typeof deleteStatItem;
export type UpdateStatItemStatusRoute = typeof updateStatItemStatus;
export type BulkUpdateStatusRoute = typeof bulkUpdateStatus;
