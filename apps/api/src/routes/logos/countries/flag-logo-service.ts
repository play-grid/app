import { countryCode } from '@guess-logo/shared/data';

export function generateFlagUrl(name: string): string {
  const code = (countryCode as Record<string, string>)[name] || 'US';
  return `https://flagsapi.com/${code}/flat/64.png`;
}
