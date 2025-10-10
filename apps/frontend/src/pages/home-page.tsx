import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Define available games with metadata for extensibility
const games = [
  {
    id: 'guess-logo',
    nameKey: 'games.guessLogo.title',
    descriptionKey: 'games.guessLogo.description',
    path: 'guess-logo',
  },
];

function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">{t('home.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('home.subtitle')}</p>
      </header>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
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
                <Button variant="default" className="w-full">
                  {t('home.playNow')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </main>
      <footer className="mt-8 text-center text-muted-foreground">
        <p>{t('home.footer')}</p>
      </footer>
    </div>
  );
}

export default HomePage;
