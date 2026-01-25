import type { DisplayBanner } from './use-banners';
import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getBannerFeatureFlag } from './use-banners';

interface BannersCarouselProps {
  banners: DisplayBanner[];
}

const InternalBanner: React.FC<{ banner: DisplayBanner }> = ({ banner }) => {
  const content = (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {banner.imageUrl && (
        <img
          src={banner.imageUrl}
          alt={`${banner.title},${banner.description}`}
          className="w-full h-32 object-cover"
        />
      )}
    </div>
  );

  if (banner.linkUrl) {
    return (
      <a
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
};

export function BannersCarousel({ banners }: BannersCarouselProps) {
  const { showBanners } = getBannerFeatureFlag();
  if (!showBanners || !banners || banners.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {banners.map(banner => (
          <CarouselItem key={banner.id}>
            <InternalBanner banner={banner} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselDots />

      <CarouselNext />
    </Carousel>
  );
}
