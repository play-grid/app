import type { RawLeague } from '../../types';

// Lazy loader for custom lists
export async function loadCustomList(listId: string): Promise<RawLeague[]> {
  switch (listId) {
    case 'middle-east':
      return (await import('./custom-lists/middle-east.json')).default;
    default:
      throw new Error(`Custom list ${listId} not found`);
  }
}
