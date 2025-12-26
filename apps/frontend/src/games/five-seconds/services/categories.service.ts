import client from '@/lib/hono-client';

export async function getCategoriesList() {
  const res = await client.api.games['five-seconds'].categories.$get();

  if (!res.ok)
    throw new Error('Failed to fetch categories list');
  return res.json();
}
