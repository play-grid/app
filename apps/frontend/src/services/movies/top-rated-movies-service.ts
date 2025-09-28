import type { LogoItem } from '@/types';
import type { SupportedLanguage } from '@/utils/language-utils';
import { TMDB } from 'tmdb-ts';
import { env } from '@/env';
import { getBaseOptions } from './utils/get-base-options';

/**
 * Fetches Top rated Movies from TMDB.
 * @returns An array of top rated movies.
 */
export async function fetchTopRatedMovies(language: SupportedLanguage): Promise<LogoItem[]> {
  const tmdb = new TMDB(env.VITE_TMDB_API_KEY);
  try {
    const options = getBaseOptions(language);
    const pagesToFetch = [1, 2, 3, 4]; // Fetch pages 1 to 4 to get 80 movies

    const pagePromises = pagesToFetch.map(page =>
      tmdb.movies.topRated({ ...options, page }),
    );

    const pages = await Promise.all(pagePromises);
    const allMovies = pages.flatMap(page => page.results);

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
