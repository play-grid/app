// import { UserButton } from '@daveyplate/better-auth-ui';
import { useQuery } from '@tanstack/react-query';
import { GameCard, SkeletonGameCard } from '@/components/game-card';
import SiteCustomizations from '@/components/site-about';

import { useGameNavigation } from '@/hooks/use-game-navigation';
import client from '@/lib/hono-client';

function HomePage() {
  const { currentLanguage } = useGameNavigation();
  const { data: games = [], isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await client.api.games.$get();
      if (!res.ok)
        throw new Error('Failed to fetch games');
      const data = await res.json();
      return data;
    },
  });

  const skeletonCards = Array.from({ length: 2 }, (_, i) => (
    <SkeletonGameCard key={i} />
  ));

  return (
    <div className="min-h-208 bg-background text-foreground flex flex-col items-center p-4">
      <div className="w-full flex justify-between items-center px-4">
        {/* <UserButton size="icon" className="size-10" /> */}
        <SiteCustomizations />
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
                  currentLanguage={currentLanguage}
                />
              ))
            )}
      </main>
    </div>
  );
}

export default HomePage;
