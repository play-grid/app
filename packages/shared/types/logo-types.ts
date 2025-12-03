import type { z } from 'zod';
import type { logoListSchema, logoSetSchema, sportLeagueSchema, sportRegionSchema } from '../schemas/logo-schemas';
import type { Country } from './country';
import type { SupportedLanguage } from './i18n';

export interface LogoItem {
  id: number;
  name: string;
  originalName?: string;
  imageUrl: string;
  eliminated: boolean;
  countryData?: Country;
}

export type LocaleRecord = {
  [key in SupportedLanguage]: string;
};

// Base interface for list metadata (API response)
export type LogoListMetadata = z.infer<typeof logoListSchema>;

// Extended interface with fetchItems (internal use)
export interface LogoList extends LogoListMetadata {
  fetchItems: (language: SupportedLanguage, listId?: string) => Promise<LogoItem[]>;
}

// Sports-specific types
export type SportRegion = z.infer<typeof sportRegionSchema>;
export type SportLeague = z.infer<typeof sportLeagueSchema>;

// Union type for all possible list metadata
export type ListMetadata = LogoListMetadata | SportRegion | SportLeague;

export type LogoSetKey = z.infer<typeof logoSetSchema>;
