import { z } from 'zod';

export const publicBannerSchema = z.object({
  id: z.string(),
  titleEn: z.string(),
  titleAr: z.string(),
  descriptionEn: z.string().nullable(),
  descriptionAr: z.string().nullable(),
  imageUrl: z.string().nullable(),
  linkUrl: z.string().nullable(),
  position: z.number(),
}).openapi('PublicBanner');
