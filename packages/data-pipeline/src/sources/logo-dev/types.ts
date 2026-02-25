export interface LogoDevSearchResult {
  name: string;
  domain: string;
  logo_url?: string;
}

export interface LogoDevConfig {
  baseUrl?: string;
  apiKey?: string;
}

export interface LogoDevCompany {
  en: string;
  ar: string;
  listId?: 'companies' | 'saudi';
}
