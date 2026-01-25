import type { InferResponseType } from 'hono/client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import client from '@/lib/hono-client';
import { getLocalizedField } from '@/utils/language-utils';
import { FEATURE_FLAGS } from '../../lib/constants';

type BannersResponse = InferResponseType<typeof client.api.banners.$get>;

export function useBanners() {
  const { currentLanguage } = useGameNavigation();

  const query = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await client.api.banners.$get();
      if (!res.ok)
        throw new Error('Failed to fetch banners');
      return res.json();
    },
  });

  const data = useMemo(() => {
    return (query.data || []).map((banner: BannersResponse[number]) => ({
      id: banner.id,
      title: getLocalizedField(banner, 'title' as any, currentLanguage),
      description: getLocalizedField(banner, 'description' as any, currentLanguage),
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
    }));
  }, [query.data, currentLanguage]);

  return {
    ...query,
    data,
  };
}

export type DisplayBanner = NonNullable<ReturnType<typeof useBanners>['data']>[number];

export function getBannerFeatureFlag() {
  return {
    showBanners: FEATURE_FLAGS.SHOW_BANNERS,
  };
}
