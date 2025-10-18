import type { LanguageQuery } from '@guess-logo/shared/types';
import client from '@/lib/hono-client';

export async function getCategoriesList({ language }: LanguageQuery) {
  const res = await client.api.games['five-seconds'].categories.$get({
    query: { language },
  });

  if (!res.ok)
    throw new Error('Failed to fetch categories list');
  return res.json();
}
