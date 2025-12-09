import type { LogoContent } from '@guess-logo/guess-logo';
import { getEnv } from '@/lib/context-manager';

interface LogoOverrides {
  _v: string;
  sets: Record<string, Record<string, Record<string, string>>>;
}

export async function applyLogoOverrides<T extends LogoContent>(
  logos: T[],
  set: string,
  list: string,
  overrides: LogoOverrides,
): Promise<T[]> {
  return logos.map((logo) => {
    const overrideKey = logo.type === 'country' && 'originalName' in logo
      ? logo.originalName
      : logo.name;

    const overrideUrl = overrides.sets[set]?.[list]?.[overrideKey];

    if (overrideUrl) {
      return { ...logo, imageUrl: overrideUrl };
    }
    return logo;
  });
}

export async function getLogoOverrides(): Promise<LogoOverrides> {
  const env = getEnv();
  const cached = await env.LOGO_CACHE.get('logo-overrides');

  if (cached) {
    return JSON.parse(cached);
  }

  // Fallback to imported overrides
  const { logoOverrides } = await import('@guess-logo/shared/data');
  return logoOverrides as LogoOverrides;
}
