import type { Country } from '@guess-logo/shared/types';

export function generateFlagUrl(country: Country): string {
  return country.flags.png; // Using png for consistency, can be svg if preferred
}
