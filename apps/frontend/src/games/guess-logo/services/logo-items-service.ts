import type { LogoSetKey, SupportedLanguage } from '@guess-logo/shared/types';
import client from '@/lib/hono-client';

export async function fetchLogoItems(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count = 80,
) {
  const res = await client.api.logos[':set'][':list'].$get({
    param: {
      set: logoSet,
      list: listId,
    },
    query: {
      count: count.toString(),
      language,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch logo items');
  }

  return res.json();
}
