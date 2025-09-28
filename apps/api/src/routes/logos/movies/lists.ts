import type { LogoList } from '@guess-logo/shared/types';
import { fetchTopRatedMovies } from './top-rated-movies-service';

export const moviesLists: LogoList[] = [
  {
    id: 'top-imdb',
    name: 'Top IMDB Movies',
    fetchItems: language => fetchTopRatedMovies(language),
  },
];
