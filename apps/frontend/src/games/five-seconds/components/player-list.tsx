import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFiveSecondsStore } from '../store';

export function PlayerList() {
  const { t } = useTranslation();
  const players = useFiveSecondsStore(s => s.players);
  const addPlayer = useFiveSecondsStore(s => s.addPlayer);
  const removePlayer = useFiveSecondsStore(s => s.removePlayer);
  const updatePlayer = useFiveSecondsStore(s => s.updatePlayer);

  // This is a placeholder for adding players. In a real scenario,
  // this would be more sophisticated.
  const handleAddPlayer = () => {
    addPlayer({
      id: `player_${Date.now()}`,
      name: `Player ${players.length + 1}`,
      score: 0,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{t('players')}</h3>
        <Button onClick={handleAddPlayer} disabled={players.length >= 4}>
          {t('add-player')}
        </Button>
      </div>
      <div className="space-y-2">
        {players.map(player => (
          <div key={player.id} className="flex items-center gap-2">
            <Input
              value={player.name}
              onChange={e => updatePlayer(player.id, { name: e.target.value })}
              placeholder={t('player-name')}
            />
            <Button variant="ghost" size="icon" onClick={() => removePlayer(player.id)}>
              X
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
