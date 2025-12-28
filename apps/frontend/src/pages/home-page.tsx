import { UserButton } from '@daveyplate/better-auth-ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SiteCustomizations from '@/components/site-about';
import { Button } from '@/components/ui/button';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import client from '@/lib/hono-client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function HomePage() {
  const { t } = useTranslation();
  const { currentLanguage } = useGameNavigation();
  const { data: games = [] } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await client.api.games.$get();
      if (!res.ok)
        throw new Error('Failed to fetch games');
      const data = await res.json();
      return data;
    },
  });

  return (
    <div className="min-h-208 bg-background text-foreground flex flex-col items-center p-4">
      <div className="w-full flex justify-between items-center px-4">
        <UserButton size="icon" className="size-10" />
        <SiteCustomizations />
      </div>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-5">
        {Array.isArray(games) && games.map((game) => {
          const localizedName = game.name[currentLanguage] || game.name.en;
          const localizedDescription = game.description ? (game.description[currentLanguage] || game.description.en) : undefined;

          return (
            <Card
              key={game.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <CardTitle>{localizedName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {localizedDescription}
                </p>
                <Link to={`/${game.id}`}>
                  <Button variant="default" data-testid="card-game-play" className="w-full">
                    {t('home.playNow')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}

export default HomePage;
