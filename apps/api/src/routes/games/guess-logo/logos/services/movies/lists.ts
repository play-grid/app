import type { LogoList } from '@guess-logo/shared/types';
import { fetchDramaMovies } from './drama-movies-service';
import { fetchFamilyMovies } from './family-movies-service';
import { fetchTopRatedMovies } from './top-rated-movies-service';

export const moviesLists: LogoList[] = [
  {
    id: 'top-imdb',
    name: {
      en: 'Top IMDB Movies',
      ar: 'أفضل أفلام IMDB',
    },
    fetchItems: language => fetchTopRatedMovies(language),
  },
  {
    id: 'family',
    name: {
      en: 'Family Movies',
      ar: 'أفلام عائلية',
    },
    fetchItems: language => fetchFamilyMovies(language),
  },
  // comment drama movies temporarily due to movies fetch is inappropriate
  {
    id: 'drama',
    name: {
      en: 'Drama Movies',
      ar: 'أفلام دراما',
    },
    fetchItems: language => fetchDramaMovies(language),
  },
];
