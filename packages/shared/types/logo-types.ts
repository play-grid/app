import type { z } from 'zod';
import type { logoSetSchema } from '../schemas/logo-schemas';
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

export interface LogoList {
  id: string;
  name: LocaleRecord;
  fetchItems: (language: SupportedLanguage, listId?: string) => Promise<LogoItem[]>;
}

export type LogoSetKey = z.infer<typeof logoSetSchema>;
