import { gameStatItemSchema } from '@guess-logo/data-pipeline';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

const statItemResponseSchema = gameStatItemSchema.pick({
  id: true,
  entity: true,
  name: true,
  metricType: true,
  value: true,
  unit: true,
  imageUrl: true,
  hint: true,
}).openapi('StatItem');

export const getStatItems = createRoute({
  path: '/stat-items',
  method: 'get',
  operationId: 'getStatItems',
  tags: ['Data'],
  request: {
    query: z.object({
      category: z.string().optional().openapi({
        description: 'Filter by category (e.g., "football", "companies")',
      }),
      metricType: z.string().optional().openapi({
        description: 'Filter by metric type (e.g., "goals", "market-cap")',
      }),
      status: z.enum(['pending', 'approved', 'rejected']).default('approved').openapi({
        description: 'Filter by status, defaults to approved for game use',
      }),
      limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
        description: 'Maximum number of items to return',
      }),
      excludeIds: z.array(z.string()).optional().openapi({
        description: 'IDs to exclude from results',
      }),
      lang: z.enum(['en', 'ar']).default('en').openapi({
        description: 'Language for the response. Arabic items will be translated on first request and cached.',
      }),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        items: z.array(statItemResponseSchema),
      }),
      'List of stat items for game consumption',
    ),
  },
});

export type GetStatItemsRoute = typeof getStatItems;
