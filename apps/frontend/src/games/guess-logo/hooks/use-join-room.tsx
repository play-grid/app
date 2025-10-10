import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { joinGameRoom } from '../services/game-room-service';
import { useGameStore } from '../stores/game-state-store';

export function useJoinRoom() {
  const navigate = useNavigate();
  const resetGame = useGameStore(state => state.resetGame);

  return useMutation({
    mutationFn: (variables: { roomId: string; playerName: string }) =>
      joinGameRoom(variables.roomId, { playerName: variables.playerName }),
    onSuccess: (data) => {
      if (data?.id) {
        resetGame();
        navigate(`/game/room/${data.id}`);
      }
    },
  });
}
