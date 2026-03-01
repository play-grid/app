import type { LogoContent } from '@playgrid/guess-logo';
import { getEnv } from '@/lib/context-manager';

export interface LogoOverrideSets {
  [logoSet: string]: {
    [listId: string]: {
      [logoName: string]: string;
    };
  };
}

export interface LogoOverrides {
  _v: string;
  sets: LogoOverrideSets;
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
  const { logoOverrides } = await import('@playgrid/guess-logo');
  return logoOverrides as LogoOverrides;
}
