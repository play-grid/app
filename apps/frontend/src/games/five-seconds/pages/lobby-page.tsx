import { Play, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameSettings } from '../components/game-settings';
import { PlayerList } from '../components/player-list';
import { useFiveSecondsStore } from '../stores/game-store';

export function FiveSecondsLobby() {
  const { t } = useTranslation();
  const players = useFiveSecondsStore(state => state.players);
  const canStartGame = useFiveSecondsStore(state => state.canStartGame);
  const startGame = useFiveSecondsStore(state => state.startGame);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <BackButton />
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-8xl font-bold text-balance">{t('fiveSecondsGame.lobby.title')}</h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-pretty">
            {t('fiveSecondsGame.lobby.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Players Section */}
          <PlayerList />

          {/* Settings Section */}
          <Card className="p-6 space-y-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">{t('fiveSecondsGame.lobby.gameSettings')}</h2>
            </div>

            <GameSettings />

            {/* Start Game Button */}
            <Button size="lg" className="w-full text-lg" onClick={startGame} disabled={!canStartGame()}>
              <Play className="w-5 h-5 mr-2" />
              {t('fiveSecondsGame.lobby.startGame')}
            </Button>

            {!canStartGame() && players.length > 0 && (
              <p className="text-sm text-center text-muted-foreground">
                {t('fiveSecondsGame.lobby.startRequirement')}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
