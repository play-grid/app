import type { LocaleRecord, SupportedLanguage } from '@guess-logo/shared/types';
import z from 'zod';

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

const SportsLogoSchema = BaseLogoSchema.extend({
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


/**
 * @internal
 */
export interface LogoList {
  id: string;
  name: LocaleRecord;
  fetchItems: (
    language: SupportedLanguage,
    listId?: string,
  ) => Promise<LogoContent[]>;
  teamsCount?: number;
}
