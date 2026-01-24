import { z } from 'zod';
import { adminListQuerySchema, paginationSchema } from '../shared-schemas';

// Base schema for banner data
const bannerBaseSchema = z.object({
  titleEn: z.string().min(1, 'Title (English) is required'),
  titleAr: z.string().min(1, 'Title (Arabic) is required'),
  descriptionEn: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  linkUrl: z.url().nullable().optional(),
  isActive: z.coerce.boolean().default(true),
  position: z.coerce.number().int().min(0).default(0),
  startDate: z.iso.datetime().nullable().optional(),
  endDate: z.iso.datetime().nullable().optional(),
});

// Form schema with file handling
export const createBannerFormSchema = bannerBaseSchema.extend({
  imageFile: z.instanceof(File).optional().openapi({
    description: 'Banner image file to upload',
    type: 'string',
    format: 'binary',
  }),
  imageUrl: z.string().optional(),
});

export const updateBannerFormSchema = createBannerFormSchema.partial();

// Output schema
export const bannerOutputSchema = z.object({
  id: z.string(),
  titleEn: z.string(),
  titleAr: z.string(),
  descriptionEn: z.string().nullable(),
  descriptionAr: z.string().nullable(),
  imageUrl: z.string().nullable(),
  linkUrl: z.string().nullable(),
  isActive: z.boolean(),
  position: z.number(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).openapi('AdminBanner');

export const listBannersResponseSchema = z.object({
  data: z.array(bannerOutputSchema),
  pagination: paginationSchema,
});

export const listBannersQuerySchema = adminListQuerySchema.extend({
  isActive: z.coerce.boolean().optional(),
});
