import { z } from 'zod';

// Common pagination schema for all admin routes
export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// Common query parameters for admin list operations
export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
});
