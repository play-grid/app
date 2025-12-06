import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import { TMDB } from 'tmdb-ts';
import { getEnv } from '@/lib/context-manager';
import { logger } from '@/utils/logger';
import { fetchPaginatedMovies } from './utils/fetch-paginated-movies';
import { getBaseOptions } from './utils/get-base-options';

export async function fetchDramaMovies(
  language: SupportedLanguage,
): Promise<LogoItem[]> {
  const env = getEnv();
  const tmdb = new TMDB(env.TMDB_API_KEY);
  try {
    const options = getBaseOptions(language);
    const allMovies = await fetchPaginatedMovies(page =>
      tmdb.discover.movie({ ...options, page, with_genres: '18' }),
    );

    return allMovies.map(m => ({
      id: m.id,
      name: m.title,
      imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
      eliminated: false,
    }));
  }
  catch (error) {
    logger.error(error, 'Error fetching drama movies:');
    return [];
  }
}
