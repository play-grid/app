import type { ListMetadata, LogoSetKey } from '@guess-logo/guess-logo';

const METADATA: Record<LogoSetKey, ListMetadata[]> = {
  companies: [
    {
      id: 'companies',
      name: {
        en: 'Companies',
        ar: 'شركات',
      },
      logosCount: 0,
    },
    {
      id: 'saudi',
      name: {
        en: 'Saudi Companies',
        ar: 'شركات سعودية',
      },
      logosCount: 0,
    },
  ],
  countries: [
    {
      id: 'countries',
      name: {
        en: 'Countries',
        ar: 'دول',
      },
      logosCount: 0,
    },
    {
      id: 'top-population',
      name: {
        en: 'Highest population density countries',
        ar: 'أعلى دول كثافة سكانية',
      },
      logosCount: 0,
    },
  ],
  movies: [
    {
      id: 'top-imdb',
      name: {
        en: 'Top IMDB Movies',
        ar: 'أفضل أفلام IMDB',
      },
      logosCount: 0,
    },
    {
      id: 'family',
      name: {
        en: 'Family Movies',
        ar: 'أفلام عائلية',
      },
      logosCount: 0,
    },
    {
      id: 'drama',
      name: {
        en: 'Drama Movies',
        ar: 'أفلام دراما',
      },
      logosCount: 0,
    },
  ],
  sports: [],
};

export function getLogoListsMetadata(set: LogoSetKey): ListMetadata[] {
  return METADATA[set] ?? [];
}
