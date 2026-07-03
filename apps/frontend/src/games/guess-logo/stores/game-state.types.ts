export interface LogoCountryData {
  name: string;
  region: string;
  currency: string;
}

export interface LogoItem {
  id: string | number;
  name: string;
  originalName?: string;
  imageUrl: string;
  eliminated: boolean;
  countryData?: LogoCountryData;
  type?: string;
}

export interface Player {
  id: string;
  name: string;
  logos: LogoItem[];
  winner: LogoItem | null;
  activeCount: number;
}
