import { localeRecordSchema } from '@guess-logo/shared/schemas';
import z from 'zod';

// Logos it self
const BaseLogoSchema = z.object({
  id: z.number(),
  name: z.string(),
  imageUrl: z.url(),
});

const CompanyLogoSchema = BaseLogoSchema.extend({
  type: z.literal('company'),
});

const CountryLogoSchema = BaseLogoSchema.extend({
  type: z.literal('country'),
  originalName: z.string(),
  countryData: z.object({
    name: z.string(),
    region: z.string(),
    currency: z.string(),
  }),
});

export const SportsLogoSchema = BaseLogoSchema.omit({ id: true }).extend({
  id: z.string(),
  type: z.literal('sports'),
  league: z.string().optional(),
  sport: z.string().optional(),
});

const MoviePosterLogoSchema = BaseLogoSchema.extend({
  type: z.literal('movie'),
  year: z.number().optional(),
  genre: z.string().optional(),
});

export const LogoContentSchema = z.discriminatedUnion('type', [
  CompanyLogoSchema,
  CountryLogoSchema,
  SportsLogoSchema,
  MoviePosterLogoSchema,
]);

export type LogoContent = z.infer<typeof LogoContentSchema>;
export type CompanyLogo = z.infer<typeof CompanyLogoSchema>;
export type CountryLogo = z.infer<typeof CountryLogoSchema>;
export type SportsLogo = z.infer<typeof SportsLogoSchema>;
export type MoviePosterLogo = z.infer<typeof MoviePosterLogoSchema>;

// Logos Sets that contain Lists , not logos
export const LogoSetKeySchema = z.enum([
  'companies',
  'countries',
  'sports',
  'movies',
]);

export type LogoSetKey = z.infer<typeof LogoSetKeySchema>;

export const LOGO_SET_TYPE_MAP = {
  companies: 'company',
  countries: 'country',
  sports: 'sports',
  movies: 'movie',
} as const;

// Logos Lists that contain logos.
// pure output for frontend.
export const ListMetadataSchema = z.object({
  id: z.string(),
  name: localeRecordSchema,
  logosCount: z.number(),
});

export type ListMetadata = z.infer<typeof ListMetadataSchema>;

// Logos Lists that contain logos,- sports
export const sportRegionSchema = z.object({
  id: z.string(),
  name: localeRecordSchema,
});
export type sportRegion = z.infer<typeof sportRegionSchema>;

export const sportLeagueSchema = z.object({
  id: z.string(),
  name: localeRecordSchema,
});

export type sportLeague = z.infer<typeof sportLeagueSchema>;

// API :

export const LogoQuerySchema = z.object({
  count: z.string().optional().default('48'),
  language: z.string().optional().default('en'),
  shuffle: z.string().optional().default('true').transform(v => v === 'true'),
});

export type LogoQuery = z.infer<typeof LogoQuerySchema>;
