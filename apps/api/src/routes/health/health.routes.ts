import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

const tags = ['Health'];

const statusEnum = z.enum(['ok', 'fail', 'degraded']);

export const healthSchema = z.object({
  status: statusEnum,
  version: z.string(),
  serviceId: z.string(),
  description: z.string().optional(),
  checks: z.object({
    externalApi: z.object({
      status: statusEnum,
    }),
  }),
});

// Create the route definition for OpenAPI + Hono
export const health = createRoute({
  method: 'get',
  path: '/health',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      healthSchema,
      'Service is healthy',
    ),
    [HttpStatusCodes.SERVICE_UNAVAILABLE]: jsonContent(
      healthSchema,
      'Service is unhealthy',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error',
    },
  },
});

export type healthRoute = z.infer<typeof healthSchema>;
