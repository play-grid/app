import { statItemInsertSchema, statItemSelectSchema } from '@playgrid/data-pipeline';
import { z } from 'zod';
import { adminListQuerySchema, paginationSchema } from '../shared-schemas';

export const createStatItemSchema = statItemInsertSchema.extend({
  status: z.enum(['approved', 'rejected']).optional(),
  isManualOverride: z.boolean().optional(),
}).openapi('CreateStatItem');

export const updateStatItemSchema = statItemInsertSchema.partial().openapi('UpdateStatItem');

export const statItemOutputSchema = statItemSelectSchema.openapi('AdminStatItem');

export const listStatItemsResponseSchema = z.object({
  data: z.array(statItemOutputSchema),
  pagination: paginationSchema,
});

export const listStatItemsQuerySchema = adminListQuerySchema.extend({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  category: z.string().optional(),
  metricType: z.string().optional(),
  entity: z.string().optional(),
  source: z.string().optional(),
});

export const statusTransitionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});
