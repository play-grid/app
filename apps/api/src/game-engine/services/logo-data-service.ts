import type { LogoItem, LogoSetKey, LogoItem as SharedLogoItem } from '@guess-logo/shared/types';
import { fetchLogoLists } from '../../routes/logos/services/logo-lists-service';

/**
 * Fetches and prepares logos for a game session.
 * This function replicates the logic from the getLogosBySetAndList HTTP handler
 * but is designed for backend service-to-service use. It also formats the
 * data to match the game engine's expected `LogoItem` structure.
 *
 * @param set The logo set to fetch from (e.g., 'companies').
 * @param listId The specific list within the set.
 * @param count The number of logos to fetch.
 * @param language The language for the logo names.
 * @returns A promise that resolves to an array of logos ready for the game.
 */
export async function fetchLogosForGame(
  set: LogoSetKey,
  listId: string,
  count: number,
  language = 'en',
): Promise<LogoItem[]> {
  try {
    // 1. Get all available lists for the specified set.
    const logoLists = await fetchLogoLists(set);

    // 2. Find the specific list by its ID.
    const targetList = logoLists.find(list => list.id === listId);
    if (!targetList) {
      throw new Error(`List ${listId} not found for set ${set} "`);
    }

    // 3. Fetch the raw logo items from the target list.
    const logoItems: SharedLogoItem[] = await targetList.fetchItems(language as any);

    // 4. Slice the array to get the desired count and map to the game format.
    const selectedItems = logoItems.slice(0, count).map((logo, index) => ({
      id: index, // The game engine uses the index as a simple ID.
      name: logo.name,
      imageUrl: logo.imageUrl,
      eliminated: false, // Initialize all logos as not eliminated.
    }));

    return selectedItems;
  }
  catch (error) {
    console.error(`Error fetching logos for game from list ${listId} in set ${set}:`, error);
    // Re-throw the error to be handled by the caller (the Durable Object).
    throw error;
  }
}
