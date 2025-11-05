export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  chunkSize: number,
): Promise<R[]> {
  let results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    // The index passed to processor should be the original index.
    const chunkPromises = chunk.map((item, chunkIndex) => processor(item, i + chunkIndex));
    const chunkResults = await Promise.all(chunkPromises);
    results = results.concat(chunkResults);
  }
  return results;
}
