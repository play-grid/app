import type { LogoItem, LogoSetKey, SupportedLanguage } from '@guess-logo/shared/types';
import client from '@/lib/hono-client';

export async function fetchLogos(
  logoSet: LogoSetKey,
  listId: string,
  language: SupportedLanguage,
  count: number,
  shuffle = false,
) {
  const query: any = {
    language,
    count: count.toString(),
    shuffle: shuffle ? 'true' : 'false',
  };

  if (shuffle) {
    query._cb = new Date().getTime().toString(); // Cache buster
  }

  const res = await client.api.games['guess-logo'].logos[':set'][':list'].$get({
    param: {
      set: logoSet,
      list: listId,
    },
    query,
  });

  if (!res.ok) {
    throw new Error('Failed to fetch logos');
  }

  return (await res.json()) as LogoItem[];
}
