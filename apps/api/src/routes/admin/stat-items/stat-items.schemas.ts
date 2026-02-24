import { z } from 'zod';
import { adminListQuerySchema, paginationSchema } from '../shared-schemas';

export const statItemBaseSchema = z.object({
  entity: z.string().min(1, 'Entity type is required'),
  externalId: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  metricType: z.string().min(1, 'Metric type is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  imageKey: z.string().optional(),
  imageUrl: z.url().nullable().optional(),
  hint: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  isManualOverride: z.boolean().default(false),
});

export const createStatItemSchema = statItemBaseSchema.extend({
  status: z.enum(['approved', 'rejected']).optional(),
  isManualOverride: z.boolean().optional(),
});

export const updateStatItemSchema = statItemBaseSchema.partial();

export const statItemOutputSchema = z.object({
  id: z.string(),
  entity: z.string(),
  externalId: z.string().nullable(),
  category: z.string(),
  name: z.string(),
  metricType: z.string(),
  value: z.number(),
  unit: z.string(),
  imageKey: z.string().nullable(),
  imageUrl: z.string().nullable(),
  hint: z.string().nullable(),
  source: z.string(),
  status: z.string(),
  isManualOverride: z.boolean(),
  lastSyncedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).openapi('AdminStatItem');

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
