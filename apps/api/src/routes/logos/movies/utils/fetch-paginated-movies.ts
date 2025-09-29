interface PaginatedResponse<T> {
  results: T[];
}

type PaginatedApiCall<T> = (page: number) => Promise<PaginatedResponse<T>>;

export async function fetchPaginatedMovies<T>(apiCall: PaginatedApiCall<T>): Promise<T[]> {
  const pagesToFetch = [1, 2, 3, 4]; // Fetch pages 1 to 4 to get 80 movies

  const pagePromises = pagesToFetch.map(page => apiCall(page));

  const pages = await Promise.all(pagePromises);
  const allItems = pages.flatMap(page => page.results);

  return allItems;
}
