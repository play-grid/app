import type { SupportedLanguage } from '@/utils/language-utils';
import { TMDB } from 'tmdb-ts';
import { env } from '@/env';
import { getBaseOptions } from './utils/get-base-options';

/**
 * Fetches the poster URL for a given movie name from TMDB.
 * It tries to search in Arabic first and falls back to English if no results are found.
 * @param movieName The name of the movie to search for.
 * @returns The full URL of the movie poster, or null if not found.
 */
export async function fetchMoviePoster(movieName: string, language: SupportedLanguage): Promise<string | null> {
  // Check for the TMDB API key and warn if it's missing.
  if (!env.VITE_TMDB_API_KEY) {
    console.warn('TMDB API key not configured');
    return null;
  }
  const tmdb = new TMDB(env.VITE_TMDB_API_KEY);

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
