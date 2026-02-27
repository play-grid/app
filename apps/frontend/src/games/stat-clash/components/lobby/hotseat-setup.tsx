import type { StatClashGameState } from '@guess-logo/stat-clash';
import type { PlayerListConfig } from '@guess-logo/ui/player-list';
import { PlayerList } from '@guess-logo/ui/player-list';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/input';

interface HotseatSetupProps {
  players: StatClashGameState['players'];
  hostId: string;
  roundsPerPlayer: number;
  onRoundsPerPlayerChange: (value: number) => void;
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

export function HotseatSetup({
  players,
  hostId,
  roundsPerPlayer,
  onRoundsPerPlayerChange,
  onAddPlayer,
  onRemovePlayer,
}: HotseatSetupProps) {
  const { t } = useTranslation();

  const config: PlayerListConfig = {
    showAnimations: false,
    showAvatar: false,
    showHostBadge: true,
    showRemoveButton: true,
    enableValidation: false,
    showAddForm: true,
  };

  const gameSpecificControls = (
    <div className="space-y-2">
      <label htmlFor="roundsPerPlayer" className="text-sm font-medium">{t('statClashGame.hotseatSetup.roundsPerPlayer')}</label>
      <Input
        id="roundsPerPlayer"
        type="number"
        min={1}
        max={20}
        value={roundsPerPlayer}
        onChange={e => onRoundsPerPlayerChange(Number(e.target.value || 1))}
      />
    </div>
  );

  return (
    <PlayerList
      players={players}
      hostId={hostId}
      onAddPlayer={onAddPlayer}
      onRemovePlayer={onRemovePlayer}
      config={config}
      translationNamespace="statClashGame"
      gameSpecificControls={gameSpecificControls}
    />
  );
}
