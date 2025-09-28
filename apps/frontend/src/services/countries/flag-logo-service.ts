import countryCodeMap from '@/data/country-code.json';

export function generateFlagUrl(name: string): string {
  const code = (countryCodeMap as Record<string, string>)[name] || 'US';
  return `https://flagsapi.com/${code}/flat/64.png`;
}
