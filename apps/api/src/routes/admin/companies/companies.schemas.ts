import { z } from '@hono/zod-openapi';
import { adminListQuerySchema, paginationSchema } from '../shared-schemas';

export const companyListIdSchema = z.enum(['companies', 'saudi']).openapi('CompanyListId');

export const createCompanySchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().nullable().optional(),
  listId: companyListIdSchema,
  sync: z.boolean().optional().default(false),
}).openapi('CreateCompany');

export const updateCompanySchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().nullable().optional(),
  listId: companyListIdSchema.optional(),
  isActive: z.boolean().optional(),
}).openapi('UpdateCompany');

export const companyOutputSchema = z.object({
  id: z.string(),
  nameEn: z.string(),
  nameAr: z.string().nullable(),
  listId: z.string(),
  isActive: z.boolean().nullable(),
  isManualOverride: z.boolean().nullable(),
  lastSyncedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).openapi('AdminCompany');

export const listCompaniesResponseSchema = z.object({
  data: z.array(companyOutputSchema),
  pagination: paginationSchema,
});

export const listCompaniesQuerySchema = adminListQuerySchema.extend({
  listId: companyListIdSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export const syncCompanyResultSchema = z.object({
  synced: z.boolean(),
  logoUrl: z.string().nullable(),
  skipped: z.boolean().optional(),
}).openapi('SyncCompanyResult');
