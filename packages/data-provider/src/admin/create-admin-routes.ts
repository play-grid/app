import type { CRUDHandlers, StatusHandlers } from '../crud';
import { zValidator } from '@hono/zod-validator';

import { Hono } from 'hono';
import { z } from 'zod';
import { createBulkInputSchema } from '../crud/create-status-handlers';

const idParamSchema = z.object({
  id: z.string(),
});

export interface CreateAdminRoutesOptions {
  handlers: CRUDHandlers;
  schemas: {
    create: z.ZodType;
    update: z.ZodType;
    query: z.ZodType;
  };
  statusHandlers?: StatusHandlers;
  bulkLimit?: number;
}

export function createAdminRoutes(options: CreateAdminRoutesOptions) {
  const { handlers, statusHandlers = {}, schemas, bulkLimit = 500 } = options;
  const adminApp = new Hono();
  const bulkInputSchema = createBulkInputSchema(bulkLimit);

  adminApp.get('/', zValidator('query', schemas.query), handlers.list);
  adminApp.get('/:id', zValidator('param', idParamSchema), handlers.getOne);
  adminApp.post('/', zValidator('json', schemas.create), handlers.create);
  adminApp.patch('/:id', zValidator('param', idParamSchema), zValidator('json', schemas.update), handlers.update);
  adminApp.delete('/:id', zValidator('param', idParamSchema), handlers.delete);

  if (statusHandlers) {
    for (const [action, handler] of Object.entries(statusHandlers)) {
      const isBulk = action.startsWith('bulk-');

      if (isBulk) {
        const bulkAction = action.replace('bulk-', '');
        adminApp.post(`/bulk-${bulkAction}`, zValidator('json', bulkInputSchema), handler);
      }
      else {
        adminApp.post(`/:id/${action}`, zValidator('param', idParamSchema), handler);
      }
    }
  }

  return adminApp;
}
