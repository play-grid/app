import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

import createRouter from '@/api/lib/create-router';

const router = createRouter()
  .openapi(
    createRoute({
      tags: ['Index'],
      method: 'get',
      path: '/',
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema('Game-Guess API'),
          'Game-Guess API',
        ),
        [HttpStatusCodes.NOT_MODIFIED]: {
          description: 'Not Modified',
        },
      },
    }),
    (c) => {
      return c.json({
        message: 'Game-Guess API',
      }, HttpStatusCodes.OK);
    },
  );

export default router;
