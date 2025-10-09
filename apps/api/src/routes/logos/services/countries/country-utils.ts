import type { Country, SupportedLanguage } from '@guess-logo/shared/types';
import { regionOverrides } from '@guess-logo/shared/data';

// function cleanName(name: string): string {
//   return name
//     .replace(/ of .*/i, '') // remove "of …"
//     .replace(/,.*$/, '') // remove anything after comma
//     .replace(/ Minor Outlying Islands/i, '') // special cleanup
//     .replace(/ Republic$/i, '') // optional: remove trailing "Republic"
//     .trim();
// }

// function getCleanName(country: Country) {
//   if (country.altSpellings?.length) {
//     const readable = country.altSpellings
//       .map(cleanName)
//       .find(n => n.length > 2 && n.length <= 20);
//     if (readable)
//       return readable;
//   }
//   return cleanName(country.name);
// }

export function getLocalizedCountryData(
  country: Country,
  language: SupportedLanguage,
): Country {
  if (language === 'ar') {
    const translatedRegion = (regionOverrides.en_to_ar as Record<string, string>)[country.region];
    return {
      ...country,
      region: translatedRegion ?? country.region,
    };
  }
  return country;
}
