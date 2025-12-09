import type { MoviePosterLogo } from '@guess-logo/guess-logo';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { LOGO_SET_TYPE_MAP } from '@guess-logo/guess-logo';
import { TMDB } from 'tmdb-ts';
import { getEnv } from '@/lib/context-manager';
import { logger } from '@/utils/logger';
import { fetchPaginatedMovies } from './utils/fetch-paginated-movies';
import { getBaseOptions } from './utils/get-base-options';

export async function fetchTopRatedMovies(
  language: SupportedLanguage,
): Promise<MoviePosterLogo[]> {
  const env = getEnv();
  const tmdb = new TMDB(env.TMDB_API_KEY);
  try {
    const options = getBaseOptions(language);
    const allMovies = await fetchPaginatedMovies(page =>
      tmdb.movies.topRated({ ...options, page }),
    );

    return allMovies
      .map(
        (m): MoviePosterLogo => ({
          id: m.id,
          name: m.title,
          imageUrl: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : '',
          type: LOGO_SET_TYPE_MAP.movies,
          year: m.release_date
            ? Number.parseInt(m.release_date.split('-')[0], 10)
            : undefined,
          genre: undefined,
        }),
      )
      .filter((logo): logo is MoviePosterLogo => !!logo.imageUrl);
  }
  catch (error) {
    logger.error(error, 'Error fetching top rated movies:');
    return []; // ✅ empty array instead of null
  }
}
