import client from '@/lib/hono-client';

export async function getCategoryById({
  id,
}: {
  id: string;
}) {
  const res = await client.api.games['five-seconds'].categories[':id'].$get({
    param: { id },
  });

  if (!res.ok)
    throw new Error('Failed to fetch category');
  return res.json();
}
