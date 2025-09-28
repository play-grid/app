import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createGameRoom } from '@/services/game-room-service';
import { useGameStore } from '@/stores/game-state-store';

export function useCreateRoom() {
  const navigate = useNavigate();
  const resetGame = useGameStore(state => state.resetGame);

  return useMutation({
    mutationFn: createGameRoom,
    onSuccess: (data) => {
      if (data?.id) {
        resetGame();
        navigate(`/game/room/${data.id}`);
      }
    },
  });
}
