import type { SupportedLanguage } from '@guess-logo/shared/types';
import { TMDB } from 'tmdb-ts';
import { getEnv } from '@/lib/context-manager';
import { getBaseOptions } from './utils/get-base-options';

export async function fetchMoviePoster(
  movieName: string,
  language: SupportedLanguage,
): Promise<string | null> {
  const env = getEnv();
  const tmdb = new TMDB(env.TMDB_API_KEY);
  try {
    // Attempt to search for the movie in Arabic.
    const options = getBaseOptions(language);

    const searchResult = await tmdb.search.movies({ query: movieName, ...options });

    // Check if a poster path exists in the results.
    const posterPath = searchResult.results?.[0]?.poster_path;

    // If a poster path is found, construct the full URL and return it.
    // The base URL and size are hardcoded here to match the original function's behavior.

    if (posterPath) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }

    // If no poster path was found after both searches, return null.
    return null;
  }
  catch (error) {
    // Handle any errors that occur during the API calls.
    console.error('Error fetching movie poster:', error);
    return null;
  }
}
