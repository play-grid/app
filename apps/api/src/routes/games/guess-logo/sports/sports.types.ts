import type { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { leagues, sportRegions, teams } from './sports.tables';

/* ---------------------------------- */
/* 🌍 Zod Schemas for API Data */
/* ---------------------------------- */

export const SportRegionSchema = createSelectSchema(sportRegions);
export type SportRegion = z.infer<typeof SportRegionSchema>;

export const LeagueSchema = createSelectSchema(leagues);
export type League = z.infer<typeof LeagueSchema>;

export const TeamSchema = createSelectSchema(teams);
export type Team = z.infer<typeof TeamSchema>;
