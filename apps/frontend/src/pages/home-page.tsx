// import { UserButton } from '@daveyplate/better-auth-ui';
import { GameCard, SkeletonGameCard } from '@/components/game-card';
import SiteCustomizations from '@/components/site-about';
import { BannersCarousel } from '@/features/banners';

import { getBannerFeatureFlag, useBanners } from '@/features/banners/use-banners';
import { useGames } from '@/hooks/use-games';

function HomePage() {
  const { data: games = [], isLoading } = useGames();

  const { data: banners = [] } = useBanners();
  const { showBanners } = getBannerFeatureFlag();

  const skeletonCards = Array.from({ length: 2 }, (_, i) => (
    <SkeletonGameCard key={i} />
  ));

  return (
    <div className="min-h-208 bg-background text-foreground flex flex-col items-center p-4">
      <div className="w-full flex justify-between items-center px-4">
        {/* <UserButton size="icon" className="size-10" /> */}
        <SiteCustomizations />
      </div>

      {/* Banners Section */}
      <div className="w-full max-w-6xl mt-6">
        {showBanners && <BannersCarousel banners={banners} />}
      </div>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-5">
        {isLoading
          ? (
              skeletonCards
            )
          : (
              Array.isArray(games)
              && games.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                />
              ))
            )}
      </main>
    </div>
  );
}

export default HomePage;
