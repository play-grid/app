import type { SupportedLanguage } from '@guess-logo/shared/types';
import client from '@/lib/hono-client';

export async function getCategoryById({
  id,
  language,
}: {
  id: string;
  language: SupportedLanguage;
}) {
  const res = await client.api.games['five-seconds'].categories[':id'].$get({
    param: { id },
    query: { language },
  });

  if (!res.ok)
    throw new Error('Failed to fetch category');
  return res.json();
}
