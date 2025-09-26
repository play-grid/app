import { useParams } from 'react-router-dom';

export type GameMode = 'online' | 'local' | 'invalid';

export interface GameModeResult {
  mode: GameMode;
  roomId?: string;
  logoSet?: string;
  gridSize?: string;
  playerA?: string;
  playerB?: string;
}

export function useGameModeDetection(): GameModeResult {
  const params = useParams<{ roomId?: string; logoSet?: string; gridSize?: string; playerA?: string; playerB?: string }>();

  if (params.roomId) {
    return {
      mode: 'online',
      roomId: params.roomId,
    };
  }

  if (params.logoSet && params.gridSize && params.playerA && params.playerB) {
    return {
      mode: 'local',
      ...params,
    };
  }

  return { mode: 'invalid' };
}
