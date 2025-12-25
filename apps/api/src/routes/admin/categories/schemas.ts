import { categorySchema } from '@guess-logo/five-seconds';
import z from 'zod';
import { paginationSchema } from '../shared-schemas';

export const categoriesOutputSchema = categorySchema;

export const listCategoriesResponseSchema = z.object({
  data: z.array(categoriesOutputSchema),
  pagination: paginationSchema,
});
