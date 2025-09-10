import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { joinGameRoom } from '@/services/game-room-service';

export function useJoinRoom() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (variables: { roomId: string; playerName: string }) =>
      joinGameRoom(variables.roomId, { playerName: variables.playerName }),
    onSuccess: (data) => {
      if (data?.id) {
        navigate(`/room/${data.id}`);
      }
    },
  });
}
