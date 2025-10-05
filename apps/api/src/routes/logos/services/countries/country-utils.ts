import type { Country } from '@guess-logo/shared/types';
import { containsArabic } from '@guess-logo/shared/utils';

function cleanName(name: string): string {
  return name
    .replace(/ of .*/i, '') // remove "of …"
    .replace(/,.*$/, '') // remove anything after comma
    .replace(/ Minor Outlying Islands/i, '') // special cleanup
    .replace(/ Republic$/i, '') // optional: remove trailing "Republic"
    .trim();
}

function getCleanName(country: Country) {
  if (country.altSpellings?.length) {
    const readable = country.altSpellings
      .map(cleanName)
      .find(n => n.length > 2 && n.length <= 20);
    if (readable)
      return readable;
  }
  return cleanName(country.name);
}
export function getLocalizedCountryName(country: Country, language: 'en' | 'ar') {
  if (language === 'ar') {
    return country.nativeName && containsArabic(country.nativeName)
      ? country.nativeName
      : getCleanName(country);
  }
  return getCleanName(country);
}
