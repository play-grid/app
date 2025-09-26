import type { SupportedLanguage } from './i18n';

export interface LogoItem {
  id: number;
  name: string;
  imageUrl: string;
  eliminated: boolean;
}
export interface LogoList {
  id: string;
  name: string;
  fetchItems: (language: SupportedLanguage) => Promise<LogoItem[]>;
}

export type LogoSetKey = 'companies' | 'sports' | 'movies' | 'countries';
