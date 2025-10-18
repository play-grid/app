import type { LogoSetKey } from '@guess-logo/shared/types';
import client from '@/lib/hono-client';

export async function fetchLogoLists(logoSet: LogoSetKey) {
  const res = await client.api.games['guess-logo'].logos[':set'].$get({ param: { set: logoSet } });

  if (!res.ok) {
    throw new Error('Failed to fetch logo lists');
  }

  return res.json();
}
