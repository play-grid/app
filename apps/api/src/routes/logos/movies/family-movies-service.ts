import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { TMDB } from 'tmdb-ts';
import env from '@/env';
import { getBaseOptions } from './utils/get-base-options';

export async function fetchFamilyMovies(
  language: SupportedLanguage,
): Promise<LogoItem[]> {
  const tmdb = new TMDB(env.TMDB_API_KEY);
  try {
    const options = getBaseOptions(language);
    const pagesToFetch = [1, 2, 3, 4]; // Fetch pages 1 to 4 to get 80 movies

    const pagePromises = pagesToFetch.map(page =>
      tmdb.discover.movie({ ...options, page, with_genres: '10751' }),
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
    console.error('Error fetching family movies:', error);
    return [];
  }
}
