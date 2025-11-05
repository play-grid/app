import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { TMDB } from 'tmdb-ts';
import { getEnv } from '@/lib/context-manager';
import { fetchPaginatedMovies } from './utils/fetch-paginated-movies';
import { getBaseOptions } from './utils/get-base-options';

export async function fetchTopRatedMovies(
  language: SupportedLanguage,
): Promise<LogoItem[]> {
  const env = getEnv();
  const tmdb = new TMDB(env.TMDB_API_KEY);
  try {
    const options = getBaseOptions(language);
    const allMovies = await fetchPaginatedMovies(page =>
      tmdb.movies.topRated({ ...options, page }),
    );

    return allMovies.map(m => ({
      id: m.id,
      name: m.title,
      imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
      eliminated: false,
    }));
  }
  catch (error) {
    console.error('Error fetching top rated movies:', error);
    return []; // ✅ empty array instead of null
  }
}
