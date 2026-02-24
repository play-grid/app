export interface APICountriesConfig {
  baseUrl?: string;
}

export interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [languageCode: string]: {
        official: string;
        common: string;
      };
    };
  };
  tld?: string[];
  cca2: string;
  ccn3?: string;
  cca3: string;
  cioc?: string;
  independent?: boolean;
  status?: string;
  unMember?: boolean;
  currencies?: {
    [code: string]: {
      name: string;
      symbol: string;
    };
  };
  idd?: {
    root?: string;
    suffixes?: string[];
  };
  capital?: string[];
  altSpellings?: string[];
  region?: string;
  subregion?: string;
  languages?: {
    [code: string]: string;
  };
  translations?: {
    [languageCode: string]: {
      official: string;
      common: string;
    };
  };
  latlng?: number[];
  landlocked?: boolean;
  borders?: string[];
  area?: number;
  population?: number;
  demonyms?: {
    eng: { f: string; m: string };
    fra?: { f: string; m: string };
  };
  flags?: {
    png: string;
    svg: string;
    alt?: string;
  };
  coatOfArms?: {
    png?: string;
    svg?: string;
  };
  capitalInfo?: {
    latlng?: number[];
  };
  postalCode?: {
    format?: string;
    regex?: string;
  };
}

export class APICountriesClient {
  private baseUrl: string;

  constructor(config: APICountriesConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://restcountries.com/v3.1';
  }

  private async fetchFromApi<T>(path: string): Promise<T> {
    const encodedPath = path
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');

    const response = await fetch(`${this.baseUrl}${encodedPath}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getAllCountries(): Promise<Country[]> {
    return this.fetchFromApi<Country[]>('/all');
  }

  async getCountryByName(name: string): Promise<Country[]> {
    return this.fetchFromApi<Country[]>(`/name/${name}`);
  }

  async getCountriesByRegion(region: string): Promise<Country[]> {
    return this.fetchFromApi<Country[]>(`/region/${region}`);
  }

  async getCountriesBySubregion(subregion: string): Promise<Country[]> {
    return this.fetchFromApi<Country[]>(`/subregion/${subregion}`);
  }

  async getCountriesByLanguage(language: string): Promise<Country[]> {
    return this.fetchFromApi<Country[]>(`/lang/${language}`);
  }

  async getCountryByCapital(capital: string): Promise<Country[]> {
    return this.fetchFromApi<Country[]>(`/capital/${capital}`);
  }

  async getCountryByAlphaCode(code: string): Promise<Country[]> {
    return this.fetchFromApi<Country[]>(`/alpha/${code}`);
  }
}
