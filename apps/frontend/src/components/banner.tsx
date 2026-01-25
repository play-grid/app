import type { DisplayBanner } from '@/hooks/use-banners';

interface BannerProps {
  banner: DisplayBanner;
}
// TEMP
export function Banner({ banner }: BannerProps) {
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
}
