import type { Room } from '@guess-logo/shared/schemas';
import { useMutation } from '@tanstack/react-query';
import { createGameRoom, joinGameRoom } from './room-service';

interface UseCreateRoomProps {
  onSuccess?: (data: Room) => void;
}

export function useCreateRoom({ onSuccess }: UseCreateRoomProps = {}) {
  return useMutation({
    mutationFn: createGameRoom,
    onSuccess,
  });
}

interface UseJoinRoomProps {
  onSuccess?: (data: Room) => void;
}

export function useJoinRoom({ onSuccess }: UseJoinRoomProps = {}) {
  return useMutation({
    mutationFn: (variables: { roomId: string; playerName: string }) =>
      joinGameRoom(variables.roomId, { playerName: variables.playerName }),
    onSuccess,
  });
}
