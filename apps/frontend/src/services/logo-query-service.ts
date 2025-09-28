import type { LogoSetKey, SupportedLanguage } from '@guess-logo/shared/types';
import client from '@/lib/hono-client';

export async function fetchLogos(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
) {
  const res = await client.api.logos[':set'][':list'].$get({
    param: {
      set: logoSet,
      list: listId,
    },
    query: {
      language,
      count: count.toString(),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch logos');
  }

  return res.json();
}
