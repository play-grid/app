import { categoryBaseSchema } from '@playgrid/shared/schemas';
import z from 'zod';
import { paginationSchema } from '../shared-schemas';

export const adminCategorySchema = categoryBaseSchema.describe('Admin Category');
export const categoriesOutputSchema = adminCategorySchema;

export const listCategoriesResponseSchema = z.object({
  data: z.array(categoriesOutputSchema),
  pagination: paginationSchema,
});
