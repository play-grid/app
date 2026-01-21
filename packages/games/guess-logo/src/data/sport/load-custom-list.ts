import type { RawLeague } from '@guess-logo/shared/types';

// Lazy loader for custom lists
export async function loadCustomList(listId: string): Promise<RawLeague[]> {
  switch (listId) {
    case 'middle-east':
      return (await import('./custom-lists/middle-east.json')).default;
    case 'top-teams':
      return (await import('./custom-lists/top-teams-list.json')).default;
    default:
      throw new Error(`Custom list ${listId} not found`);
  }
}
