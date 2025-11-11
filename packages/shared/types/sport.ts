import { z } from 'zod';

/* ---------------------------------- */
/* 🗺️ Sport Regions Schema */
/* ---------------------------------- */

export const sportRegionIdSchema = z.enum([
  'africa',
  'asia',
  'europe',
  'north-america',
  'south-america',
  'oceania',
  'other',
] as const);

export type SportRegionId = z.infer<typeof sportRegionIdSchema>;

export const sportRegionSchema = z.object({
  id: sportRegionIdSchema,
  name: z.object({
    en: z.string(),
    ar: z.string(),
  }),
});

export const sportRegionsSchema = z.array(sportRegionSchema);

export const SPORT_REGIONS = sportRegionsSchema.parse([
  { id: 'africa', name: { en: 'Africa', ar: 'أفريقيا' } },
  { id: 'asia', name: { en: 'Asia', ar: 'آسيا' } },
  { id: 'europe', name: { en: 'Europe', ar: 'أوروبا' } },
  { id: 'north-america', name: { en: 'North America', ar: 'أمريكا الشمالية' } },
  { id: 'south-america', name: { en: 'South America', ar: 'أمريكا الجنوبية' } },
  { id: 'oceania', name: { en: 'Oceania', ar: 'أوقيانوسيا' } },
  { id: 'other', name: { en: 'Other', ar: 'أخرى' } },
]);

export const SPORT_REGION_IDS = SPORT_REGIONS.map(r => r.id) as readonly SportRegionId[];

/* ---------------------------------- */
/* 🧭 Type Guard */
/* ---------------------------------- */

export function isSportRegionId(value: string): value is SportRegionId {
  return sportRegionIdSchema.safeParse(value).success;
}

/* ---------------------------------- */
/* ⚙️ Internal Helpers */
/* ---------------------------------- */

export interface RawTeam {
  id: number;
  name: string;
  logo: string;
  leagueId: number;
}

export interface RawLeague {
  id: number | string;
  name: string;
  country: string;
  teams?: RawTeam[];
}
