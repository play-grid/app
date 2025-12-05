import type { Room } from '@guess-logo/shared/schemas';
import type { CreateRoomPayload } from './room-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/auth-hooks';
import { createGameRoom, getRoomById, joinGameRoom } from './room-service';

interface UseCreateRoomProps {
  onSuccess?: (data: Room) => void;
}

export function useCreateRoom({ onSuccess }: UseCreateRoomProps = {}) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user } = useSession();

  return useMutation({
    mutationFn: async (payload: CreateRoomPayload): Promise<Room> => {
      const response = await createGameRoom(payload);

      const hostPlayer = {
        id: user?.id ?? `host-${response.id}`,
        name: user?.name ?? 'Host',
      };

      if (response.id) {
        const storageKey = `player-${response.id}`;
        localStorage.setItem(storageKey, JSON.stringify(hostPlayer));
      }

      return response as Room;
    },
    onSuccess: (data: Room) => {
      onSuccess?.(data);
      const gameType = data.gameType;
      const lang = i18n.language;
      navigate(`/${lang}/${gameType}?mode=multiplayer&room=${data.id}&host=true`);
    },
  });
}

interface UseJoinRoomProps {
  onSuccess?: (data: Room) => void;
}

export function useJoinRoom({ onSuccess }: UseJoinRoomProps = {}) {
  return useMutation({
    mutationFn: async (variables: { roomId: string; playerName: string }): Promise<Room> => {
      const response = await joinGameRoom(variables.roomId, {
        playerName: variables.playerName,
      });

      if (response.player && variables.roomId) {
        const storageKey = `player-${variables.roomId}`;
        localStorage.setItem(storageKey, JSON.stringify(response.player));
      }

      return response as Room;
    },
    onSuccess,
  });
}

interface UseRoomStatsOptions {
  mode: string;
  roomId?: Room['id'] | null;
}

export function useRoomStats({ mode, roomId }: UseRoomStatsOptions) {
  const query = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoomById(roomId!),
    enabled: mode === 'multiplayer' && !!roomId,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchInterval: 5000,
  });

  return {
    room: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isPending: query.isPending,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
