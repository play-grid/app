import { z } from 'zod';

export const statItemSelectSchema = z.object({
  id: z.string(),
  entity: z.string(),
  externalId: z.string().nullable(),
  category: z.string(),
  name: z.string(),
  nameAr: z.string().nullable(),
  metricType: z.string(),
  value: z.number(),
  unit: z.string(),
  unitAr: z.string().nullable(),
  imageKey: z.string().nullable(),
  imageUrl: z.string().nullable(),
  hint: z.string().nullable(),
  hintAr: z.string().nullable(),
  source: z.string(),
  status: z.string(),
  isManualOverride: z.boolean().nullable(),
  lastSyncedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const statItemInsertSchema = z.object({
  id: z.string().optional(),
  entity: z.string().min(1),
  externalId: z.string().optional(),
  category: z.string().min(1),
  name: z.string().min(1),
  metricType: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  imageKey: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  hint: z.string().optional(),
  source: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  isManualOverride: z.boolean().default(false).optional(),
});

export const statItemInputSchema = z.object({
  entity: z.string().min(1),
  externalId: z.string().optional(),
  category: z.string().min(1),
  name: z.string().min(1),
  metricType: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  imageKey: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  hint: z.string().optional(),
  source: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export const gameStatItemSchema = statItemSelectSchema.pick({
  id: true,
  entity: true,
  name: true,
  nameAr: true,
  metricType: true,
  value: true,
  unit: true,
  unitAr: true,
  imageUrl: true,
  hint: true,
  hintAr: true,
});

export type StatItem = z.infer<typeof statItemSelectSchema>;
export type StatItemInsert = z.infer<typeof statItemInsertSchema>;
export type StatItemInput = z.infer<typeof statItemInputSchema>;
export type GameStatItem = z.infer<typeof gameStatItemSchema>;
