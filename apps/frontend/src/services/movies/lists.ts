import type { LogoList } from '@/types/logo-item';

import { fetchTopRatedMovies } from './top-rated-movies-service';

export const moviesLists: LogoList[] = [
  {
    id: 'top-imdb',
    name: 'Top IMDB Movies',
    fetchItems: language => fetchTopRatedMovies(language),
  },
];
