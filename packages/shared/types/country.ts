/**
 * Information about a country.
 */
export interface Country {
  /**
   * Name of the country.
   */
  name: string;
  /**
   * Top level domain(s) of the country.
   */
  topLevelDomain: string[];
  /**
   * Alpha-2 code of the country.
   */
  alpha2Code: string;
  /**
   * Alpha-3 code of the country.
   */
  alpha3Code: string;
  /**
   * Calling code(s) of the country.
   */
  callingCodes: string[];
  /**
   * Capital city of the country.
   */
  capital: string;
  /**
   * Alternative spellings of the country name.
   */
  altSpellings: string[];
  /**
   * Subregion of the country.
   */
  subregion: string;
  /**
   * Region of the country.
   */
  region: string;
  /**
   * Population of the country.
   */
  population: number;
  /**
   * Latitude and longitude of the country.
   */
  latlng: number[];
  /**
   * Demonym for the country's people.
   */
  demonym: string;
  /**
   * Area of the country in square kilometers.
   */
  area: number;
  /**
   * Timezone(s) of the country.
   */
  timezones: string[];
  /**
   * Bordering countries.
   */
  borders: string[];
  /**
   * Native name of the country.
   */
  nativeName: string;
  /**
   * Numeric code of the country.
   */
  numericCode: string;
  /**
   * Flags of the country.
   */
  flags: {
    /**
     * SVG format flag URL.
     */
    svg: string;
    /**
     * PNG format flag URL.
     */
    png: string;
  };
  /**
   * Currencies used in the country.
   */
  currencies: {
    /**
     * Currency code.
     */
    code: string;
    /**
     * Currency name.
     */
    name: string;
    /**
     * Currency symbol.
     */
    symbol: string;
  }[];
  /**
   * Languages spoken in the country.
   */
  languages: {
    /**
     * ISO 639-1 language code.
     */
    iso639_1: string;
    /**
     * ISO 639-2 language code.
     */
    iso639_2: string;
    /**
     * Language name.
     */
    name: string;
    /**
     * Native name of the language.
     */
    nativeName: string;
  }[];
  /**
   * Translations of the country name.
   */
  translations: {
    [key: string]: string;
  };
  /**
   * URL of the country's flag.
   */
  flag: string;
  /**
   * Regional blocs the country is part of.
   */
  regionalBlocs: {
    /**
     * Acronym of the regional bloc.
     */
    acronym: string;
    /**
     * Name of the regional bloc.
     */
    name: string;
  }[];
  /**
   * Country code for the International Olympic Committee.
   */
  cioc: string;
  /**
   * Whether the country is independent.
   */
  independent: boolean;
}
