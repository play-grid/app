import type { GameMode } from './use-game-mode-detection';
import { useGameStore } from '@/stores/game-state-store';

interface GameActionConfig {
  mode: GameMode;
  sendAction?: (action: any) => void; // from useOnlineGame
}
// TODO : implement game logic actions like "ELIMINATED" logo 
export function useGameActions({ mode, sendAction }: GameActionConfig) {
  const {
    togglePlayerALogo,
    togglePlayerBLogo,
    switchTurn: switchTurnLocal,
  } = useGameStore();

  const toggleLogo = (playerId: 'A' | 'B', logoId: number) => {
    if (mode === 'online' && sendAction) {
      sendAction({ type: 'TOGGLE_LOGO', payload: { playerId, logoId } });
    }
    else if (mode === 'local') {
      if (playerId === 'A') {
        togglePlayerALogo(logoId);
      }
      else {
        togglePlayerBLogo(logoId);
      }
    }
  };

  const switchTurn = () => {
    if (mode === 'online' && sendAction) {
      sendAction({ type: 'SWITCH_TURN' });
    }
    else if (mode === 'local') {
      switchTurnLocal();
    }
  };

  return {
    toggleLogo,
    switchTurn,
  };
}
