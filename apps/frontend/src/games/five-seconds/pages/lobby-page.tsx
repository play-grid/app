import type { Room } from '@guess-logo/shared/schemas';
import {
  FIVE_SECONDS_GAME_OPTIONS,
  useFiveSecondsActions,
  useFiveSecondsState,
} from '@guess-logo/five-seconds';
import { Info, Play, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CreateOrJoinRoomDialog } from '@/features/room/create-or-join-room-dialog';
import { GameInstructions } from '../components/game-instructions';
import { GameSettings } from '../components/game-settings';
import { PlayerList } from '../components/player-list';
import { useUrlSyncedSettingsOnly } from '../hooks/use-url-synced-settings';

const FIRST_VISIT_KEY = 'FIVE_SECONDS_FIRST_VISIT';

export function FiveSecondsLobby() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { players, settings } = useFiveSecondsState();
  const { startGame } = useFiveSecondsActions();
  useUrlSyncedSettingsOnly();

  const [isInstructionsOpen, setIsInstructionsOpen] = useState(() => {
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasVisited) {
      localStorage.setItem(FIRST_VISIT_KEY, 'true');
      return true;
    }
    return false;
  });

  const canStartGame = () => {
    const playerCount = Object.keys(players).length;
    return (
      playerCount >= FIVE_SECONDS_GAME_OPTIONS.minPlayers
      && playerCount <= FIVE_SECONDS_GAME_OPTIONS.maxPlayers
    );
  };

  const handleRoomCreated = (room: Room) => {
    navigate(`/${i18n.language}/five-seconds?mode=multiplayer&room=${room.id}&host=true`, { replace: true });
  };

  const handleRoomJoined = (room: Room) => {
    navigate(`/${i18n.language}/five-seconds?mode=multiplayer&room=${room.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        {/* Back Button */}
        <BackButton />

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance">
            {t('fiveSecondsGame.lobby.title')}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {t('fiveSecondsGame.lobby.subtitle')}
          </p>

          {/* How to Play Button */}
          <Dialog open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2">
                <Info className="w-5 h-5" />
                {t('fiveSecondsGame.howToPlay')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <GameInstructions />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Players Section */}
          <PlayerList />

          {/* Settings Section */}
          <Card className="p-6 space-y-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">
                {t('fiveSecondsGame.lobby.gameSettings')}
              </h2>
            </div>

            <GameSettings />

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Start Game Button (Local) */}
              <Button
                size="lg"
                className="w-full text-lg font-semibold"
                onClick={startGame}
                disabled={!canStartGame()}
              >
                <Play className="w-5 h-5 mr-2" />
                {t('fiveSecondsGame.lobby.startGame')}
              </Button>

              {/* Create or Join Room Button (Online) */}
              <CreateOrJoinRoomDialog
                gameType="five-seconds"
                gameSettings={settings}
                onRoomCreated={handleRoomCreated}
                onRoomJoined={handleRoomJoined}
              />
            </div>

            {!canStartGame() && Object.keys(players).length > 0 && (
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
