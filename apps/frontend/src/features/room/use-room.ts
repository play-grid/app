import type { Room } from '@guess-logo/shared/schemas';
import type { CreateRoomPayload, CreateRoomResponse } from './room-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRoomSession } from '@/features/room/room-store';
import { createGameRoom, getRoomById, joinGameRoom } from './room-service';

interface UseCreateRoomProps {
  onSuccess?: (data: Room) => void;
}

export function useCreateRoom({ onSuccess }: UseCreateRoomProps = {}) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { setSession } = useRoomSession();

  return useMutation({
    mutationFn: async (payload: CreateRoomPayload): Promise<Room> => {
      const response = await createGameRoom(payload) as CreateRoomResponse;

      if (response.hostPlayer && response.credentials) {
        setSession({
          roomId: response.id,
          playerId: response.hostPlayer.id,
          playerName: response.hostPlayer.name,
          credentials: response.credentials,
          initialGameState: response.currentState || null,
        });
      }
      else {
        console.warn('No hostPlayer or credentials in response');
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
  const { setSession } = useRoomSession();

  return useMutation({
    mutationFn: async (variables: { roomId: string; playerName: string }): Promise<Room> => {
      const response = await joinGameRoom(variables.roomId, {
        playerName: variables.playerName,
      });

      if (response.player && response.credentials && variables.roomId) {
        setSession({
          roomId: variables.roomId,
          playerId: response.player.id,
          playerName: response.player.name,
          credentials: response.credentials,
          initialGameState: response.currentState || null,
        });
      }
      else {
        console.warn('No player or credentials in join response');
      }

      return response as Room;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
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
