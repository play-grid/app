import { UserButton } from '@daveyplate/better-auth-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SiteCustomizations from '@/components/site-about';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const games = [
  {
    id: 'guess-logo',
    nameKey: 'games.guessLogo.title',
    descriptionKey: 'games.guessLogo.description',
    path: 'guess-logo',
  },
  {
    id: 'five-seconds',
    nameKey: 'games.fiveSeconds.title',
    descriptionKey: 'games.fiveSeconds.description',
    path: 'five-seconds',
  },
];

function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-208 bg-background text-foreground flex flex-col items-center p-4">
      <div className="w-full flex justify-between items-center px-4">
        <UserButton size="icon" className="size-10" />
        <SiteCustomizations />
      </div>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-5">
        {games.map(game => (
          <Card
            key={game.id}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader>
              <CardTitle>{t(game.nameKey)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t(game.descriptionKey)}
              </p>
              <Link to={`/${game.path}`}>
                <Button variant="default" data-testid="card-game-play" className="w-full">
                  {t('home.playNow')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}

export default HomePage;
