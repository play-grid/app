import type { Category, Difficulty } from '../types';
import { Play, Settings, Timer, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFiveSecondsStore } from '../stores/game-store';
import { CATEGORIES, DIFFICULTIES } from '../types';

export function FiveSecondsLobby() {
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState('');
  const players = useFiveSecondsStore(state => state.players);
  const settings = useFiveSecondsStore(state => state.settings);
  const addPlayer = useFiveSecondsStore(state => state.addPlayer);
  const removePlayer = useFiveSecondsStore(state => state.removePlayer);
  // const togglePlayerReady = useFiveSecondsStore(state => state.togglePlayerReady);
  const updateSettings = useFiveSecondsStore(state => state.updateSettings);
  const canStartGame = useFiveSecondsStore(state => state.canStartGame);
  const startGame = useFiveSecondsStore(state => state.startGame);

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      addPlayer({
        id: `player-${Date.now()}`,
        name: playerName.trim(),
        score: 0,
      });
      setPlayerName('');
    }
  };

  const toggleCategory = (category: Category) => {
    const newCategories = settings.categories.includes(category)
      ? settings.categories.filter((c: string) => c !== category)
      : [...settings.categories, category];

    if (newCategories.length > 0) {
      updateSettings({ categories: newCategories });
    }
  };

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
          <Card className="p-6 space-y-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">
                {t('fiveSecondsGame.lobby.playersTitle', { count: players.length, max: 4 })}
              </h2>
            </div>

            {/* Add Player */}
            <div className="flex gap-2">
              <Input
                placeholder={t('fiveSecondsGame.lobby.enterYourName')}
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                className="bg-background border-border"
              />
              <Button onClick={handleAddPlayer} disabled={players.length >= 4}>
                {t('fiveSecondsGame.lobby.join')}
              </Button>
            </div>

            {/* Player List */}
            <div className="space-y-3">
              {players.length === 0
                ? (
                    <p className="text-center text-muted-foreground py-8">{t('fiveSecondsGame.lobby.noPlayers')}</p>
                  )
                : (
                    players.map(player => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                            {player.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{player.name}</p>
                            {player.isHost && (
                              <Badge variant="secondary" className="text-xs">
                                {t('fiveSecondsGame.lobby.host')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/*
                          uncomment this if i make online mode multiplayer
                          {player.isReady
                            ? (
                              <Check className="w-5 h-5 text-accent" />
                              )
                              : (
                                <X className="w-5 h-5 text-muted-foreground" />
                                )}
                          <Button
                            size="sm"
                            variant={player.isReady ? 'secondary' : 'default'}
                            onClick={() => togglePlayerReady(player.id)}
                          >
                            {player.isReady ? t('fiveSecondsGame.lobby.notReady') : t('fiveSecondsGame.lobby.ready')}
                          </Button>
                           */}
                          <Button size="sm" variant="destructive" onClick={() => removePlayer(player.id)}>
                            {t('fiveSecondsGame.lobby.remove')}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
            </div>
          </Card>

          {/* Settings Section */}
          <Card className="p-6 space-y-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">{t('fiveSecondsGame.lobby.gameSettings')}</h2>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-muted-foreground">{t('fiveSecondsGame.lobby.categories')}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <Button
                    key={category}
                    variant={settings.categories.includes(category) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className="rounded-full"
                  >
                    {t(category)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-muted-foreground">{t('fiveSecondsGame.lobby.difficulty')}</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(difficulty => (
                  <Button
                    key={difficulty}
                    variant={settings.difficulty === difficulty ? 'default' : 'outline'}
                    onClick={() => updateSettings({ difficulty: difficulty as Difficulty })}
                    className="flex-1"
                  >
                    {t(difficulty.toLowerCase())}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Per Turn */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-muted-foreground">{t('fiveSecondsGame.lobby.timePerTurn')}</label>
              <div className="flex items-center gap-4">
                <Timer className="w-5 h-5 text-accent" />
                <div className="flex gap-2 flex-1">
                  {[5, 10, 15].map(time => (
                    <Button
                      key={time}
                      variant={settings.timePerTurn === time ? 'default' : 'outline'}
                      onClick={() => updateSettings({ timePerTurn: time })}
                      className="flex-1"
                    >
                      {t('fiveSecondsGame.lobby.timeUnit', { time })}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

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
