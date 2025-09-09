import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createGameRoom } from '@/services/game-room-service';

export function useCreateRoom() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createGameRoom,
    onSuccess: (data) => {
      if (data?.id) {
        navigate(`/room/${data.id}`);
      }
    },
  });
}
