import type { LogoList } from '@guess-logo/shared/types';
import { fetchDramaMovies } from './drama-movies-service';
import { fetchFamilyMovies } from './family-movies-service';
import { fetchTopRatedMovies } from './top-rated-movies-service';

export const moviesLists: LogoList[] = [
  {
    id: 'top-imdb',
    name: 'Top IMDB Movies',
    fetchItems: language => fetchTopRatedMovies(language),
  },
  {
    id: 'family',
    name: 'Family Movies',
    fetchItems: language => fetchFamilyMovies(language),
  },
  {
    id: 'drama',
    name: 'Drama Movies',
    fetchItems: language => fetchDramaMovies(language),
  },
];
