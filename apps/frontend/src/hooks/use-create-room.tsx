import { useMutation } from '@tanstack/react-query';
import { createGameRoom } from '@/services/game-room-service';

export function useCreateRoom() {
  return useMutation({
    mutationFn: createGameRoom,
  });
}
