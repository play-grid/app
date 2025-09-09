import { env } from '@/env';

export function generateMoviePosterUrl(name: string): string {
  const query = encodeURIComponent(name);
  return `https://api.themoviedb.org/3/search/movie?include_adult=false&language=ar&page=1&query=${query}`;
}

export async function fetchMoviePoster(movieName: string): Promise<string | null> {
  if (!env.VITE_TMDB_API_KEY) {
    console.warn('TMDB API key not configured');
    return null;
  }

  try {
    // Try Arabic first
    let response = await fetch(generateMoviePosterUrl(movieName), {
      headers: {
        Authorization: `Bearer ${env.VITE_TMDB_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    let data = await response.json();

    // If no results in Arabic, try English
    if (!data.results || data.results.length === 0) {
      response = await fetch(
        `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en&page=1&query=${encodeURIComponent(movieName)}`,
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      data = await response.json();
    }

    // Return the poster URL if available
    if (data.results && data.results.length > 0 && data.results[0].poster_path) {
      return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
    }

    return null;
  }
  catch (error) {
    console.error('Error fetching movie poster:', error);
    return null;
  }
}
